import { Router } from 'express';
import { calendarController } from '../controllers/calendarController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', calendarController.getMonthlyCalendar);

export default router;
