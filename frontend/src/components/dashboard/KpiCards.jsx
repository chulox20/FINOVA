import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, PiggyBank, PieChart } from 'lucide-react';
import { formatPercentage } from '../../utils/currency';

export function KpiCards() {
  const { periodSummary, kpiTrends, budgetUsage, formatMoney } = useFinance();

  const { income, expense, savings } = periodSummary;
  const { incomeTrend, expenseTrend, savingsTrend } = kpiTrends;

  const budgetPercent = budgetUsage?.totalPercentage || 68;

  const kpis = [
    {
      title: 'Ingresos',
      amount: formatMoney(income, { showSign: true }),
      trend: incomeTrend,
      trendLabel: 'vs mes anterior',
      isPositiveTrend: incomeTrend >= 0,
      icon: ArrowUpRight,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Gastos',
      amount: formatMoney(-expense),
      trend: expenseTrend,
      trendLabel: 'vs mes anterior',
      isPositiveTrend: expenseTrend <= 0, // Lower expenses is positive
      icon: ArrowDownRight,
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Ahorro Neto',
      amount: formatMoney(savings),
      trend: savingsTrend,
      trendLabel: 'vs mes anterior',
      isPositiveTrend: savingsTrend >= 0,
      icon: PiggyBank,
      iconBg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Presupuesto Utilizado',
      amount: `${budgetPercent}%`,
      isBudget: true,
      budgetSpent: formatMoney(budgetUsage?.totalSpent || 0),
      budgetLimit: formatMoney(budgetUsage?.totalLimit || 0),
      icon: PieChart,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
      borderColor: 'border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {kpi.title}
            </span>
            <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
              <kpi.icon className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {kpi.amount}
            </div>

            {kpi.isBudget ? (
              <div className="space-y-1.5 pt-1">
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPercent > 100
                        ? 'bg-rose-500'
                        : budgetPercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>{kpi.budgetSpent} gastados</span>
                  <span>de {kpi.budgetLimit}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                    kpi.isPositiveTrend
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {kpi.isPositiveTrend ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercentage(kpi.trend)}
                </span>
                <span className="text-slate-400 text-[11px] font-normal">
                  {kpi.trendLabel}
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
