import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { authenticateJwt, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.get('/', SettingsController.getSettings);
router.post('/', requireRole('ADMIN'), SettingsController.updateSetting);
router.get('/permissions', SettingsController.getPermissions);
router.post('/permissions', requireRole('ADMIN'), SettingsController.createPermission);
router.delete('/permissions/:id', requireRole('ADMIN'), SettingsController.deletePermission);
router.post('/truncate-transactions', requireRole('ADMIN'), SettingsController.truncateTransactions);

export default router;
