import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const notifs = await notificationService.getNotifications(req.user.id);
      res.status(200).json({
        success: true,
        data: notifs,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Notificación eliminada',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
};
