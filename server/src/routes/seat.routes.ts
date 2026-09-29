import { Router } from 'express';
import { getSeats, createSeat, bookSeat, getMyBookings, cancelBooking } from '../controllers/seat.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getSeats);
router.post('/', authenticate, authorizeAdmin, createSeat);
router.post('/book', authenticate, bookSeat);
router.get('/my-bookings', authenticate, getMyBookings);
router.put('/:id/cancel', authenticate, cancelBooking);

export default router;
