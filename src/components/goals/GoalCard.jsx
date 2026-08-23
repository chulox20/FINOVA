import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFinance } from '../../contexts/FinanceContext';
import { calculateGoalProgress } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { Target, Plus, Calendar, CheckCircle2, History, Edit, Trash2 } from 'lucide-react';

export function GoalCard({ goal, onContribute, onEdit, onDelete, onViewHistory }) {
  const { formatMoney } = useFinance();
  const { target, current, remaining, percentage, isCompleted, daysRemaining } = calculateGoalProgress(goal);

  return (
    <Card className="relative overflow-hidden flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: goal.color || '#10b981' }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {goal.name}
              </h4>
              {goal.account && (
                <p className="text-[11px] text-slate-400">
                  Cuenta: <span className="font-medium text-slate-600 dark:text-slate-300">{goal.account.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <Badge variant="emerald" size="xs" dot>
                Completada
              </Badge>
            ) : (
              <Badge variant="cyan" size="xs">
                {percentage}%
              </Badge>
            )}

            {/* Quick Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Editar meta"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(goal.id)}
                className="p-1 text-slate-400 hover:text-rose-500"
                title="Eliminar meta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Amount Progress */}
        <div className="space-y-2 mt-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Ahorrado: <strong className="text-slate-900 dark:text-white font-bold">{formatMoney(current)}</strong>
            </span>
            <span className="text-slate-400">
              Meta: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatMoney(target)}</strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                backgroundColor: goal.color || '#10b981',
              }}
            />
          </div>

          {/* Deadline or Remaining Days */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            {goal.deadline ? (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Fecha: {formatDate(goal.deadline, 'dd MMM yyyy')}</span>
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="font-semibold text-emerald-500 ml-1">
                    ({daysRemaining} días)
                  </span>
                )}
              </div>
            ) : (
              <span>Sin fecha límite</span>
            )}

            <span>Faltan {formatMoney(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Button
          size="xs"
          variant="outline"
          onClick={() => onViewHistory(goal)}
          leftIcon={<History className="w-3.5 h-3.5" />}
          className="flex-1"
        >
          Historial
        </Button>

        <Button
          size="xs"
          variant="primary"
          onClick={() => onContribute(goal)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          disabled={isCompleted}
          className="flex-1"
        >
          {isCompleted ? '¡Meta Lograda!' : 'Añadir Ahorro'}
        </Button>
      </div>
    </Card>
  );
}
