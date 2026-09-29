import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalBooks = await prisma.book.aggregate({ _sum: { quantity: true } });
    const availableBooks = await prisma.book.aggregate({ _sum: { availableCopies: true } });
    const issuedBooks = await prisma.book.aggregate({ _sum: { issuedCopies: true } });
    
    const totalStudents = await prisma.student.count();
    const overdueBooks = await prisma.bookIssue.count({ where: { status: 'OVERDUE' } });
    const pendingFinesAgg = await prisma.fine.aggregate({ 
      where: { status: 'UNPAID' },
      _sum: { amount: true } 
    });
    
    const reservedBooks = await prisma.reservation.count({ where: { status: 'WAITING' } });
    const purchaseRequests = await prisma.purchaseRequest.count({ where: { status: 'PENDING' } });
    const lostDamaged = await prisma.bookCondition.count({ where: { status: { in: ['LOST', 'DAMAGED'] } } });
    const seatBookings = await prisma.seatReservation.count({ where: { status: 'RESERVED' } });

    const mostBorrowed = await prisma.book.findMany({
      orderBy: { issuedCopies: 'desc' },
      take: 5,
      select: { title: true, issuedCopies: true }
    });

    const categoryDistributionRaw = await prisma.book.groupBy({
      by: ['categoryId'],
      _count: { _all: true }
    });

    const categories = await prisma.category.findMany();
    const categoryDistribution = categoryDistributionRaw.map(c => {
      const cat = categories.find(x => x.id === c.categoryId);
      return {
        name: cat?.name || 'Other',
        value: c._count._all
      };
    });

    res.json({
      totalBooks: totalBooks._sum.quantity || 0,
      availableBooks: availableBooks._sum.availableCopies || 0,
      issuedBooks: issuedBooks._sum.issuedCopies || 0,
      totalStudents,
      overdueBooks,
      pendingFines: pendingFinesAgg._sum.amount || 0,
      reservedBooks,
      purchaseRequests,
      lostDamaged,
      seatBookings,
      mostBorrowed,
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const getAdvancedAnalytics = async (req: Request, res: Response) => {
  try {
    // Top Active Students
    const mostActiveStudents = await prisma.readingActivity.findMany({
      orderBy: { totalBooksBorrowed: 'desc' },
      take: 5,
      include: { student: { include: { user: { select: { name: true } } } } }
    });

    // Department-wise Borrowing (Aggregated manually via issues)
    const students = await prisma.student.findMany({
      include: { _count: { select: { issues: true } } }
    });
    const departmentBorrowing: Record<string, number> = {};
    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if (!departmentBorrowing[dept]) departmentBorrowing[dept] = 0;
      departmentBorrowing[dept] += s._count.issues;
    });

    // Book Demand Prediction (Simple linear scaling based on past issues)
    const demandAnalysis = await prisma.book.findMany({
      take: 10,
      orderBy: { issuedCopies: 'desc' },
      select: { title: true, issuedCopies: true, availableCopies: true }
    });
    
    const predictions = demandAnalysis.map(book => {
      const estimatedNextMonth = Math.round(book.issuedCopies * 1.2); // Simple heuristic
      return {
        book: book.title,
        historical: book.issuedCopies,
        estimatedNextMonth,
        trend: estimatedNextMonth > book.issuedCopies ? 'Increasing' : 'Stable'
      };
    });

    res.json({
      mostActiveStudents: mostActiveStudents.map(a => ({
        name: a.student.user.name,
        totalBorrowed: a.totalBooksBorrowed
      })),
      departmentBorrowing: Object.entries(departmentBorrowing).map(([dept, count]) => ({ dept, count })),
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching advanced analytics' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 8,
      include: { user: { select: { name: true } } }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
};
