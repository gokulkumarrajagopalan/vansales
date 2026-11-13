import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateJwt, InvoiceController.createInvoice);
router.get('/', authenticateJwt, InvoiceController.getInvoices);

export default router;
