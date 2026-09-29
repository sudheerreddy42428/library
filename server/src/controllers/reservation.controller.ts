import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.body;
    
    // Allow only students to reserve for themselves in a real scenario
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(403).json({ message: 'Only students can reserve books' });
    }

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.availableCopies > 0) {
      return res.status(400).json({ message: 'Book is available. Please issue instead of reserving.' });
    }

    const existingReservation = await prisma.reservation.findFirst({
      where: { studentId: student.id, bookId: book.id, status: 'PENDING' }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'You have already reserved this book' });
    }

    const count = await prisma.reservation.count({
      where: { bookId: book.id, status: 'PENDING' }
    });

    const reservation = await prisma.reservation.create({
      data: {
        studentId: student.id,
        bookId: book.id,
        queuePosition: count + 1
      }
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation' });
  }
};

export const batchRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { bookIds } = req.body;
    
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: 'No books provided for request' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(403).json({ message: 'Only students can request books' });
    }

    // Check system limits
    const settings = await prisma.systemSetting.findFirst();
    const maxBooks = settings?.maxBooksPerStudent || 3;

    const currentIssues = await prisma.bookIssue.count({
      where: { studentId: student.id, status: 'ISSUED' }
    });

    if (currentIssues + bookIds.length > maxBooks) {
      return res.status(400).json({ message: `Cannot request ${bookIds.length} books. Your limit is ${maxBooks} and you have ${currentIssues} issued.` });
    }

    const results = await prisma.$transaction(async (tx) => {
      const createdReservations = [];

      for (const bId of bookIds) {
        const book = await tx.book.findUnique({ where: { id: Number(bId) } });
        if (!book) throw new Error(`Book with id ${bId} not found`);

        const existing = await tx.reservation.findFirst({
          where: { studentId: student.id, bookId: book.id, status: { in: ['WAITING', 'HELD'] } }
        });

        if (existing) {
          throw new Error(`You have already requested or reserved the book: ${book.title}`);
        }

        const count = await tx.reservation.count({
          where: { bookId: book.id, status: { in: ['WAITING', 'HELD'] } }
        });

        const reservation = await tx.reservation.create({
          data: {
            studentId: student.id,
            bookId: book.id,
            status: book.availableCopies > 0 ? 'HELD' : 'WAITING', // HELD means reserved for pickup
            queuePosition: count + 1
          }
        });
        createdReservations.push(reservation);
      }
      return createdReservations;
    });

    res.status(201).json(results);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error processing batch request' });
  }
};

export const getReservations = async (req: AuthRequest, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        book: { select: { title: true, isbn: true } }
      },
      orderBy: { reservationDate: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

export const updateReservationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., FULFILLED, CANCELLED

    if (!['PENDING', 'WAITING', 'HELD', 'COMPLETED', 'FULFILLED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: Number(id) } });
      if (!reservation) throw new Error('Reservation not found');
      
      const oldStatus = reservation.status;
      
      const updated = await tx.reservation.update({
        where: { id: Number(id) },
        data: { status }
      });
      
      if (status === 'FULFILLED' && ['WAITING', 'HELD', 'PENDING'].includes(oldStatus)) {
        // Find student to ensure they haven't reached max limits
        const student = await tx.student.findUnique({ 
          where: { id: reservation.studentId },
          include: { _count: { select: { issues: { where: { status: 'ISSUED' } } } } }
        });
        
        let settings = await tx.systemSetting.findFirst();
        const maxBooks = settings?.maxBooksPerStudent || 3;

        if (student && student._count.issues >= maxBooks) {
          throw new Error(`Student has reached the maximum allowed limit of ${maxBooks} books.`);
        }

        const book = await tx.book.findUnique({ where: { id: reservation.bookId } });
        if (!book || (oldStatus !== 'HELD' && book.availableCopies <= 0)) {
          throw new Error('Book currently unavailable');
        }

        // Issue the book
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days by default
        
        await tx.bookIssue.create({
          data: {
            studentId: reservation.studentId,
            bookId: reservation.bookId,
            dueDate,
            issuedById: req.user.id
          }
        });

        // If it was already HELD, availableCopies was not decremented when reserved (wait, let's check batchRequest)
        // In batchRequest, we just set status to HELD but DID NOT decrement availableCopies! 
        // We need to decrement availableCopies here, unless we decremented it on hold. 
        // batchRequest didn't decrement availableCopies! So we MUST decrement it here for both HELD and WAITING to FULFILLED.
        await tx.book.update({
          where: { id: reservation.bookId },
          data: {
            availableCopies: { decrement: 1 },
            issuedCopies: { increment: 1 }
          }
        });
      }
      
      // Note: If we added logic to decrement copies when status=HELD, we would restore it on CANCELLED.
      // But since we don't, CANCELLED just updates the reservation status.
      return updated;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating reservation status' });
  }
};
