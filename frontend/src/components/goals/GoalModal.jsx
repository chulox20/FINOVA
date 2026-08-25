import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Target, Wallet, Calendar, Palette } from 'lucide-react';

const goalSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  target_amount: z.coerce.number().positive('El objetivo debe ser mayor a cero'),
  deadline: z.string().optional(),
  account_id: z.string().optional(),
  color: z.string().default('#10b981'),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

const PRESET_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#14b8a6', '#f43f5e'];

export function GoalModal({ isOpen, onClose, initialData = null }) {
  const { accounts, addGoal, updateGoal, editGoal, currency } = useFinance();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: '',
      deadline: '',
      account_id: '',
      color: '#10b981',
      status: 'active',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        target_amount: initialData.target_amount || '',
        deadline: initialData.deadline || '',
        account_id: initialData.account_id || '',
        color: initialData.color || '#10b981',
        status: initialData.status || 'active',
      });
    } else {
      reset({
        name: '',
        target_amount: '',
        deadline: '',
        account_id: '',
        color: '#10b981',
        status: 'active',
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      const updateFn = updateGoal || editGoal;
      if (initialData?.id) {
        await updateFn(initialData.id, values);
      } else {
        await addGoal(values);
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar la meta');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Meta de Ahorro' : 'Crear Nueva Meta'}
      subtitle="Establece un objetivo claro y planifica tu ahorro"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre de la meta"
          placeholder="Ej. Viaje a Japón, Fondo de emergencia, Coche nuevo..."
          required
          leftIcon={<Target className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Monto Objetivo"
          type="number"
          step="0.01"
          placeholder="0.00"
          prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.'}
          required
          error={errors.target_amount?.message}
          {...register('target_amount')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha Límite (Opcional)"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.deadline?.message}
            {...register('deadline')}
          />

          <Select
            label="Cuenta Asociada (Opcional)"
            leftIcon={<Wallet className="w-4 h-4" />}
            error={errors.account_id?.message}
            {...register('account_id')}
          >
            <option value="">Sin cuenta vinculada</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Color Palette Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Color Distintivo</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-dark-card' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Guardar Cambios' : 'Crear Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
