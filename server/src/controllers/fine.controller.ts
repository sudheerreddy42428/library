import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getFines = async (req: AuthRequest, res: Response) => {
  try {
    const fines = await prisma.fine.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        issue: { include: { book: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fines' });
  }
};

export const payFine = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { paymentMethod } = req.body;

    const fine = await prisma.fine.findUnique({ where: { id } });
    if (!fine || fine.status === 'PAID' || fine.status === 'WAIVED') {
      return res.status(400).json({ message: 'Invalid fine or already paid/waived' });
    }

    const updatedFine = await prisma.$transaction(async (tx) => {
      const result = await tx.fine.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod,
          recordedById: req.user.id
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'PAY_FINE',
          entity: 'Fine',
          entityId: String(result.id),
          description: `Fine ${result.id} paid for student ${result.studentId}`
        }
      });

      return result;
    });

    res.json(updatedFine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing fine payment' });
  }
};

export const waiveFine = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const fine = await prisma.fine.findUnique({ where: { id } });
    if (!fine || fine.status === 'PAID' || fine.status === 'WAIVED') {
      return res.status(400).json({ message: 'Invalid fine or already paid/waived' });
    }

    const updatedFine = await prisma.$transaction(async (tx) => {
      const result = await tx.fine.update({
        where: { id },
        data: {
          status: 'WAIVED',
          paymentDate: new Date(),
          paymentMethod: 'WAIVED',
          recordedById: req.user.id
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'WAIVE_FINE',
          entity: 'Fine',
          entityId: String(result.id),
          description: `Fine ${result.id} waived for student ${result.studentId}`
        }
      });

      return result;
    });

    res.json(updatedFine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing fine waiver' });
  }
};
