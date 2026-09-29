import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getCategories);
router.post('/', authenticate, authorizeAdmin, createCategory);

export default router;
