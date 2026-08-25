import pkg from 'pg';
const { Pool } = pkg;
import { env } from '../config/env.js';
import { memoryStore } from './memoryStore.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

let isPgConnected = null;

async function checkPgConnection() {
  if (isPgConnected !== null) return isPgConnected;
  try {
    const client = await pool.connect();
    client.release();
    isPgConnected = true;
    console.log('✅ Conexión establecida exitosamente con PostgreSQL en', env.DATABASE_URL);
    return true;
  } catch (err) {
    isPgConnected = false;
    if (env.ENABLE_MEMORY_FALLBACK && env.NODE_ENV !== 'production') {
      console.warn(`\n⚠️  [DEV MODE] PostgreSQL no detectado en ${env.DATABASE_URL} (${err.code || err.message}).`);
      console.log('⚡ ENABLE_MEMORY_FALLBACK=true: Activando motor temporal en memoria para desarrollo local.');
      console.log('🔒 En producción (ENABLE_MEMORY_FALLBACK=false), el servidor retornará error 503 si la base de datos se desconecta.\n');
      await memoryStore.init();
      return false;
    } else {
      console.error(`\n❌ Error de conexión a PostgreSQL: ${err.message}`);
      console.error('🔒 Fallback en memoria desactivado (ENABLE_MEMORY_FALLBACK=false). Las consultas fallarán con 503.\n');
      const dbErr = new Error('Base de datos PostgreSQL no disponible. Servicio temporalmente fuera de línea.');
      dbErr.statusCode = 503;
      throw dbErr;
    }
  }
}

/**
 * Execute query with strict PostgreSQL authority (or explicit dev fallback)
 */
export async function query(text, params = []) {
  const pgAlive = await checkPgConnection();
  if (pgAlive) {
    return await pool.query(text, params);
  }
  if (env.ENABLE_MEMORY_FALLBACK) {
    return await memoryStore.handleQuery(text, params);
  }
  const dbErr = new Error('Base de datos PostgreSQL no disponible');
  dbErr.statusCode = 503;
  throw dbErr;
}

/**
 * Execute withTransaction with PostgreSQL ACID transaction guarantees
 */
export async function withTransaction(callback) {
  const pgAlive = await checkPgConnection();
  if (pgAlive) {
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

  if (env.ENABLE_MEMORY_FALLBACK) {
    const clientMock = {
      query: (t, p) => memoryStore.handleQuery(t, p),
    };
    return await callback(clientMock);
  }

  const dbErr = new Error('Base de datos PostgreSQL no disponible para transacción');
  dbErr.statusCode = 503;
  throw dbErr;
}
