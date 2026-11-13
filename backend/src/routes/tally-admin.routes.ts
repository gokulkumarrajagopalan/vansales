import { Router } from 'express';
import { TallyAdminController } from '../controllers/tally-admin.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sync-status', authenticateJwt, TallyAdminController.getSyncStatus);
router.post('/sync-now', authenticateJwt, TallyAdminController.syncNow);
router.get('/mappings', authenticateJwt, TallyAdminController.getMappings);
router.put('/mappings', authenticateJwt, TallyAdminController.updateMapping);

export default router;
