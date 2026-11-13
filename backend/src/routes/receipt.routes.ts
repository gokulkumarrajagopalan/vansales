import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateJwt, ReceiptController.createReceipt);
router.get('/', authenticateJwt, ReceiptController.getReceipts);

export default router;
