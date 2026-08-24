import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { BudgetCard } from '../../components/budgets/BudgetCard';
import { BudgetModal } from '../../components/budgets/BudgetModal';
import { BudgetAlertBanner } from '../../components/dashboard/BudgetAlertBanner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, PieChart, AlertTriangle } from 'lucide-react';

export function Budgets() {
  const { budgets, budgetUsage, removeBudget } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este presupuesto?')) {
      await removeBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Presupuestos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Planifica tus gastos por categoría y mantén tus límites bajo control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* Active Alerts Banner */}
      <BudgetAlertBanner />

      {/* Main Active Budget View */}
      {budgets.length === 0 ? (
        <EmptyState
          icon="pie-chart"
          title="No tienes presupuestos activos"
          description="Crea tu primer presupuesto mensual para fijar topes de gasto en Alimentación, Transporte, Servicios y más."
          actionLabel="Crear Presupuesto"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {budgetUsage && (
            <BudgetCard
              budgetUsage={budgetUsage}
              onEdit={(b) => setEditingBudget(b)}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      <BudgetModal
        isOpen={isCreateModalOpen || Boolean(editingBudget)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBudget(null);
        }}
        initialData={editingBudget}
      />
    </div>
  );
}
