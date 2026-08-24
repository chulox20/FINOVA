import pkg from 'pg';
const { Pool } = pkg;
import { env } from '../config/env.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el pool de PostgreSQL:', err.message);
});

/**
 * Execute a standard SQL query with query logging
 * @param {string} text
 * @param {Array} params
 */
export async function query(text, params = []) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development' && duration > 100) {
    console.log(`[SQL Query] (${duration}ms):`, text);
  }
  return res;
}

/**
 * Execute operations inside a strict PostgreSQL database transaction
 * (BEGIN ... COMMIT / ROLLBACK)
 * @param {Function} callback async (client) => Promise<any>
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
