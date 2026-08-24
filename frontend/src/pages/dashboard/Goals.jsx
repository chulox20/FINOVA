import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { GoalCard } from '../../components/goals/GoalCard';
import { GoalModal } from '../../components/goals/GoalModal';
import { ContributionModal } from '../../components/goals/ContributionModal';
import { GoalContributionHistory } from '../../components/goals/GoalContributionHistory';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, Target, Sparkles, Trophy } from 'lucide-react';

export function Goals() {
  const { goals, removeGoal, formatMoney } = useFinance();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);
  const [viewingHistoryGoal, setViewingHistoryGoal] = useState(null);

  const totalSavedInGoals = goals.reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0);
  const totalTargetGoals = goals.reduce((acc, g) => acc + (Number(g.target_amount) || 0), 0);
  const overallPercentage = totalTargetGoals > 0 ? ((totalSavedInGoals / totalTargetGoals) * 100).toFixed(1) : 0;

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta meta de ahorro?')) {
      await removeGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Metas de Ahorro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cumple tus sueños y objetivos financieros paso a paso
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Meta
          </Button>
        </div>
      </div>

      {/* Global Goals Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Progreso General de Ahorro
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatMoney(totalSavedInGoals)}
            </span>
            <span className="text-sm text-slate-400">
              de {formatMoney(totalTargetGoals)} objetivo
            </span>
          </div>

          <div className="w-full sm:w-80 bg-slate-800 rounded-full h-2.5 overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Number(overallPercentage))}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 text-center sm:text-right">
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
            {overallPercentage}%
          </span>
          <p className="text-xs text-slate-400">
            {goals.filter(g => g.status === 'completed').length} de {goals.length} metas completadas
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon="target"
          title="No tienes metas de ahorro configuradas"
          description="Crea metas para viajes, fondos de emergencia, compras o proyectos futuros."
          actionLabel="Crear Primera Meta"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={(g) => setContributingGoal(g)}
              onEdit={(g) => setEditingGoal(g)}
              onDelete={handleDelete}
              onViewHistory={(g) => setViewingHistoryGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isCreateModalOpen || Boolean(editingGoal)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
      />

      <ContributionModal
        isOpen={Boolean(contributingGoal)}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
      />

      <GoalContributionHistory
        isOpen={Boolean(viewingHistoryGoal)}
        onClose={() => setViewingHistoryGoal(null)}
        goal={viewingHistoryGoal}
      />
    </div>
  );
}
