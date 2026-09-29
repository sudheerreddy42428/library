import { Router } from 'express';
import { createRequest, getRequests, getMyRequests, updateRequestStatus } from '../controllers/purchaseRequest.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getRequests);
router.post('/', authenticate, createRequest);
router.get('/my-requests', authenticate, getMyRequests);
router.put('/:id/status', authenticate, authorizeAdmin, updateRequestStatus);

export default router;
