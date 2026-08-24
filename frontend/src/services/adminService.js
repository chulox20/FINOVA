import { apiClient } from './apiClient';

export const adminService = {
  async getAdminMetrics() {
    return await apiClient.get('/admin/metrics');
  },

  async listUsers() {
    return await apiClient.get('/admin/users');
  },

  async getDefaultCategories() {
    return await apiClient.get('/admin/categories');
  },

  async createDefaultCategory(data) {
    return await apiClient.post('/admin/categories', data);
  },

  async updateDefaultCategory(id, updates) {
    return await apiClient.put(`/admin/categories/${id}`, updates);
  },

  async deleteDefaultCategory(id) {
    return await apiClient.delete(`/admin/categories/${id}`);
  }
};
