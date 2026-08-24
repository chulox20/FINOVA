import { transactionService } from '../services/transactionService.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
} from '../validators/transactionValidators.js';

export const transactionController = {
  async getTransactions(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const transactions = await transactionService.getTransactions(req.user.id, filters);
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  },

  async createTransaction(req, res, next) {
    try {
      const validated = createTransactionSchema.parse(req.body);
      const created = await transactionService.createTransaction(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Movimiento registrado con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTransaction(req, res, next) {
    try {
      const validated = updateTransactionSchema.parse(req.body);
      const updated = await transactionService.updateTransaction(
        req.user.id,
        req.params.id,
        validated
      );
      res.status(200).json({
        success: true,
        message: 'Movimiento actualizado con éxito',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTransaction(req, res, next) {
    try {
      const result = await transactionService.deleteTransaction(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Movimiento eliminado y balance recalculado',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async exportCSV(req, res, next) {
    try {
      const filters = transactionFilterSchema.parse(req.query);
      const csv = await transactionService.exportTransactionsCSV(req.user.id, filters);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=finova-movimientos.csv');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
};
