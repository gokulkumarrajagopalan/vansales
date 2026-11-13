import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/open', authenticateJwt, ShiftController.openShift);
router.post('/close', authenticateJwt, ShiftController.closeShift);
router.get('/current', authenticateJwt, ShiftController.getCurrentShift);

export default router;
