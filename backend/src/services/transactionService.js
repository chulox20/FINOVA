import { query, withTransaction } from '../db/pool.js';

export const transactionService = {
  /**
   * Get transactions with filtering and pagination
   */
  async getTransactions(userId, filters = {}) {
    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (filters.type && filters.type !== 'all') {
      conditions.push(`t.type = $${paramIndex}`);
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.category_id && filters.category_id !== 'all') {
      conditions.push(`t.category_id = $${paramIndex}`);
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.account_id && filters.account_id !== 'all') {
      conditions.push(`(t.account_id = $${paramIndex} OR t.to_account_id = $${paramIndex})`);
      params.push(filters.account_id);
      paramIndex++;
    }

    if (filters.startDate) {
      conditions.push(`t.transaction_date >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      conditions.push(`t.transaction_date <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.search) {
      conditions.push(`(t.description ILIKE $${paramIndex} OR t.notes ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.minAmount) {
      conditions.push(`t.amount >= $${paramIndex}`);
      params.push(Number(filters.minAmount));
      paramIndex++;
    }

    if (filters.maxAmount) {
      conditions.push(`t.amount <= $${paramIndex}`);
      params.push(Number(filters.maxAmount));
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT 
        t.id, t.user_id, t.account_id, t.to_account_id, t.category_id,
        t.type, t.description, t.amount::numeric, t.transaction_date, t.notes, t.created_at,
        row_to_json(a.*) as account,
        row_to_json(to_a.*) as to_account,
        row_to_json(c.*) as category
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts to_a ON t.to_account_id = to_a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `;

    const res = await query(sql, params);
    return res.rows.map(r => ({
      ...r,
      amount: Number(r.amount),
    }));
  },

  /**
   * Atomic Create Transaction with balance verification (Section 17: BEGIN -> INSERT tx -> UPDATE account.balance -> COMMIT)
   */
  async createTransaction(userId, data) {
    const numAmount = Number(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      const err = new Error('El monto debe ser mayor a cero');
      err.statusCode = 400;
      throw err;
    }

    return await withTransaction(async (client) => {
      // 1. Verify and lock source account
      const accRes = await client.query(
        'SELECT id, name, type, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [data.account_id, userId]
      );
      if (accRes.rows.length === 0) {
        const err = new Error('Cuenta no encontrada o no pertenece al usuario');
        err.statusCode = 404;
        throw err;
      }
      const sourceAcc = accRes.rows[0];

      // 2. If transfer or expense, verify sufficient funds on non-credit accounts
      if ((data.type === 'expense' || data.type === 'transfer') && sourceAcc.type !== 'credit_card') {
        if (Number(sourceAcc.balance) < numAmount) {
          const err = new Error(
            `Fondos insuficientes en la cuenta "${sourceAcc.name}". Saldo disponible: $${Number(sourceAcc.balance).toFixed(2)}`
          );
          err.statusCode = 400;
          throw err;
        }
      }

      // 3. If transfer, verify destination account
      if (data.type === 'transfer') {
        if (!data.to_account_id) {
          const err = new Error('Las transferencias requieren una cuenta de destino');
          err.statusCode = 400;
          throw err;
        }
        const toRes = await client.query(
          'SELECT id, name, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
          [data.to_account_id, userId]
        );
        if (toRes.rows.length === 0) {
          const err = new Error('Cuenta de destino no encontrada o no pertenece al usuario');
          err.statusCode = 404;
          throw err;
        }
      }

      // 4. Insert transaction
      const txRes = await client.query(
        `INSERT INTO transactions (user_id, account_id, to_account_id, category_id, type, description, amount, transaction_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          userId,
          data.account_id,
          data.type === 'transfer' ? data.to_account_id : null,
          data.type === 'transfer' ? null : (data.category_id || null),
          data.type,
          data.description,
          numAmount,
          data.transaction_date || new Date().toISOString().split('T')[0],
          data.notes || null,
        ]
      );

      // 5. Update account balances
      if (data.type === 'expense') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [numAmount, data.account_id]);
      } else if (data.type === 'income') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [numAmount, data.account_id]);
      } else if (data.type === 'transfer') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [numAmount, data.account_id]);
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [numAmount, data.to_account_id]);
      }

      // Fetch enriched transaction
      const enrichedRes = await client.query(
        `SELECT 
          t.id, t.user_id, t.account_id, t.to_account_id, t.category_id,
          t.type, t.description, t.amount::numeric, t.transaction_date, t.notes, t.created_at,
          row_to_json(a.*) as account,
          row_to_json(to_a.*) as to_account,
          row_to_json(c.*) as category
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN accounts to_a ON t.to_account_id = to_a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1`,
        [txRes.rows[0].id]
      );

      return {
        ...enrichedRes.rows[0],
        amount: Number(enrichedRes.rows[0].amount),
      };
    });
  },

  /**
   * Atomic Update Transaction (Section 18: Revert old impact + apply new impact in single DB transaction with ownership & balance checks)
   */
  async updateTransaction(userId, transactionId, updates) {
    return await withTransaction(async (client) => {
      // 1. Get current transaction with row lock
      const oldTxRes = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [transactionId, userId]
      );
      if (oldTxRes.rows.length === 0) {
        const err = new Error('Movimiento no encontrado');
        err.statusCode = 404;
        throw err;
      }
      const oldTx = oldTxRes.rows[0];
      const oldAmount = Number(oldTx.amount);

      // 2. Revert old balance impact first
      if (oldTx.type === 'expense') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [oldAmount, oldTx.account_id]);
      } else if (oldTx.type === 'income') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [oldAmount, oldTx.account_id]);
      } else if (oldTx.type === 'transfer') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [oldAmount, oldTx.account_id]);
        if (oldTx.to_account_id) {
          await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [oldAmount, oldTx.to_account_id]);
        }
      }

      // 3. Resolve target accounts & validate ownership
      const newAccountId = updates.account_id || oldTx.account_id;
      const newToAccountId = updates.to_account_id !== undefined ? updates.to_account_id : oldTx.to_account_id;
      const newCategoryId = updates.category_id !== undefined ? updates.category_id : oldTx.category_id;
      const newType = updates.type || oldTx.type;
      const newDescription = updates.description || oldTx.description;
      const newAmount = updates.amount !== undefined ? Number(updates.amount) : oldAmount;
      const newDate = updates.transaction_date || oldTx.transaction_date;
      const newNotes = updates.notes !== undefined ? updates.notes : oldTx.notes;

      // Validate new primary account belongs to user
      const accRes = await client.query(
        'SELECT id, name, type, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [newAccountId, userId]
      );
      if (accRes.rows.length === 0) {
        const err = new Error('La cuenta seleccionada no existe o no pertenece al usuario');
        err.statusCode = 404;
        throw err;
      }
      const targetAcc = accRes.rows[0];

      // Validate sufficient funds on non-credit accounts after reversion
      if ((newType === 'expense' || newType === 'transfer') && targetAcc.type !== 'credit_card') {
        if (Number(targetAcc.balance) < newAmount) {
          const err = new Error(
            `Fondos insuficientes en la cuenta "${targetAcc.name}". Saldo disponible: $${Number(targetAcc.balance).toFixed(2)}`
          );
          err.statusCode = 400;
          throw err;
        }
      }

      // Validate destination account if transfer
      if (newType === 'transfer') {
        if (!newToAccountId) {
          const err = new Error('Las transferencias requieren una cuenta de destino');
          err.statusCode = 400;
          throw err;
        }
        const toRes = await client.query(
          'SELECT id, name, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
          [newToAccountId, userId]
        );
        if (toRes.rows.length === 0) {
          const err = new Error('La cuenta de destino no existe o no pertenece al usuario');
          err.statusCode = 404;
          throw err;
        }
      }

      // 4. Apply new balance impact
      if (newType === 'expense') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newAmount, newAccountId]);
      } else if (newType === 'income') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newAmount, newAccountId]);
      } else if (newType === 'transfer') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newAmount, newAccountId]);
        if (newToAccountId) {
          await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newAmount, newToAccountId]);
        }
      }

      // 5. Update transaction row
      await client.query(
        `UPDATE transactions
         SET account_id = $1, to_account_id = $2, category_id = $3, type = $4, description = $5, amount = $6, transaction_date = $7, notes = $8
         WHERE id = $9 AND user_id = $10`,
        [newAccountId, newToAccountId, newCategoryId, newType, newDescription, newAmount, newDate, newNotes, transactionId, userId]
      );

      // Return enriched
      const enrichedRes = await client.query(
        `SELECT 
          t.id, t.user_id, t.account_id, t.to_account_id, t.category_id,
          t.type, t.description, t.amount::numeric, t.transaction_date, t.notes, t.created_at,
          row_to_json(a.*) as account,
          row_to_json(to_a.*) as to_account,
          row_to_json(c.*) as category
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN accounts to_a ON t.to_account_id = to_a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1`,
        [transactionId]
      );

      return {
        ...enrichedRes.rows[0],
        amount: Number(enrichedRes.rows[0].amount),
      };
    });
  },

  /**
   * Atomic Delete Transaction (Section 19: Revert balance impact + DELETE tx)
   */
  async deleteTransaction(userId, transactionId) {
    return await withTransaction(async (client) => {
      // 1. Lock and find transaction
      const txRes = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [transactionId, userId]
      );
      if (txRes.rows.length === 0) {
        const err = new Error('Movimiento no encontrado');
        err.statusCode = 404;
        throw err;
      }

      const tx = txRes.rows[0];
      const amt = Number(tx.amount);

      // 2. Revert account balances
      if (tx.type === 'expense') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [amt, tx.account_id]);
      } else if (tx.type === 'income') {
        await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [amt, tx.account_id]);
      } else if (tx.type === 'transfer') {
        await client.query('UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [amt, tx.account_id]);
        if (tx.to_account_id) {
          await client.query('UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [amt, tx.to_account_id]);
        }
      }

      // 3. Delete transaction
      await client.query('DELETE FROM transactions WHERE id = $1', [transactionId]);

      return { success: true, id: transactionId };
    });
  },

  /**
   * Export transactions as CSV string
   */
  async exportTransactionsCSV(userId, filters = {}) {
    const transactions = await this.getTransactions(userId, filters);

    const headers = ['fecha', 'descripcion', 'categoria', 'cuenta', 'tipo', 'monto', 'notas'];
    const rows = transactions.map(t => {
      const date = t.transaction_date || '';
      const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const cat = `"${(t.category?.name || 'Sin categoría').replace(/"/g, '""')}"`;
      const acc = `"${(t.account?.name || 'Cuenta').replace(/"/g, '""')}"`;
      const type = t.type;
      const amount = t.amount;
      const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;

      return [date, desc, cat, acc, type, amount, notes].join(',');
    });

    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }
};
