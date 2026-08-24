import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', analyticsController.getSummary);
router.get('/evolution', analyticsController.getEvolution);
router.get('/distribution', analyticsController.getCategoryDistribution);

export default router;
