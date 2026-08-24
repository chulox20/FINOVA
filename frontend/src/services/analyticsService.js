import { apiClient } from './apiClient';

export const analyticsService = {
  async getSummary(period = 'month') {
    return await apiClient.get('/analytics/summary', { period });
  },

  async getEvolution(months = 12) {
    return await apiClient.get('/analytics/evolution', { months });
  },

  async getCategoryDistribution(startDate, endDate) {
    return await apiClient.get('/analytics/distribution', { startDate, endDate });
  }
};
