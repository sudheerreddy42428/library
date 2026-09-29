import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';
import { sendNotification } from '../utils/notification';

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, isbn, category, reason, description } = req.body;
    
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(400).json({ message: 'Student not found' });

    // Check duplicate pending
    const existing = await prisma.purchaseRequest.findFirst({
      where: {
        title,
        status: { in: ['PENDING', 'APPROVED', 'PURCHASED'] }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'A similar request is already in progress.' });
    }

    const pr = await prisma.purchaseRequest.create({
      data: {
        studentId: student.id,
        title,
        author,
        isbn,
        category,
        reason,
        description
      }
    });

    await logAudit(req.user.id, 'CREATE_PURCHASE_REQUEST', 'PurchaseRequest', String(pr.id), `Requested ${title}`);

    res.status(201).json(pr);
  } catch (error) {
    res.status(500).json({ message: 'Error creating purchase request' });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(400).json({ message: 'Student not found' });

    const requests = await prisma.purchaseRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const id = Number(req.params.id);

    const pr = await prisma.purchaseRequest.update({
      where: { id },
      data: { status }
    });

    await logAudit(req.user.id, 'UPDATE_PURCHASE_REQUEST', 'PurchaseRequest', String(id), `Updated PR status to ${status}`);
    await sendNotification(pr.studentId, 'PURCHASE_REQUEST_UPDATED', `Your request for '${pr.title}' is now ${status}.`);

    res.json(pr);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request' });
  }
};
