import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/van-stock', authenticateJwt, StockController.getVanStock);
router.get('/catalog', authenticateJwt, StockController.getCatalog);

export default router;
