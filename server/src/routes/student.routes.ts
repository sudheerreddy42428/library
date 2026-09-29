import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, getMe } from '../controllers/student.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getStudents);
router.get('/me', authenticate, getMe);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorizeAdmin, createStudent);
router.put('/:id', authenticate, authorizeAdmin, updateStudent);

export default router;
