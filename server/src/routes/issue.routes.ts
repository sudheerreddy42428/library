import { Router } from 'express';
import { issueBook, returnBook, getIssues, renewBook } from '../controllers/issue.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getIssues);
router.post('/', authenticate, authorizeAdmin, issueBook);
router.post('/:id/return', authenticate, authorizeAdmin, returnBook);
router.post('/:id/renew', authenticate, renewBook);

export default router;
