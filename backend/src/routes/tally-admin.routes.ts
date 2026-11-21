import { Router } from 'express';
import { TallyAdminController } from '../controllers/tally-admin.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sync-status', authenticateJwt, TallyAdminController.getSyncStatus);
router.post('/sync-now', authenticateJwt, TallyAdminController.syncNow);
router.get('/mappings', authenticateJwt, TallyAdminController.getMappings);
router.put('/mappings', authenticateJwt, TallyAdminController.updateMapping);

// Dedicated Company API Token Management
router.get('/token', authenticateJwt, TallyAdminController.getToken);
router.post('/token/generate', authenticateJwt, TallyAdminController.generateToken);
router.post('/token/revoke', authenticateJwt, TallyAdminController.revokeToken);

export default router;
