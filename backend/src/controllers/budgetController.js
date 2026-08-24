import { budgetService } from '../services/budgetService.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
} from '../validators/budgetValidators.js';

export const budgetController = {
  async getBudgets(req, res, next) {
    try {
      const budgets = await budgetService.getBudgets(req.user.id);
      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  },

  async createBudget(req, res, next) {
    try {
      const validated = createBudgetSchema.parse(req.body);
      const created = await budgetService.createBudget(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Presupuesto creado con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const validated = updateBudgetSchema.parse(req.body);
      const updated = await budgetService.updateBudget(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Presupuesto actualizado',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBudget(req, res, next) {
    try {
      const result = await budgetService.deleteBudget(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Presupuesto eliminado con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
