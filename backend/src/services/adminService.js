import { query } from '../db/pool.js';

export const adminService = {
  /**
   * Get Real Global Aggregated Metrics (Section 32 & 33)
   */
  async getGlobalMetrics() {
    const [usersCount, activeUsersCount, txCount, accountsCount, catCount, completedGoalsCount] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM users'),
      query("SELECT COUNT(*)::int as count FROM users WHERE last_seen_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')"),
      query('SELECT COUNT(*)::int as count FROM transactions'),
      query('SELECT COUNT(*)::int as count FROM accounts'),
      query('SELECT COUNT(*)::int as count FROM categories'),
      query("SELECT COUNT(*)::int as count FROM goals WHERE status = 'completed'"),
    ]);

    return {
      totalUsers: usersCount.rows[0].count,
      activeUsersMonthly: activeUsersCount.rows[0].count,
      totalTransactionsCount: txCount.rows[0].count,
      totalAccountsCount: accountsCount.rows[0].count,
      totalCategoriesCount: catCount.rows[0].count,
      completedGoalsCount: completedGoalsCount.rows[0].count,
      serverStatus: 'Operativo',
      databaseEngine: 'PostgreSQL (pg pool)',
    };
  },

  /**
   * List registered users without leaking passwords or financial records
   */
  async listUsers() {
    const res = await query(
      `SELECT id, full_name, email, role, currency, avatar_url, last_seen_at, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return res.rows;
  },

  /**
   * Get system default categories (user_id IS NULL)
   */
  async getSystemCategories() {
    const res = await query(
      `SELECT id, user_id, name, type, color, icon, is_default, created_at
       FROM categories
       WHERE is_default = true OR user_id IS NULL
       ORDER BY name ASC`
    );
    return res.rows;
  },

  /**
   * Create system default category
   */
  async createSystemCategory(data) {
    const res = await query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default)
       VALUES (NULL, $1, $2, $3, $4, true)
       RETURNING *`,
      [data.name, data.type, data.color || '#64748b', data.icon || 'tag']
    );
    return res.rows[0];
  },

  /**
   * Update system default category
   */
  async updateSystemCategory(categoryId, updates) {
    const allowed = ['name', 'type', 'color', 'icon'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));

    if (keys.length === 0) {
      const res = await query('SELECT * FROM categories WHERE id = $1', [categoryId]);
      return res.rows[0];
    }

    const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => updates[k]);

    const res = await query(
      `UPDATE categories
       SET ${setClauses}
       WHERE id = $1
       RETURNING *`,
      [categoryId, ...values]
    );

    if (res.rows.length === 0) {
      const err = new Error('Categoría del sistema no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  },

  /**
   * Delete system default category
   */
  async deleteSystemCategory(categoryId) {
    const res = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [categoryId]);
    if (res.rows.length === 0) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, id: categoryId };
  }
};
