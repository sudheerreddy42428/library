import { Router } from 'express';
import { getDashboardStats, getAdvancedAnalytics, getRecentActivity } from '../controllers/stat.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, authorizeAdmin, getDashboardStats);
router.get('/advanced', authenticate, authorizeAdmin, getAdvancedAnalytics);
router.get('/activity', authenticate, authorizeAdmin, getRecentActivity);

export default router;
