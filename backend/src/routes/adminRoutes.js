import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect entire admin routing with auth and admin role check
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.listUsers);
router.get('/categories', adminController.getSystemCategories);
router.post('/categories', adminController.createSystemCategory);
router.put('/categories/:id', adminController.updateSystemCategory);
router.delete('/categories/:id', adminController.deleteSystemCategory);

export default router;
