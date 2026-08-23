import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export const notificationService = {
  /**
   * Get all notifications for user
   */
  async getNotifications(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const notifs = localStore.get(localStore.keys.NOTIFICATIONS, []);
    return notifs.filter(n => n.user_id === userId);
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const notifs = localStore.get(localStore.keys.NOTIFICATIONS, []);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      localStore.set(localStore.keys.NOTIFICATIONS, notifs);
    }
    return true;
  },

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    }

    const notifs = localStore.get(localStore.keys.NOTIFICATIONS, []);
    const updated = notifs.map(n => n.user_id === userId ? { ...n, is_read: true } : n);
    localStore.set(localStore.keys.NOTIFICATIONS, updated);
    return true;
  },

  /**
   * Delete notification
   */
  async deleteNotification(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }

    const notifs = localStore.get(localStore.keys.NOTIFICATIONS, []);
    localStore.set(localStore.keys.NOTIFICATIONS, notifs.filter(n => n.id !== id));
    return true;
  },

  /**
   * Create notification
   */
  async createNotification(notifData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notifData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const notifs = localStore.get(localStore.keys.NOTIFICATIONS, []);
    const newNotif = {
      ...notifData,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    localStore.set(localStore.keys.NOTIFICATIONS, notifs);
    return newNotif;
  }
};
