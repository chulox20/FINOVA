import { calendarService } from '../services/calendarService.js';

export const calendarController = {
  async getMonthlyCalendar(req, res, next) {
    try {
      const now = new Date();
      const year = req.query.year || now.getFullYear();
      const month = req.query.month || (now.getMonth() + 1);

      const data = await calendarService.getMonthlyCalendarData(req.user.id, year, month);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
};
