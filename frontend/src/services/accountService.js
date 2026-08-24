import { apiClient } from './apiClient';

export const accountService = {
  async getAccounts() {
    return await apiClient.get('/accounts');
  },

  async getAccountById(id) {
    return await apiClient.get(`/accounts/${id}`);
  },

  async createAccount(data) {
    return await apiClient.post('/accounts', data);
  },

  async updateAccount(id, updates) {
    return await apiClient.put(`/accounts/${id}`, updates);
  },

  async deleteAccount(id) {
    return await apiClient.delete(`/accounts/${id}`);
  },

  async transferFunds({ fromAccountId, toAccountId, amount, description, date, notes }) {
    return await apiClient.post('/accounts/transfer', {
      fromAccountId,
      toAccountId,
      amount,
      description,
      date,
      notes,
    });
  }
};
