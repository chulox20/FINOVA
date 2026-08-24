import { query } from '../db/pool.js';

export const categoryService = {
  /**
   * Get all categories available for user (System defaults + user custom)
   */
  async getCategories(userId) {
    const res = await query(
      `SELECT id, user_id, name, type, color, icon, is_default, created_at
       FROM categories
       WHERE is_default = true OR user_id = $1
       ORDER BY is_default DESC, name ASC`,
      [userId]
    );
    return res.rows;
  },

  /**
   * Create custom category
   */
  async createCategory(userId, data) {
    const res = await query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [userId, data.name, data.type, data.color || '#64748b', data.icon || 'tag']
    );
    return res.rows[0];
  },

  /**
   * Update custom category
   */
  async updateCategory(userId, categoryId, updates) {
    const allowed = ['name', 'type', 'color', 'icon'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));

    if (keys.length === 0) {
      const res = await query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [categoryId, userId]);
      return res.rows[0];
    }

    const setClauses = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const values = keys.map(k => updates[k]);

    const res = await query(
      `UPDATE categories
       SET ${setClauses}
       WHERE id = $1 AND user_id = $2 AND is_default = false
       RETURNING *`,
      [categoryId, userId, ...values]
    );

    if (res.rows.length === 0) {
      const err = new Error('Categoría no encontrada o no tienes permisos para modificarla');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  },

  /**
   * Delete custom category
   */
  async deleteCategory(userId, categoryId) {
    const res = await query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 AND is_default = false RETURNING id',
      [categoryId, userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Categoría no encontrada o es una categoría predeterminada del sistema');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, id: categoryId };
  }
};
