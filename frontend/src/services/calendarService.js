import { apiClient } from './apiClient';

export const calendarService = {
  async getMonthlyCalendar(year, month) {
    return await apiClient.get('/calendar', { year, month });
  }
};
