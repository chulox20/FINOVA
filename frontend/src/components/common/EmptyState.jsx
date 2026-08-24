import React from 'react';
import { Button } from '../ui/Button';
import { IconRenderer } from '../ui/IconRenderer';

export function EmptyState({
  icon = 'inbox',
  title = 'No hay datos disponibles',
  description = 'Comienza agregando tu primer registro para ver la información aquí.',
  actionLabel,
  actionIcon,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-card/40 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
        <IconRenderer name={icon} className="w-7 h-7" />
      </div>

      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {title}
      </h4>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          leftIcon={actionIcon ? <IconRenderer name={actionIcon} className="w-4 h-4" /> : undefined}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
