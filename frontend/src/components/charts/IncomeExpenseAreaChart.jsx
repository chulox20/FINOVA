import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';

export function IncomeExpenseAreaChart({ data = [], height = 300 }) {
  const { formatMoney } = useFinance();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find(p => p.dataKey === 'income')?.value || 0;
      const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
      const savings = income - expense;

      return (
        <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-slate-200 dark:border-dark-border shadow-xl text-xs space-y-1.5">
          <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
            <span>Ingresos:</span>
            <span className="font-semibold">{formatMoney(income)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-500 dark:text-rose-400">
            <span>Gastos:</span>
            <span className="font-semibold">{formatMoney(expense)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 font-bold">
            <span>Ahorro neto:</span>
            <span>{formatMoney(savings)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Income Gradient */}
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>

            {/* Expense Gradient */}
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />

          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            formatter={(value) => (
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {value === 'income' ? 'Ingresos' : 'Gastos'}
              </span>
            )}
          />

          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#incomeGrad)"
          />

          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
