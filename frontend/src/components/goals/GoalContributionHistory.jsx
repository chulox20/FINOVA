import React from 'react';
import { Modal } from '../ui/Modal';
import { useFinance } from '../../contexts/FinanceContext';
import { formatDate } from '../../utils/date';
import { History, Sparkles } from 'lucide-react';

export function GoalContributionHistory({ isOpen, onClose, goal }) {
  const { formatMoney } = useFinance();

  if (!goal) return null;

  const contributions = goal.goal_contributions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de Aportes — ${goal.name}`}
      subtitle="Registro cronológico de todos los ahorros destinados a esta meta"
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        {contributions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Aún no se han registrado aportes para esta meta.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto custom-scrollbar">
            {contributions.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {c.note || 'Aporte a meta'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(c.contribution_date, 'dd MMMM yyyy')}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  +{formatMoney(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
