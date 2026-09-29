import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: { select: { name: true, email: true, createdAt: true } } }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
        issues: { include: { book: true, fine: true } },
        reservations: { include: { book: true } },
        fines: true,
        readingActivity: true,
        seatReservations: { include: { seatOrRoom: true } },
        purchaseRequests: true,
        libraryCard: true
      }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student details' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        issues: { include: { book: true, fine: true } },
        reservations: { include: { book: true } },
        fines: true,
        readingActivity: true,
        seatReservations: { include: { seatOrRoom: true } },
        purchaseRequests: true,
        libraryCard: true
      }
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student details' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, studentId, department, year, phone, address } = req.body;
    
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    const existingStudentId = await prisma.student.findUnique({ where: { studentId } });
    if (existingStudentId) return res.status(400).json({ message: 'Student ID already exists' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            studentId,
            department,
            year,
            phone,
            address,
          }
        }
      },
      include: { student: true }
    });

    res.status(201).json(user.student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { name, department, year, phone, address, membershipStatus } = req.body;
    const id = Number(req.params.id);

    const student = await prisma.student.update({
      where: { id },
      data: {
        department,
        year,
        phone,
        address,
        membershipStatus,
        user: {
          update: {
            name
          }
        }
      }
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student' });
  }
};
