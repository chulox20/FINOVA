import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';

export function BalanceLineChart({ data = [], height = 280 }) {
  const { formatMoney } = useFinance();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value || 0;
      return (
        <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-slate-200 dark:border-dark-border shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>
          <div className="flex items-center justify-between gap-4 text-cyan-600 dark:text-cyan-400 font-semibold">
            <span>Balance acumulado:</span>
            <span>{formatMoney(val)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

          <Line
            type="monotone"
            dataKey="cumulativeBalance"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
