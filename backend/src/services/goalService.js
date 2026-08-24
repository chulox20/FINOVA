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
   * Create a new goal
   */
  async createGoal(userId, data) {
    const targetAmount = Number(data.target_amount);
    const currentAmount = Number(data.current_amount || 0);

    const res = await query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, account_id, color, icon, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        data.name,
        targetAmount,
        currentAmount,
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
      current_amount: Number(res.rows[0].current_amount),
      goal_contributions: [],
    };
  },

  /**
   * Update goal
   */
  async updateGoal(userId, goalId, updates) {
    const allowed = ['name', 'target_amount', 'current_amount', 'deadline', 'account_id', 'color', 'icon', 'status'];
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
   * Atomic Add Goal Contribution (Section 21: Goal + $250, Account - $250, Transaction record, inside BEGIN ... COMMIT)
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

      // 2. Insert contribution
      const contribDate = data.contribution_date || new Date().toISOString().split('T')[0];
      const contribRes = await client.query(
        `INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date, note)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [goalId, userId, numAmount, contribDate, data.note || `Aporte para ${goal.name}`]
      );

      // 3. Update goal current_amount
      const newCurrent = Number(goal.current_amount) + numAmount;
      const isCompleted = newCurrent >= Number(goal.target_amount);
      const newStatus = isCompleted ? 'completed' : goal.status;

      await client.query(
        `UPDATE goals
         SET current_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newCurrent, newStatus, goalId]
      );

      // 4. If account is specified, deduct amount and create transaction record
      const fundingAccountId = data.account_id || goal.account_id;
      if (fundingAccountId) {
        const accRes = await client.query(
          'SELECT id, name FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
          [fundingAccountId, userId]
        );
        if (accRes.rows.length > 0) {
          // Deduct from account balance
          await client.query(
            'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [numAmount, fundingAccountId]
          );

          // Record movement
          await client.query(
            `INSERT INTO transactions (user_id, account_id, type, description, amount, transaction_date, notes)
             VALUES ($1, $2, 'expense', $3, $4, $5, $6)`,
            [
              userId,
              fundingAccountId,
              `Aporte a meta: ${goal.name}`,
              numAmount,
              contribDate,
              data.note || 'Transferido a meta de ahorro',
            ]
          );
        }
      }

      return {
        contribution: { ...contribRes.rows[0], amount: numAmount },
        goal: { ...goal, current_amount: newCurrent, status: newStatus },
      };
    });
  }
};
