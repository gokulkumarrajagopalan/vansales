import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateJwt, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
router.put('/:id', OrderController.updateOrder);
router.post('/:id/approve', requireRole('ADMIN'), OrderController.approveOrder);
router.post('/:id/reject', requireRole('ADMIN'), OrderController.rejectOrder);
router.post('/:id/sync-tally', requireRole('ADMIN'), OrderController.syncTally);
router.delete('/:id', requireRole('ADMIN'), OrderController.deleteOrder);

export default router;
