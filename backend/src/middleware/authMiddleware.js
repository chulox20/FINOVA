import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: Token de sesión requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Verify user still exists in database
    const userRes = await query(
      'SELECT id, email, full_name, role, currency, avatar_url FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión expirada',
      });
    }

    req.user = userRes.rows[0];

    // Asynchronously update last_seen_at for active user KPI
    query('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1', [decoded.id]).catch(() => {});

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token de autenticación no válido',
    });
  }
}
