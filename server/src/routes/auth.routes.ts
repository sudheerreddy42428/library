import { Router } from 'express';
import { login, registerLibrarian, registerStudent, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register/librarian', registerLibrarian);
router.post('/register/student', registerStudent);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
