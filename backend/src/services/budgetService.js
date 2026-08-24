import { query, withTransaction } from '../db/pool.js';

export const budgetService = {
  /**
   * Get all budgets for user with calculated progress and alert badges
   */
  async getBudgets(userId) {
    // 1. Fetch budgets
    const budgetsRes = await query(
      `SELECT id, user_id, name, period, amount::numeric, start_date, end_date, created_at
       FROM budgets
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );

    const budgets = budgetsRes.rows;
    if (budgets.length === 0) return [];

    // 2. Fetch category limits for all user budgets
    const budgetIds = budgets.map(b => b.id);
    const bcRes = await query(
      `SELECT bc.id, bc.budget_id, bc.category_id, bc.limit_amount::numeric,
              row_to_json(c.*) as category
       FROM budget_categories bc
       JOIN categories c ON bc.category_id = c.id
       WHERE bc.budget_id = ANY($1::uuid[])`,
      [budgetIds]
    );

    // 3. For each budget, compute actual spent from transactions
    const result = [];
    for (const b of budgets) {
      const bCats = bcRes.rows.filter(bc => bc.budget_id === b.id);

      // Get actual spent per category in this budget's timeframe
      const spentRes = await query(
        `SELECT category_id, COALESCE(SUM(amount), 0)::numeric as total_spent
         FROM transactions
         WHERE user_id = $1 AND type = 'expense' AND transaction_date >= $2 AND transaction_date <= $3
         GROUP BY category_id`,
        [userId, b.start_date, b.end_date]
      );

      const spentMap = {};
      spentRes.rows.forEach(r => {
        spentMap[r.category_id] = Number(r.total_spent);
      });

      const categoriesDetail = bCats.map(bc => {
        const spent = spentMap[bc.category_id] || 0;
        const limit = Number(bc.limit_amount);
        const remaining = Math.max(0, limit - spent);
        const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

        let status = 'normal';
        if (spent > limit) {
          status = 'exceeded';
        } else if (percentage >= 80) {
          status = 'warning';
        }

        return {
          ...bc,
          limit_amount: limit,
          spent: Number(spent.toFixed(2)),
          remaining: Number(remaining.toFixed(2)),
          percentage,
          status,
        };
      });

      const totalLimit = categoriesDetail.length > 0
        ? categoriesDetail.reduce((acc, c) => acc + c.limit_amount, 0)
        : Number(b.amount);

      const totalSpent = categoriesDetail.reduce((acc, c) => acc + c.spent, 0);
      const totalRemaining = Math.max(0, totalLimit - totalSpent);
      const totalPercentage = totalLimit > 0 ? Number(((totalSpent / totalLimit) * 100).toFixed(1)) : 0;

      let overallStatus = 'normal';
      if (totalSpent > totalLimit) {
        overallStatus = 'exceeded';
      } else if (totalPercentage >= 80) {
        overallStatus = 'warning';
      }

      // Generate alerts
      const alerts = [];
      for (const cat of categoriesDetail) {
        if (cat.status === 'exceeded') {
          alerts.push({
            id: `alert-exceeded-${cat.category_id}`,
            type: 'danger',
            categoryName: cat.category?.name || 'Categoría',
            message: `🔴 Has superado el presupuesto de ${cat.category?.name || 'esta categoría'} (${cat.percentage}% gastado).`,
          });
        } else if (cat.status === 'warning') {
          alerts.push({
            id: `alert-warning-${cat.category_id}`,
            type: 'warning',
            categoryName: cat.category?.name || 'Categoría',
            message: `⚠️ Has usado el ${cat.percentage}% de tu presupuesto de ${cat.category?.name || 'esta categoría'}.`,
          });
        }
      }

      result.push({
        ...b,
        amount: totalLimit,
        totalLimit,
        totalSpent: Number(totalSpent.toFixed(2)),
        totalRemaining: Number(totalRemaining.toFixed(2)),
        totalPercentage,
        overallStatus,
        budget_categories: categoriesDetail,
        categoriesDetail,
        alerts,
      });
    }

    return result;
  },

  /**
   * Create Budget with category limits
   */
  async createBudget(userId, data) {
    return await withTransaction(async (client) => {
      const totalAmount = data.categories.reduce((acc, c) => acc + Number(c.limit_amount), 0);

      const budgetRes = await client.query(
        `INSERT INTO budgets (user_id, name, period, amount, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, data.name, data.period || 'monthly', totalAmount, data.start_date, data.end_date]
      );

      const budget = budgetRes.rows[0];

      for (const cat of data.categories) {
        await client.query(
          `INSERT INTO budget_categories (budget_id, category_id, limit_amount)
           VALUES ($1, $2, $3)`,
          [budget.id, cat.category_id, Number(cat.limit_amount)]
        );
      }

      return budget;
    });
  },

  /**
   * Update Budget
   */
  async updateBudget(userId, budgetId, data) {
    return await withTransaction(async (client) => {
      const checkRes = await client.query('SELECT id FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, userId]);
      if (checkRes.rows.length === 0) {
        const err = new Error('Presupuesto no encontrado');
        err.statusCode = 404;
        throw err;
      }

      if (data.categories && data.categories.length > 0) {
        const totalAmount = data.categories.reduce((acc, c) => acc + Number(c.limit_amount), 0);
        await client.query(
          `UPDATE budgets
           SET name = COALESCE($1, name), period = COALESCE($2, period), amount = $3, start_date = COALESCE($4, start_date), end_date = COALESCE($5, end_date)
           WHERE id = $6 AND user_id = $7`,
          [data.name, data.period, totalAmount, data.start_date, data.end_date, budgetId, userId]
        );

        await client.query('DELETE FROM budget_categories WHERE budget_id = $1', [budgetId]);
        for (const cat of data.categories) {
          await client.query(
            'INSERT INTO budget_categories (budget_id, category_id, limit_amount) VALUES ($1, $2, $3)',
            [budgetId, cat.category_id, Number(cat.limit_amount)]
          );
        }
      } else {
        await client.query(
          `UPDATE budgets
           SET name = COALESCE($1, name), period = COALESCE($2, period), start_date = COALESCE($3, start_date), end_date = COALESCE($4, end_date)
           WHERE id = $5 AND user_id = $6`,
          [data.name, data.period, data.start_date, data.end_date, budgetId, userId]
        );
      }

      return { id: budgetId, success: true };
    });
  },

  /**
   * Delete Budget
   */
  async deleteBudget(userId, budgetId) {
    const res = await query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id', [budgetId, userId]);
    if (res.rows.length === 0) {
      const err = new Error('Presupuesto no encontrado');
      err.statusCode = 404;
      throw err;
    }
    return { success: true, id: budgetId };
  }
};
