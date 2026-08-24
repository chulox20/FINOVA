import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { env } from '../config/env.js';

export const authService = {
  /**
   * Register a new user
   */
  async register({ fullName, email, password, currency = 'USD' }) {
    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const err = new Error('Ya existe una cuenta registrada con este correo electrónico');
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Default avatar
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const insertRes = await query(
      `INSERT INTO users (full_name, email, password_hash, avatar_url, role, currency, last_seen_at)
       VALUES ($1, $2, $3, $4, 'user', $5, CURRENT_TIMESTAMP)
       RETURNING id, full_name, email, role, currency, avatar_url, phone, decimal_format, week_start, budget_alerts, goal_notifications, weekly_summary, created_at`,
      [fullName, email, passwordHash, defaultAvatar, currency]
    );

    const user = insertRes.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return { user, token };
  },

  /**
   * Login user
   */
  async login({ email, password }) {
    const res = await query(
      `SELECT id, full_name, email, password_hash, role, currency, avatar_url, phone, decimal_format, week_start, budget_alerts, goal_notifications, weekly_summary, created_at
       FROM users WHERE email = $1`,
      [email]
    );

    if (res.rows.length === 0) {
      const err = new Error('Credenciales incorrectas: Correo o contraseña inválidos');
      err.statusCode = 401;
      throw err;
    }

    const user = res.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const err = new Error('Credenciales incorrectas: Correo o contraseña inválidos');
      err.statusCode = 401;
      throw err;
    }

    // Update last_seen_at
    await query('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Don't return password_hash to client
    delete user.password_hash;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return { user, token };
  },

  /**
   * Get authenticated profile
   */
  async getProfile(userId) {
    const res = await query(
      `SELECT id, full_name, email, role, currency, avatar_url, phone, decimal_format, week_start, budget_alerts, goal_notifications, weekly_summary, last_seen_at, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    return res.rows[0];
  },

  /**
   * Update profile
   */
  async updateProfile(userId, updates) {
    const allowedFields = [
      'full_name', 'phone', 'avatar_url', 'currency',
      'decimal_format', 'week_start', 'budget_alerts',
      'goal_notifications', 'weekly_summary'
    ];

    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
    if (keys.length === 0) return this.getProfile(userId);

    const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => updates[k]);

    const res = await query(
      `UPDATE users
       SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, full_name, email, role, currency, avatar_url, phone, decimal_format, week_start, budget_alerts, goal_notifications, weekly_summary, created_at`,
      [userId, ...values]
    );

    return res.rows[0];
  },

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const res = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) {
      const err = new Error('Usuario no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const match = await bcrypt.compare(currentPassword, res.rows[0].password_hash);
    if (!match) {
      const err = new Error('La contraseña actual es incorrecta');
      err.statusCode = 400;
      throw err;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);

    return { message: 'Contraseña actualizada con éxito' };
  },

  /**
   * Forgot password request
   */
  async forgotPassword(email) {
    const res = await query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    // For security reasons, don't reveal whether user exists
    return {
      message: 'Si el correo está registrado, se han enviado las instrucciones para restablecer la contraseña.',
    };
  }
};
