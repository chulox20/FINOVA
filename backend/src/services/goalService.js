import { query, withTransaction } from '../db/pool.js';

export const goalService = {
  /**
   * Get all goals for a user
   */
  async getGoals(userId) {
    const goalsRes = await query(
      `SELECT g.id, g.user_id, g.name, g.target_amount::numeric, g.current_amount::numeric,
              g.deadline, g.account_id, g.color, g.icon, g.status, g.created_at, g.updated_at,
              row_to_json(a.*) as account
       FROM goals g
       LEFT JOIN accounts a ON g.account_id = a.id
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC`,
      [userId]
    );

    const goals = goalsRes.rows;
    if (goals.length === 0) return [];

    const goalIds = goals.map(g => g.id);
    const contribsRes = await query(
      `SELECT id, goal_id, user_id, amount::numeric, contribution_date, note, created_at
       FROM goal_contributions
       WHERE goal_id = ANY($1::uuid[])
       ORDER BY contribution_date DESC, created_at DESC`,
      [goalIds]
    );

    return goals.map(g => ({
      ...g,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
      goal_contributions: contribsRes.rows
        .filter(c => c.goal_id === g.id)
        .map(c => ({ ...c, amount: Number(c.amount) })),
    }));
  },

  /**
   * Create a new goal (Initial current_amount is always strictly 0.00; funding only through contributions)
   */
  async createGoal(userId, data) {
    const targetAmount = Number(data.target_amount);

    const res = await query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
       VALUES ($1, $2, $3, 0.00, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        data.name,
        targetAmount,
        data.deadline || null,
        data.account_id || null,
        data.color || '#10b981',
        data.icon || 'target',
        data.status || 'active',
      ]
    );

    return {
      ...res.rows[0],
      target_amount: Number(res.rows[0].target_amount),
      current_amount: 0,
      goal_contributions: [],
    };
  },

  /**
   * Update goal metadata (current_amount is only modified via atomic contributions)
   */
  async updateGoal(userId, goalId, updates) {
    const allowed = ['name', 'target_amount', 'deadline', 'account_id', 'color', 'icon', 'status'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));

    if (keys.length === 0) {
      const res = await query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
      return res.rows[0];
    }

    const setClauses = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const values = keys.map(k => updates[k]);

    const res = await query(
      `UPDATE goals
       SET ${setClauses}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [goalId, userId, ...values]
    );

    if (res.rows.length === 0) {
      const err = new Error('Meta no encontrada');
      err.statusCode = 404;
      throw err;
    }

    return {
      ...res.rows[0],
      target_amount: Number(res.rows[0].target_amount),
      current_amount: Number(res.rows[0].current_amount),
    };
  },

  /**
   * Delete goal
   */
  async deleteGoal(userId, goalId) {
    const res = await query('DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id', [goalId, userId]);
    if (res.rows.length === 0) {
      const err = new Error('Meta no encontrada');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, id: goalId };
  },

  /**
   * Atomic Add Goal Contribution (Section 21: Mandatory Account Debit + Transaction + Goal increment in single ACID transaction)
   */
  async addContribution(userId, goalId, data) {
    const numAmount = Number(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      const err = new Error('El monto del aporte debe ser mayor a cero');
      err.statusCode = 400;
      throw err;
    }

    return await withTransaction(async (client) => {
      // 1. Lock and find goal
      const goalRes = await client.query(
        'SELECT * FROM goals WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [goalId, userId]
      );
      if (goalRes.rows.length === 0) {
        const err = new Error('Meta de ahorro no encontrada');
        err.statusCode = 404;
        throw err;
      }
      const goal = goalRes.rows[0];

      // 2. Resolve funding account (mandatory)
      const fundingAccountId = data.account_id || goal.account_id;
      if (!fundingAccountId) {
        const err = new Error('Debes seleccionar una cuenta bancaria de origen para fondear el aporte');
        err.statusCode = 400;
        throw err;
      }

      // 3. Lock and verify funding account
      const accRes = await client.query(
        'SELECT id, name, type, balance::numeric FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [fundingAccountId, userId]
      );
      if (accRes.rows.length === 0) {
        const err = new Error('La cuenta bancaria para el aporte no existe o no pertenece al usuario');
        err.statusCode = 404;
        throw err;
      }
      const fundingAcc = accRes.rows[0];

      // 4. Validate sufficient funds on non-credit account
      if (fundingAcc.type !== 'credit_card' && Number(fundingAcc.balance) < numAmount) {
        const err = new Error(
          `Fondos insuficientes en la cuenta "${fundingAcc.name}". Saldo disponible: $${Number(fundingAcc.balance).toFixed(2)}`
        );
        err.statusCode = 400;
        throw err;
      }

      // 5. Deduct from account balance
      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [numAmount, fundingAccountId]
      );

      // 6. Record financial movement in transactions table
      const contribDate = data.contribution_date || new Date().toISOString().split('T')[0];
      await client.query(
        `INSERT INTO transactions (user_id, account_id, type, description, amount, transaction_date, notes)
         VALUES ($1, $2, 'expense', $3, $4, $5, $6)`,
        [
          userId,
          fundingAccountId,
          `Aporte a meta: ${goal.name}`,
          numAmount,
          contribDate,
          data.note || `Aporte financiero a meta "${goal.name}"`,
        ]
      );

      // 7. Insert contribution record
      const contribRes = await client.query(
        `INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date, note)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [goalId, userId, numAmount, contribDate, data.note || `Aporte para ${goal.name}`]
      );

      // 8. Update goal current_amount and status
      const newCurrent = Number(goal.current_amount) + numAmount;
      const isCompleted = newCurrent >= Number(goal.target_amount);
      const newStatus = isCompleted ? 'completed' : goal.status;

      await client.query(
        `UPDATE goals
         SET current_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newCurrent, newStatus, goalId]
      );

      return {
        contribution: { ...contribRes.rows[0], amount: numAmount },
        goal: { ...goal, current_amount: newCurrent, status: newStatus },
        account: { id: fundingAccountId, newBalance: Number(fundingAcc.balance) - numAmount },
      };
    });
  }
};
