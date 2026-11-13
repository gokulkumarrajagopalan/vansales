import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateJwt, CustomerController.getCustomers);
router.get('/:id/statement', authenticateJwt, CustomerController.getCustomerStatement);

export default router;
