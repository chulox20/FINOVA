import { apiClient } from './apiClient';

export const transactionService = {
  async getTransactions(filters = {}) {
    return await apiClient.get('/transactions', filters);
  },

  async createTransaction(data) {
    return await apiClient.post('/transactions', data);
  },

  async updateTransaction(id, updates) {
    return await apiClient.put(`/transactions/${id}`, updates);
  },

  async deleteTransaction(id) {
    return await apiClient.delete(`/transactions/${id}`);
  },

  async exportCSV(filters = {}) {
    const csvContent = await apiClient.get('/transactions/export', filters);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finova-movimientos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
