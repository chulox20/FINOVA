import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { PiggyBank, Wallet, Calendar, Sparkles } from 'lucide-react';
import { getCurrentISODate } from '../../utils/date';

const contributionSchema = z.object({
  amount: z.coerce.number().positive('El monto a aportar debe ser mayor a cero'),
  accountId: z.string().min(1, 'Debes seleccionar una cuenta de origen para fondear el ahorro'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  note: z.string().optional(),
});

export function ContributionModal({ isOpen, onClose, goal }) {
  const { accounts, addGoalContribution, contributeGoal, currency, formatMoney } = useFinance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: '',
      accountId: goal?.account_id || accounts[0]?.id || '',
      date: getCurrentISODate(),
      note: 'Aporte para ' + (goal?.name || 'mi meta'),
    },
  });

  const onSubmit = async (values) => {
    if (!goal) return;
    try {
      const fn = addGoalContribution || contributeGoal;
      await fn(goal.id, {
        amount: Number(values.amount),
        account_id: values.accountId,
        contribution_date: values.date,
        note: values.note,
      });

      // If this contribution completes the goal, launch confetti!
      const projectedAmount = Number(goal.current_amount) + Number(values.amount);
      if (projectedAmount >= Number(goal.target_amount)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      reset();
      onClose();
    } catch (err) {
      alert(err.message || 'Error al registrar el aporte');
    }
  };

  if (!goal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Añadir Ahorro a "${goal.name}"`}
      subtitle="Registra un nuevo abono hacia el cumplimiento de tu objetivo"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ahorro actual:</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}
              </p>
            </div>
          </div>
        </div>

        <Input
          label="Monto a aportar"
          type="number"
          step="0.01"
          placeholder="0.00"
          prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.'}
          required
          autoFocus
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Select
          label="Debitar de la cuenta (Obligatorio)"
          leftIcon={<Wallet className="w-4 h-4" />}
          error={errors.accountId?.message}
          required
          {...register('accountId')}
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({formatMoney(a.balance)})
            </option>
          ))}
        </Select>

        <Input
          label="Fecha del aporte"
          type="date"
          required
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.date?.message}
          {...register('date')}
        />

        <Input
          label="Nota o motivo (opcional)"
          placeholder="Ej. Bono de fin de mes, ahorro semanal..."
          error={errors.note?.message}
          {...register('note')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Confirmar Aporte
          </Button>
        </div>
      </form>
    </Modal>
  );
}
