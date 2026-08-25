import { query, withTransaction } from '../db/pool.js';

export const accountService = {
  /**
   * Get all accounts for a specific user
   */
  async getAccounts(userId) {
    const res = await query(
      `SELECT id, user_id, name, type, balance::numeric, currency, color, icon, created_at, updated_at
       FROM accounts
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    return res.rows.map(r => ({ ...r, balance: Number(r.balance) }));
  },

  /**
   * Get single account by ID
   */
  async getAccountById(userId, accountId) {
    const res = await query(
      `SELECT id, user_id, name, type, balance::numeric, currency, color, icon, created_at, updated_at
       FROM accounts
       WHERE id = $1 AND user_id = $2`,
      [accountId, userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Cuenta no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return { ...res.rows[0], balance: Number(res.rows[0].balance) };
  },

  /**
   * Create a new account
   */
  async createAccount(userId, data) {
    const res = await query(
      `INSERT INTO accounts (user_id, name, type, balance, currency, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, name, type, balance::numeric, currency, color, icon, created_at, updated_at`,
      [
        userId,
        data.name,
        data.type,
        data.balance || 0,
        data.currency || 'USD',
        data.color || '#10b981',
        data.icon || 'landmark',
      ]
    );
    return { ...res.rows[0], balance: Number(res.rows[0].balance) };
  },

  /**
   * Update an account metadata (balance is strictly immutable here; only modified via transactions)
   */
  async updateAccount(userId, accountId, updates) {
    const allowed = ['name', 'type', 'currency', 'color', 'icon'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));

    if (keys.length === 0) return this.getAccountById(userId, accountId);

    const setClauses = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const values = keys.map(k => updates[k]);

    const res = await query(
      `UPDATE accounts
       SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, type, balance::numeric, currency, color, icon, created_at, updated_at`,
      [accountId, userId, ...values]
    );

    if (res.rows.length === 0) {
      const err = new Error('Cuenta no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return { ...res.rows[0], balance: Number(res.rows[0].balance) };
  },

  /**
   * Delete an account
   */
  async deleteAccount(userId, accountId) {
    const res = await query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [accountId, userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Cuenta no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, id: accountId };
  },

  /**
   * Atomic Funds Transfer with deterministic lock ordering (prevents deadlocks) and balance check
   */
  async transferFunds(userId, { fromAccountId, toAccountId, amount, description, date, notes }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      const err = new Error('El monto a transferir debe ser mayor a cero');
      err.statusCode = 400;
      throw err;
    }

    return await withTransaction(async (client) => {
      // Deterministic lock acquisition order (prevents concurrent deadlocks A->B & B->A)
      const [firstLockId, secondLockId] = fromAccountId < toAccountId
        ? [fromAccountId, toAccountId]
        : [toAccountId, fromAccountId];

      const lock1Res = await client.query(
        'SELECT id, name, type, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [firstLockId, userId]
      );
      const lock2Res = await client.query(
        'SELECT id, name, type, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [secondLockId, userId]
      );

      if (lock1Res.rows.length === 0 || lock2Res.rows.length === 0) {
        const err = new Error('Una o ambas cuentas no fueron encontradas o no pertenecen al usuario');
        err.statusCode = 404;
        throw err;
      }

      const fromAcc = fromAccountId === firstLockId ? lock1Res.rows[0] : lock2Res.rows[0];
      const toAcc = toAccountId === firstLockId ? lock1Res.rows[0] : lock2Res.rows[0];

      // Validate sufficient funds for non-credit accounts
      if (fromAcc.type !== 'credit_card' && Number(fromAcc.balance) < numAmount) {
        const err = new Error(
          `Fondos insuficientes en la cuenta "${fromAcc.name}". Saldo disponible: $${Number(fromAcc.balance).toFixed(2)}`
        );
        err.statusCode = 400;
        throw err;
      }

      // Deduct from source account
      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [numAmount, fromAccountId]
      );

      // Credit destination account
      await client.query(
        'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [numAmount, toAccountId]
      );

      // Create transfer transaction record
      const txDate = date || new Date().toISOString().split('T')[0];
      const txDesc = description || `Transferencia de ${fromAcc.name} a ${toAcc.name}`;

      const txRes = await client.query(
        `INSERT INTO transactions (user_id, account_id, to_account_id, type, description, amount, transaction_date, notes)
         VALUES ($1, $2, $3, 'transfer', $4, $5, $6, $7)
         RETURNING *`,
        [userId, fromAccountId, toAccountId, txDesc, numAmount, txDate, notes || null]
      );

      return {
        transaction: txRes.rows[0],
        fromAccount: { id: fromAccountId, newBalance: Number(fromAcc.balance) - numAmount },
        toAccount: { id: toAccountId, newBalance: Number(toAcc.balance) + numAmount },
      };
    });
  }
};
