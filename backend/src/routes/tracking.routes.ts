import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateJwt);

// 1. Mobile app / device telemetry ingest
router.post('/ping', TrackingController.recordPing);

// 2. Live fleet position retrieval
router.get('/live', TrackingController.getLiveFleet);

// 3. Historical GPS trail for a van
router.get('/history/:userId', TrackingController.getHistory);

// 4. Test harness step simulation
router.post('/simulate-step', TrackingController.simulateStep);

export default router;
