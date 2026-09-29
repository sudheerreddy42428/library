import { Router } from 'express';
import { getFines, payFine, waiveFine } from '../controllers/fine.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getFines);
router.post('/:id/pay', authenticate, authorizeAdmin, payFine);
router.post('/:id/waive', authenticate, authorizeAdmin, waiveFine);

export default router;
