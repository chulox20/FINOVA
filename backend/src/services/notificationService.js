import { query } from '../db/pool.js';

export const notificationService = {
  /**
   * Get all notifications for a user
   */
  async getNotifications(userId) {
    const res = await query(
      `SELECT id, user_id, type, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(userId, notificationId) {
    const res = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return res.rows[0];
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1`,
      [userId]
    );
    return { success: true };
  },

  /**
   * Delete notification
   */
  async deleteNotification(userId, notificationId) {
    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    return { success: true, id: notificationId };
  }
};
