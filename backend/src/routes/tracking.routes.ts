import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller.js';
import { authenticateJwt, optionalJwt } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Mobile app / device telemetry ingest (supports Bearer token or plain JSON payload)
router.post('/ping', optionalJwt, TrackingController.recordPing);

// 2. Live fleet position retrieval
router.get('/live', optionalJwt, TrackingController.getLiveFleet);

// 3. Historical GPS trail for a van
router.get('/history/:userId', authenticateJwt, TrackingController.getHistory);

// 4. Test harness step simulation
router.post('/simulate-step', authenticateJwt, TrackingController.simulateStep);

export default router;
