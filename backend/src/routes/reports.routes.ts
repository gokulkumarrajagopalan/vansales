import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard', authenticateJwt, ReportsController.getDashboardMetrics);
router.get('/daybook', authenticateJwt, ReportsController.getDaybook);

export default router;
