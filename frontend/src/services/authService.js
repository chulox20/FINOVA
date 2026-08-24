import { apiClient } from './apiClient';

export const authService = {
  async register({ fullName, email, password, currency = 'USD' }) {
    const result = await apiClient.post('/auth/register', {
      fullName,
      email,
      password,
      currency,
    });
    if (result?.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  async login({ email, password }) {
    const result = await apiClient.post('/auth/login', {
      email,
      password,
    });
    if (result?.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  async getMe() {
    return await apiClient.get('/auth/me');
  },

  async updateProfile(updates) {
    return await apiClient.put('/auth/profile', updates);
  },

  async changePassword(currentPassword, newPassword) {
    return await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email) {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  logout() {
    apiClient.setToken(null);
  }
};
