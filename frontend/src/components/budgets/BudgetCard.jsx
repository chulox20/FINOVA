import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useFinance } from '../../contexts/FinanceContext';
import { PieChart, AlertTriangle, AlertCircle, CheckCircle2, Edit, Trash2, Plus } from 'lucide-react';

export function BudgetCard({ budgetUsage, onEdit, onDelete }) {
  const { formatMoney } = useFinance();

  if (!budgetUsage) return null;

  const { budget, totalLimit, totalSpent, totalRemaining, totalPercentage, overallStatus, categoriesDetail } = budgetUsage;

  const getStatusBadge = (status, pct) => {
    if (status === 'exceeded') {
      return (
        <Badge variant="rose" size="xs" dot>
          Excedido ({pct}%)
        </Badge>
      );
    }
    if (status === 'warning') {
      return (
        <Badge variant="amber" size="xs" dot>
          Cerca del límite ({pct}%)
        </Badge>
      );
    }
    return (
      <Badge variant="emerald" size="xs">
        Normal ({pct}%)
      </Badge>
    );
  };

  const getProgressColor = (status) => {
    if (status === 'exceeded') return 'bg-rose-500';
    if (status === 'warning') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {budget.name}
            </h3>
            <p className="text-xs text-slate-400 capitalize">
              Período: {budget.period === 'monthly' ? 'Mensual' : budget.period} ({budget.start_date} al {budget.end_date})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {getStatusBadge(overallStatus, totalPercentage)}
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Editar presupuesto"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Eliminar presupuesto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Summary Bar */}
      <div className="space-y-2 bg-slate-50 dark:bg-dark-input/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-baseline justify-between text-xs sm:text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Total Gastado: <strong className="text-slate-900 dark:text-white font-extrabold">{formatMoney(totalSpent)}</strong>
          </span>
          <span className="text-slate-500">
            Límite: <strong className="text-slate-700 dark:text-slate-300">{formatMoney(totalLimit)}</strong>
          </span>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getProgressColor(overallStatus)}`}
            style={{ width: `${Math.min(100, totalPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 pt-0.5">
          <span>{totalPercentage}% utilizado</span>
          <span>Disponible: {formatMoney(totalRemaining)}</span>
        </div>
      </div>

      {/* Category Limits Breakdown */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Distribución por Categorías
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {categoriesDetail.map((cat) => (
            <div
              key={cat.id || cat.category_id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-card space-y-2 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.category?.color || '#64748b' }}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.category?.name || 'Categoría'}
                  </span>
                </div>

                {getStatusBadge(cat.status, cat.percentage)}
              </div>

              {/* Progress bar per category */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(cat.status)}`}
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Gastado: {formatMoney(cat.spent)}</span>
                <span>Límite: {formatMoney(cat.limit)}</span>
                <span>Restante: {formatMoney(cat.remaining)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
