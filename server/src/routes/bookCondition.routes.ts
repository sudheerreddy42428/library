import { Router } from 'express';
import { reportCondition, getConditions, resolveCondition } from '../controllers/bookCondition.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getConditions);
router.post('/', authenticate, authorizeAdmin, reportCondition);
router.put('/:id/resolve', authenticate, authorizeAdmin, resolveCondition);

export default router;
