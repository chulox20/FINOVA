import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';
import { IconRenderer } from '../ui/IconRenderer';

const FALLBACK_COLORS = ['#6366f1', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#64748b'];

export function CategoryDonutChart({ data = [], height = 260 }) {
  const { formatMoney } = useFinance();

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400">
        <p>No hay gastos registrados en este período para clasificar por categoría.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-slate-200 dark:border-dark-border shadow-xl text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
            <span>Total gastado:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatMoney(item.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Porcentaje:</span>
            <span className="font-bold text-emerald-500">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Donut Chart */}
      <div className="relative w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total
          </span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            100%
          </span>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {data.slice(0, 5).map((cat, idx) => (
          <div
            key={cat.id || idx}
            className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length] }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                {cat.name}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatMoney(cat.value)}
              </span>
              <span className="text-slate-400 font-medium w-10 text-right">
                {cat.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
