import { query } from '../db/pool.js';

export const analyticsService = {
  /**
   * Get financial KPIs and monthly summary with PostgreSQL aggregations
   */
  async getFinancialSummary(userId, period = 'month') {
    // 1. Total balance of all accounts
    const totalBalanceRes = await query(
      'SELECT COALESCE(SUM(balance), 0)::numeric as net_worth FROM accounts WHERE user_id = $1',
      [userId]
    );
    const totalBalance = Number(totalBalanceRes.rows[0].net_worth);

    // 2. Date ranges for current month and previous month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const endOfCurrentMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayCurrentMonth).padStart(2, '0')}`;

    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const startOfPrevMonth = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const lastDayPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const endOfPrevMonth = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDayPrevMonth).padStart(2, '0')}`;

    // Current month sums
    const curRes = await query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as expense
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`,
      [userId, startOfCurrentMonth, endOfCurrentMonth]
    );

    const income = Number(curRes.rows[0].income);
    const expenses = Number(curRes.rows[0].expense);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Number(((netSavings / income) * 100).toFixed(1)) : 0;

    // Previous month sums for trend percentage
    const prevRes = await query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as expense
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`,
      [userId, startOfPrevMonth, endOfPrevMonth]
    );

    const prevIncome = Number(prevRes.rows[0].income);
    const prevExpenses = Number(prevRes.rows[0].expense);
    const prevNetSavings = prevIncome - prevExpenses;

    const incomeTrend = prevIncome > 0 ? Number((((income - prevIncome) / prevIncome) * 100).toFixed(1)) : 0;
    const expenseTrend = prevExpenses > 0 ? Number((((expenses - prevExpenses) / prevExpenses) * 100).toFixed(1)) : 0;
    const savingsTrend = prevNetSavings > 0 ? Number((((netSavings - prevNetSavings) / prevNetSavings) * 100).toFixed(1)) : 0;

    // Budget utilization
    const budgetRes = await query(
      `SELECT COALESCE(SUM(limit_amount), 0)::numeric as total_budget
       FROM budget_categories bc
       JOIN budgets b ON bc.budget_id = b.id
       WHERE b.user_id = $1 AND b.start_date <= $2 AND b.end_date >= $2`,
      [userId, now.toISOString().split('T')[0]]
    );
    const totalBudget = Number(budgetRes.rows[0].total_budget);
    const budgetUsedPercentage = totalBudget > 0 ? Number(((expenses / totalBudget) * 100).toFixed(1)) : 0;

    return {
      totalBalance,
      income,
      expenses,
      netSavings,
      savingsRate,
      incomeTrend,
      expenseTrend,
      savingsTrend,
      totalBudget,
      budgetUsedPercentage,
      currentPeriod: {
        startDate: startOfCurrentMonth,
        endDate: endOfCurrentMonth,
      }
    };
  },

  /**
   * Get 12-Month income vs expense evolution
   */
  async getMonthlyEvolution(userId, monthsCount = 12) {
    const res = await query(
      `SELECT 
         to_char(transaction_date, 'YYYY-MM') as month_key,
         to_char(transaction_date, 'Mon') as month_name,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as expense
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= (CURRENT_DATE - INTERVAL '12 months')
       GROUP BY to_char(transaction_date, 'YYYY-MM'), to_char(transaction_date, 'Mon')
       ORDER BY month_key ASC`,
      [userId]
    );

    const monthNamesEs = {
      'Jan': 'Ene', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Abr',
      'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Ago',
      'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dic',
    };

    return res.rows.map(r => {
      const inc = Number(r.income);
      const exp = Number(r.expense);
      return {
        month: monthNamesEs[r.month_name] || r.month_name,
        monthKey: r.month_key,
        income: inc,
        expense: exp,
        savings: inc - exp,
      };
    });
  },

  /**
   * Get Expense Category Distribution (Donut Chart)
   */
  async getCategoryDistribution(userId, startDate, endDate) {
    const conditions = ["t.user_id = $1", "t.type = 'expense'"];
    const params = [userId];

    if (startDate) {
      params.push(startDate);
      conditions.push(`t.transaction_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`t.transaction_date <= $${params.length}`);
    }

    const res = await query(
      `SELECT 
         COALESCE(c.name, 'Otros') as name,
         COALESCE(c.color, '#64748b') as color,
         COALESCE(c.icon, 'tag') as icon,
         SUM(t.amount)::numeric as value
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY c.name, c.color, c.icon
       ORDER BY value DESC`,
      params
    );

    const total = res.rows.reduce((acc, r) => acc + Number(r.value), 0);

    return res.rows.map(r => ({
      name: r.name,
      color: r.color,
      icon: r.icon,
      value: Number(r.value),
      percentage: total > 0 ? Number(((Number(r.value) / total) * 100).toFixed(1)) : 0,
    }));
  }
};
