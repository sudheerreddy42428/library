import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { logAudit } from '../utils/audit';
import { sendNotification } from '../utils/notification';

export const getSeats = async (req: Request, res: Response) => {
  try {
    const seats = await prisma.seatOrRoom.findMany();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seats' });
  }
};

export const createSeat = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, capacity, status } = req.body;
    const seat = await prisma.seatOrRoom.create({
      data: { name, type, capacity, status }
    });
    
    await logAudit(req.user.id, 'CREATE_SEAT', 'SeatOrRoom', String(seat.id), `Created ${type} ${name}`);
    res.status(201).json(seat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating seat' });
  }
};

export const bookSeat = async (req: AuthRequest, res: Response) => {
  try {
    const { seatOrRoomId, date, startTime, endTime } = req.body;
    
    // Check overlaps
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    const overlap = await prisma.seatReservation.findFirst({
      where: {
        seatOrRoomId: Number(seatOrRoomId),
        reservationDate: new Date(date),
        status: { in: ['RESERVED', 'OCCUPIED'] },
        OR: [
          { startTime: { lte: end }, endTime: { gte: start } }
        ]
      }
    });

    if (overlap) {
      return res.status(400).json({ message: 'Time slot is already booked.' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(400).json({ message: 'Student profile not found.' });

    const reservation = await prisma.seatReservation.create({
      data: {
        studentId: student.id,
        seatOrRoomId: Number(seatOrRoomId),
        reservationDate: new Date(date),
        startTime: start,
        endTime: end
      }
    });

    await logAudit(req.user.id, 'BOOK_SEAT', 'SeatReservation', String(reservation.id), `Booked seat ${seatOrRoomId}`);
    await sendNotification(student.id, 'SEAT_CONFIRMED', `Your seat booking for ${date} is confirmed.`);

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking seat' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(400).json({ message: 'Student profile not found' });
    
    const bookings = await prisma.seatReservation.findMany({
      where: { studentId: student.id },
      include: { seatOrRoom: true },
      orderBy: { reservationDate: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.seatReservation.findUnique({ where: { id }, include: { student: true } });
    
    if (!booking || (booking.student.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.seatReservation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    await logAudit(req.user.id, 'CANCEL_SEAT_BOOKING', 'SeatReservation', String(id), `Cancelled booking ${id}`);
    await sendNotification(booking.studentId, 'SEAT_CANCELLED', `Your seat booking for ${booking.reservationDate.toISOString().split('T')[0]} was cancelled.`);

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};
