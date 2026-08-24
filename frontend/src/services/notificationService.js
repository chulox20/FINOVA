import { apiClient } from './apiClient';

export const notificationService = {
  async getNotifications() {
    return await apiClient.get('/notifications');
  },

  async markAsRead(id) {
    return await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return await apiClient.put('/notifications/read-all');
  },

  async deleteNotification(id) {
    return await apiClient.delete(`/notifications/${id}`);
  }
};
