import { apiClient } from './apiClient';

export const goalService = {
  async getGoals() {
    return await apiClient.get('/goals');
  },

  async createGoal(data) {
    return await apiClient.post('/goals', data);
  },

  async updateGoal(id, updates) {
    return await apiClient.put(`/goals/${id}`, updates);
  },

  async deleteGoal(id) {
    return await apiClient.delete(`/goals/${id}`);
  },

  async addContribution(id, data) {
    return await apiClient.post(`/goals/${id}/contribute`, data);
  }
};
