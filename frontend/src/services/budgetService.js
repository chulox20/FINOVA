import { apiClient } from './apiClient';

export const budgetService = {
  async getBudgets() {
    return await apiClient.get('/budgets');
  },

  async createBudget(data) {
    return await apiClient.post('/budgets', data);
  },

  async updateBudget(id, updates) {
    return await apiClient.put(`/budgets/${id}`, updates);
  },

  async deleteBudget(id) {
    return await apiClient.delete(`/budgets/${id}`);
  }
};
