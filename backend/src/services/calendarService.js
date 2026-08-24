import { query } from '../db/pool.js';

export const calendarService = {
  /**
   * Get daily aggregations and transaction breakdown for calendar view
   */
  async getMonthlyCalendarData(userId, year, month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1. Daily Aggregations
    const dailyRes = await query(
      `SELECT 
         transaction_date::text as date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric as expense,
         COUNT(id)::int as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3
       GROUP BY transaction_date
       ORDER BY transaction_date ASC`,
      [userId, startDate, endDate]
    );

    // 2. Fetch all transactions in the month
    const txRes = await query(
      `SELECT 
         t.id, t.user_id, t.account_id, t.category_id, t.type, t.description,
         t.amount::numeric, t.transaction_date::text as transaction_date, t.notes,
         row_to_json(a.*) as account,
         row_to_json(c.*) as category
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.transaction_date >= $2 AND t.transaction_date <= $3
       ORDER BY t.transaction_date ASC, t.created_at DESC`,
      [userId, startDate, endDate]
    );

    const daysMap = {};
    dailyRes.rows.forEach(r => {
      daysMap[r.date] = {
        date: r.date,
        income: Number(r.income),
        expense: Number(r.expense),
        count: r.count,
        transactions: [],
      };
    });

    txRes.rows.forEach(t => {
      const d = t.transaction_date;
      if (!daysMap[d]) {
        daysMap[d] = {
          date: d,
          income: 0,
          expense: 0,
          count: 0,
          transactions: [],
        };
      }
      daysMap[d].transactions.push({
        ...t,
        amount: Number(t.amount),
      });
    });

    return {
      year: y,
      month: m,
      startDate,
      endDate,
      days: daysMap,
    };
  }
};
