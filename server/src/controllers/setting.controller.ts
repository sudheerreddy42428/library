import { Request, Response } from 'express';
import prisma from '../prisma';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let setting = await prisma.systemSetting.findFirst();
    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {}
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { maxBooksPerStudent, loanPeriodDays, fineRatePerDay } = req.body;
    let setting = await prisma.systemSetting.findFirst();
    
    if (setting) {
      setting = await prisma.systemSetting.update({
        where: { id: setting.id },
        data: {
          maxBooksPerStudent: Number(maxBooksPerStudent),
          loanPeriodDays: Number(loanPeriodDays),
          fineRatePerDay: Number(fineRatePerDay)
        }
      });
    } else {
      setting = await prisma.systemSetting.create({
        data: {
          maxBooksPerStudent: Number(maxBooksPerStudent),
          loanPeriodDays: Number(loanPeriodDays),
          fineRatePerDay: Number(fineRatePerDay)
        }
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
};
