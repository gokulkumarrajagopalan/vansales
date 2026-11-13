import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJwt, rateLimitAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', rateLimitAuth, AuthController.login);
router.get('/me', authenticateJwt, AuthController.me);

export default router;
