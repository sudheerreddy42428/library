import { Router } from 'express';
import { createReservation, getReservations, batchRequest, updateReservationStatus } from '../controllers/reservation.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getReservations);
router.post('/', authenticate, createReservation); // Students can create
router.post('/batch', authenticate, batchRequest);
router.put('/:id/status', authenticate, authorizeAdmin, updateReservationStatus);

export default router;
