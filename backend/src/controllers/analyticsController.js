import { analyticsService } from '../services/analyticsService.js';

export const analyticsController = {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getFinancialSummary(req.user.id, req.query.period);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEvolution(req, res, next) {
    try {
      const months = parseInt(req.query.months, 10) || 12;
      const evolution = await analyticsService.getMonthlyEvolution(req.user.id, months);
      res.status(200).json({
        success: true,
        data: evolution,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategoryDistribution(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const distribution = await analyticsService.getCategoryDistribution(
        req.user.id,
        startDate,
        endDate
      );
      res.status(200).json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  }
};
