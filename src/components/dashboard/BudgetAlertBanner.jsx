import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BudgetAlertBanner() {
  const { budgetUsage } = useFinance();

  if (!budgetUsage || !budgetUsage.alerts || budgetUsage.alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {budgetUsage.alerts.slice(0, 2).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all shadow-xs ${
            alert.type === 'danger'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200'
              : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {alert.type === 'danger' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span className="truncate">{alert.message}</span>
          </div>

          <Link
            to="/budgets"
            className="shrink-0 ml-3 flex items-center gap-1 font-bold underline hover:opacity-80 transition-opacity"
          >
            <span>Ver presupuesto</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ))}
    </div>
  );
}
