import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller.js';

const router = Router();

router.get('/', VendorController.getVendors);
router.get('/:id', VendorController.getVendorById);
router.post('/', VendorController.createVendor);
router.put('/:id', VendorController.updateVendor);
router.delete('/:id', VendorController.deleteVendor);

export default router;
