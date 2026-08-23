/**
 * FINOVA Financial Calculations Utility
 * Centralizes all financial mathematics, aggregations, and metrics
 */

/**
 * Calculate total balance across all accounts or transactions
 * @param {Array} accounts
 * @returns {number}
 */
export function calculateTotalNetWorth(accounts = []) {
  return accounts.reduce((acc, account) => acc + (Number(account.balance) || 0), 0);
}

/**
 * Filter transactions by a date range
 */
export function filterTransactionsByDate(transactions = [], startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return transactions.filter(t => {
    const tDate = new Date(t.transaction_date);
    return tDate >= start && tDate <= end;
  });
}

/**
 * Calculate financial totals (Income, Expense, Net Savings, Savings Rate) for a set of transactions
 * @param {Array} transactions
 * @returns {Object} { income, expense, savings, savingsRate }
 */
export function calculateFinancialSummary(transactions = []) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += amt;
    } else if (t.type === 'expense') {
      expense += amt;
    }
  }

  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : (expense > 0 ? -100 : 0);

  return {
    income,
    expense,
    savings,
    savingsRate: Number(savingsRate.toFixed(1)),
  };
}

/**
 * Calculate percentage change between current period and previous period
 * @param {number} current
 * @param {number} previous
 * @returns {number}
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : current < 0 ? -100 : 0;
  }
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

/**
 * Aggregate expenses by category for Pie / Donut Charts
 * @param {Array} transactions
 * @param {Array} categories
 * @returns {Array<{ id, name, value, percentage, color, icon }>}
 */
export function calculateCategoryDistribution(transactions = [], categories = []) {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  if (totalExpense === 0) return [];

  const categoryMap = {};

  for (const cat of categories) {
    categoryMap[cat.id] = {
      id: cat.id,
      name: cat.name,
      color: cat.color || '#64748b',
      icon: cat.icon || 'tag',
      value: 0,
      count: 0,
    };
  }

  // Group transactions
  for (const t of expenseTx) {
    const catId = t.category_id;
    if (catId && categoryMap[catId]) {
      categoryMap[catId].value += Number(t.amount) || 0;
      categoryMap[catId].count += 1;
    } else {
      if (!categoryMap['other']) {
        categoryMap['other'] = {
          id: 'other',
          name: 'Otros Gastos',
          color: '#94a3b8',
          icon: 'more-horizontal',
          value: 0,
          count: 0,
        };
      }
      categoryMap['other'].value += Number(t.amount) || 0;
      categoryMap['other'].count += 1;
    }
  }

  return Object.values(categoryMap)
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      percentage: Number(((item.value / totalExpense) * 100).toFixed(1)),
      value: Number(item.value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate Monthly Evolution data for Income vs Expenses Chart
 * @param {Array} transactions
 * @param {number} monthsCount default 6 or 12
 * @returns {Array<{ monthKey, name, income, expense, savings, balance }>}
 */
export function calculateMonthlyEvolution(transactions = [], monthsCount = 6) {
  const months = [];
  const now = new Date();

  // Generate last N months in chronological order
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const name = d.toLocaleDateString('es-ES', { month: 'short' });
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    months.push({
      monthKey,
      name: capitalizedName,
      fullYear: d.getFullYear(),
      income: 0,
      expense: 0,
      savings: 0,
    });
  }

  // Populate data
  for (const t of transactions) {
    if (!t.transaction_date) continue;
    const tDate = new Date(t.transaction_date);
    const monthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
    
    const targetMonth = months.find(m => m.monthKey === monthKey);
    if (targetMonth) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        targetMonth.income += amt;
      } else if (t.type === 'expense') {
        targetMonth.expense += amt;
      }
    }
  }

  // Compute savings & format
  let cumulative = 0;
  return months.map(m => {
    const savings = m.income - m.expense;
    cumulative += savings;
    return {
      ...m,
      income: Number(m.income.toFixed(2)),
      expense: Number(m.expense.toFixed(2)),
      savings: Number(savings.toFixed(2)),
      cumulativeBalance: Number(cumulative.toFixed(2)),
    };
  });
}

/**
 * Calculate Budget Status and Alerts
 * @param {Object} budget
 * @param {Array} budgetCategories
 * @param {Array} transactions
 * @returns {Object} Detailed budget metrics
 */
export function calculateBudgetUsage(budget, budgetCategories = [], transactions = []) {
  if (!budget) return null;

  // Filter transactions within budget timeframe
  const bStart = new Date(budget.start_date);
  bStart.setHours(0, 0, 0, 0);
  const bEnd = new Date(budget.end_date);
  bEnd.setHours(23, 59, 59, 999);

  const budgetTx = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const tDate = new Date(t.transaction_date);
    return tDate >= bStart && tDate <= bEnd;
  });

  const categoriesDetail = budgetCategories.map(bc => {
    const spent = budgetTx
      .filter(t => t.category_id === bc.category_id)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const limit = Number(bc.limit_amount) || 0;
    const remaining = Math.max(0, limit - spent);
    const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

    let status = 'normal'; // 'normal' | 'warning' | 'exceeded'
    if (spent > limit) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      ...bc,
      spent: Number(spent.toFixed(2)),
      limit,
      remaining: Number(remaining.toFixed(2)),
      percentage,
      status,
    };
  });

  const totalLimit = categoriesDetail.length > 0
    ? categoriesDetail.reduce((acc, c) => acc + c.limit, 0)
    : Number(budget.amount) || 0;

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

  return {
    budget,
    totalLimit,
    totalSpent: Number(totalSpent.toFixed(2)),
    totalRemaining: Number(totalRemaining.toFixed(2)),
    totalPercentage,
    overallStatus,
    categoriesDetail,
    alerts,
  };
}

/**
 * Calculate Goal Progress
 * @param {Object} goal
 * @returns {Object}
 */
export function calculateGoalProgress(goal) {
  if (!goal) return { percentage: 0, remaining: 0, isCompleted: false };

  const target = Number(goal.target_amount) || 0;
  const current = Number(goal.current_amount) || 0;
  const remaining = Math.max(0, target - current);
  const percentage = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;
  const isCompleted = current >= target || goal.status === 'completed';

  let daysRemaining = null;
  if (goal.deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(goal.deadline);
    const diffTime = deadlineDate - today;
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    target,
    current,
    remaining: Number(remaining.toFixed(2)),
    percentage,
    isCompleted,
    daysRemaining,
  };
}
