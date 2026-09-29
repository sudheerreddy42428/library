import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';

export const reportCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { bookId, status, description, replacementCost, repairCost } = req.body;
    
    const condition = await prisma.bookCondition.create({
      data: {
        bookId: Number(bookId),
        status,
        description,
        replacementCost: replacementCost ? Number(replacementCost) : null,
        repairCost: repairCost ? Number(repairCost) : null,
        reportedById: req.user.id
      }
    });

    if (status === 'LOST' || status === 'DAMAGED') {
      await prisma.book.update({
        where: { id: Number(bookId) },
        data: { availableCopies: { decrement: 1 } }
      });
      // Further logic can link fine to student if currently issued
    }

    await logAudit(req.user.id, 'REPORT_BOOK_CONDITION', 'BookCondition', String(condition.id), `Marked book ${bookId} as ${status}`);

    res.status(201).json(condition);
  } catch (error) {
    res.status(500).json({ message: 'Error reporting book condition' });
  }
};

export const getConditions = async (req: Request, res: Response) => {
  try {
    const conditions = await prisma.bookCondition.findMany({
      include: { book: true },
      orderBy: { reportedAt: 'desc' }
    });
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conditions' });
  }
};

export const resolveCondition = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { action } = req.body; // e.g. "REPAIRED", "REPLACED"

    const condition = await prisma.bookCondition.update({
      where: { id },
      data: { resolvedAt: new Date() }
    });

    if (action === 'REPAIRED' || action === 'REPLACED') {
      await prisma.book.update({
        where: { id: condition.bookId },
        data: { availableCopies: { increment: 1 } }
      });
    }

    await logAudit(req.user.id, 'RESOLVE_BOOK_CONDITION', 'BookCondition', String(id), `Resolved condition ${id} via ${action}`);

    res.json(condition);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving condition' });
  }
};
