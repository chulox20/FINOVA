import { Router } from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', transactionController.getTransactions);
router.get('/export', transactionController.exportCSV);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
