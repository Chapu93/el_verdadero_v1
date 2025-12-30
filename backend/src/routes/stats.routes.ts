import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/dashboard', statsController.getDashboardStats);
router.post('/invalidate-cache', requireRole('ADMIN'), statsController.invalidateStatsCache);

export default router;
