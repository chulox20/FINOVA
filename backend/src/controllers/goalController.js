import { goalService } from '../services/goalService.js';
import {
  createGoalSchema,
  updateGoalSchema,
  addContributionSchema,
} from '../validators/goalValidators.js';

export const goalController = {
  async getGoals(req, res, next) {
    try {
      const goals = await goalService.getGoals(req.user.id);
      res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  },

  async createGoal(req, res, next) {
    try {
      const validated = createGoalSchema.parse(req.body);
      const created = await goalService.createGoal(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'Meta de ahorro creada con éxito',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateGoal(req, res, next) {
    try {
      const validated = updateGoalSchema.parse(req.body);
      const updated = await goalService.updateGoal(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Meta actualizada',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      const result = await goalService.deleteGoal(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Meta eliminada con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async addContribution(req, res, next) {
    try {
      const validated = addContributionSchema.parse(req.body);
      const result = await goalService.addContribution(req.user.id, req.params.id, validated);
      res.status(200).json({
        success: true,
        message: 'Aporte registrado con éxito',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
