import { Router } from 'express';
import { getAuthors, createAuthor } from '../controllers/author.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAuthors);
router.post('/', authenticate, authorizeAdmin, createAuthor);

export default router;
