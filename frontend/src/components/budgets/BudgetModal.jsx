import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { PieChart, Plus, Trash2, Calendar } from 'lucide-react';
import { getCurrentISODate } from '../../utils/date';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const budgetSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  period: z.enum(['monthly', 'weekly', 'yearly', 'custom']).default('monthly'),
  start_date: z.string().min(1, 'Fecha de inicio obligatoria'),
  end_date: z.string().min(1, 'Fecha final obligatoria'),
});

export function BudgetModal({ isOpen, onClose, initialData = null }) {
  const { categories, addBudget, editBudget, currency, formatMoney } = useFinance();

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const [categoryLimits, setCategoryLimits] = useState([
    { category_id: expenseCategories[0]?.id || '', limit_amount: 500 },
    { category_id: expenseCategories[1]?.id || '', limit_amount: 250 },
    { category_id: expenseCategories[2]?.id || '', limit_amount: 900 },
  ]);

  const defaultStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: `Presupuesto ${format(new Date(), 'MMMM yyyy')}`,
      period: 'monthly',
      start_date: defaultStart,
      end_date: defaultEnd,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        period: initialData.period || 'monthly',
        start_date: initialData.start_date || defaultStart,
        end_date: initialData.end_date || defaultEnd,
      });

      if (initialData.budget_categories && initialData.budget_categories.length > 0) {
        setCategoryLimits(
          initialData.budget_categories.map(bc => ({
            category_id: bc.category_id,
            limit_amount: Number(bc.limit_amount) || 0,
          }))
        );
      }
    } else {
      reset({
        name: `Presupuesto ${format(new Date(), 'MMMM yyyy')}`,
        period: 'monthly',
        start_date: defaultStart,
        end_date: defaultEnd,
      });
      setCategoryLimits([
        { category_id: expenseCategories[0]?.id || '', limit_amount: 500 },
        { category_id: expenseCategories[1]?.id || '', limit_amount: 250 },
        { category_id: expenseCategories[2]?.id || '', limit_amount: 900 },
      ]);
    }
  }, [initialData, isOpen, reset, defaultStart, defaultEnd]);

  const handleAddCategoryRow = () => {
    const unselected = expenseCategories.find(c => !categoryLimits.some(cl => cl.category_id === c.id));
    setCategoryLimits(prev => [
      ...prev,
      { category_id: unselected?.id || expenseCategories[0]?.id || '', limit_amount: 100 },
    ]);
  };

  const handleRemoveCategoryRow = (index) => {
    setCategoryLimits(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLimit = (index, field, value) => {
    setCategoryLimits(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const totalCalculated = categoryLimits.reduce((acc, cl) => acc + (Number(cl.limit_amount) || 0), 0);

  const onSubmit = async (values) => {
    try {
      const validLimits = categoryLimits
        .filter(cl => cl.category_id && Number(cl.limit_amount) > 0)
        .map(cl => ({
          category_id: cl.category_id,
          limit_amount: Number(cl.limit_amount),
        }));

      if (validLimits.length === 0) {
        alert('Debes asignar límites a por lo menos una categoría');
        return;
      }

      const payload = {
        ...values,
        amount: totalCalculated,
      };

      if (initialData?.id) {
        await editBudget(initialData.id, payload, validLimits);
      } else {
        await addBudget(payload, validLimits);
      }

      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar el presupuesto');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
      subtitle="Define límites de gasto por categoría para controlar tus finanzas"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre del presupuesto"
          placeholder="Ej. Presupuesto Mensual Agosto, Vacaciones..."
          required
          leftIcon={<PieChart className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha de Inicio"
            type="date"
            required
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.start_date?.message}
            {...register('start_date')}
          />

          <Input
            label="Fecha Final"
            type="date"
            required
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        {/* Categories Limit Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Límites por Categoría
            </label>
            <button
              type="button"
              onClick={handleAddCategoryRow}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir categoría</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {categoryLimits.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1">
                  <select
                    value={row.category_id}
                    onChange={(e) => handleUpdateLimit(idx, 'category_id', e.target.value)}
                    className="w-full text-xs bg-white dark:bg-dark-input text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <Input
                    type="number"
                    step="1"
                    placeholder="Monto"
                    value={row.limit_amount}
                    onChange={(e) => handleUpdateLimit(idx, 'limit_amount', e.target.value)}
                    prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.'}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCategoryRow(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total Sum indicator */}
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-dark-input/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Total Presupuestado:</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-sm">
              {formatMoney(totalCalculated)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Guardar Cambios' : 'Crear Presupuesto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
