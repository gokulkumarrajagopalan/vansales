import { Router } from 'express';
import { AdvisoryController } from '../controllers/advisory.controller.js';

const router = Router();

router.get('/', AdvisoryController.getAdvisories);
router.post('/', AdvisoryController.createAdvisory);
router.put('/:id', AdvisoryController.updateAdvisory);
router.delete('/:id', AdvisoryController.deleteAdvisory);

export default router;
