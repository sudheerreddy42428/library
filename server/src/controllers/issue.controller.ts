import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { updateReadingActivityOnIssue, updateReadingActivityOnReturn } from '../utils/readingActivity';

export const issueBook = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, bookId, dueDate } = req.body;

    const student = await prisma.student.findUnique({ 
      where: { id: Number(studentId) },
      include: { _count: { select: { issues: { where: { status: 'ISSUED' } } } } }
    });
    if (!student || !student.membershipStatus) {
      return res.status(400).json({ message: 'Invalid or inactive student' });
    }

    let settings = await prisma.systemSetting.findFirst();
    const maxBooks = settings?.maxBooksPerStudent || 3;

    if (student._count.issues >= maxBooks) {
      return res.status(400).json({ message: `Student has reached the maximum allowed limit of ${maxBooks} books.` });
    }

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book currently unavailable' });
    }

    const issue = await prisma.$transaction(async (tx) => {
      const newIssue = await tx.bookIssue.create({
        data: {
          studentId: Number(studentId),
          bookId: Number(bookId),
          dueDate: new Date(dueDate),
          issuedById: req.user.id
        }
      });

      await tx.book.update({
        where: { id: Number(bookId) },
        data: {
          availableCopies: { decrement: 1 },
          issuedCopies: { increment: 1 }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'ISSUE_BOOK',
          entity: 'BookIssue',
          entityId: String(newIssue.id),
          description: `Issued book ${bookId} to student ${studentId}`
        }
      });

      return newIssue;
    });

    await updateReadingActivityOnIssue(Number(studentId));

    res.status(201).json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error issuing book' });
  }
};

export const returnBook = async (req: AuthRequest, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    
    const issue = await prisma.bookIssue.findUnique({ where: { id: issueId }, include: { book: true } });
    if (!issue || issue.status === 'RETURNED') {
      return res.status(400).json({ message: 'Invalid issue record or already returned' });
    }

    const returnDate = new Date();
    const dueDate = new Date(issue.dueDate);
    let lateDays = 0;
    
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    let settings = await prisma.systemSetting.findFirst();
    const finePerDay = settings?.fineRatePerDay || 5.0;
    const fineAmount = lateDays * finePerDay;

    const result = await prisma.$transaction(async (tx) => {
      const updatedIssue = await tx.bookIssue.update({
        where: { id: issueId },
        data: {
          status: 'RETURNED',
          returnDate
        }
      });

      await tx.book.update({
        where: { id: issue.bookId },
        data: {
          availableCopies: { increment: 1 },
          issuedCopies: { decrement: 1 }
        }
      });

      if (fineAmount > 0) {
        await tx.fine.create({
          data: {
            studentId: issue.studentId,
            issueId: issue.id,
            amount: fineAmount,
            lateDays
          }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'RETURN_BOOK',
          entity: 'BookIssue',
          entityId: String(updatedIssue.id),
          description: `Returned book ${issue.bookId} by student ${issue.studentId}`
        }
      });
      
      // Handle Reservation check
      const nextReservation = await tx.reservation.findFirst({
        where: { bookId: issue.bookId, status: 'PENDING' },
        orderBy: { queuePosition: 'asc' }
      });
      
      if (nextReservation) {
        await tx.notification.create({
          data: {
            studentId: nextReservation.studentId,
            message: `Reserved book ${issue.book.title} is now available.`,
            type: 'RESERVATION_AVAILABLE'
          }
        });
      }

      return updatedIssue;
    });

    await updateReadingActivityOnReturn(issue.studentId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error returning book' });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await prisma.bookIssue.findMany({
      include: {
        book: true,
        student: { include: { user: { select: { name: true, email: true } } } },
        fine: true
      },
      orderBy: { issueDate: 'desc' }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues' });
  }
};

export const renewBook = async (req: AuthRequest, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    
    const issue = await prisma.bookIssue.findUnique({
      where: { id: issueId },
      include: { book: true, student: true }
    });
    
    if (!issue || issue.status !== 'ISSUED') {
      return res.status(400).json({ message: 'Invalid issue record or book already returned.' });
    }

    if (issue.student.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const MAX_RENEWALS = 2;
    if (issue.renewalCount >= MAX_RENEWALS && req.user.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Maximum renewals reached.' });
    }
    
    const hasReservation = await prisma.reservation.findFirst({
      where: { bookId: issue.bookId, status: { in: ['WAITING', 'NOTIFIED', 'HELD'] } }
    });
    
    if (hasReservation && req.user.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Cannot renew: book is reserved by another student.' });
    }
    
    const oldDueDate = new Date(issue.dueDate);
    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7); // Add 7 days
    
    const updatedIssue = await prisma.$transaction(async (tx) => {
      const updated = await tx.bookIssue.update({
        where: { id: issueId },
        data: {
          dueDate: newDueDate,
          renewalCount: { increment: 1 },
          lastRenewedAt: new Date()
        }
      });
      
      await tx.bookRenewal.create({
        data: {
          issueId,
          oldDueDate,
          newDueDate
        }
      });
      
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'RENEW_BOOK',
          entity: 'BookIssue',
          entityId: String(issueId),
          description: `Renewed book ${issue.bookId} for student ${issue.studentId}`
        }
      });
      
      return updated;
    });

    res.json(updatedIssue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error renewing book' });
  }
};

