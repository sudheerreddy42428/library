import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/book.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getBooks);
router.get('/:id', authenticate, getBookById);
router.post('/', authenticate, authorizeAdmin, createBook);
router.put('/:id', authenticate, authorizeAdmin, updateBook);
router.delete('/:id', authenticate, authorizeAdmin, deleteBook);

export default router;
