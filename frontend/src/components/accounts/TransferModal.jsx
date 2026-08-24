import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ArrowLeftRight, Wallet, Calendar } from 'lucide-react';
import { getCurrentISODate } from '../../utils/date';

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Selecciona la cuenta de origen'),
  toAccountId: z.string().min(1, 'Selecciona la cuenta de destino'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  description: z.string().optional(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  notes: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Las cuentas de origen y destino deben ser diferentes',
  path: ['toAccountId'],
});

export function TransferModal({ isOpen, onClose }) {
  const { accounts, transferMoney, currency, formatMoney } = useFinance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: accounts[0]?.id || '',
      toAccountId: accounts[1]?.id || '',
      amount: '',
      description: 'Transferencia entre cuentas',
      date: getCurrentISODate(),
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await transferMoney(values);
      reset();
      onClose();
    } catch (err) {
      alert(err.message || 'Error al realizar la transferencia');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferir entre Cuentas"
      subtitle="Mueve dinero de una cuenta a otra al instante"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/40 rounded-xl flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <p className="text-xs text-cyan-800 dark:text-cyan-300">
            Esta acción actualizará los balances de ambas cuentas automáticamente.
          </p>
        </div>

        <Input
          label="Monto a transferir"
          type="number"
          step="0.01"
          placeholder="0.00"
          prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.'}
          required
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Select
          label="Cuenta Origen (De donde sale el dinero)"
          required
          leftIcon={<Wallet className="w-4 h-4" />}
          error={errors.fromAccountId?.message}
          {...register('fromAccountId')}
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({formatMoney(a.balance)})
            </option>
          ))}
        </Select>

        <Select
          label="Cuenta Destino (A donde llega el dinero)"
          required
          leftIcon={<Wallet className="w-4 h-4" />}
          error={errors.toAccountId?.message}
          {...register('toAccountId')}
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({formatMoney(a.balance)})
            </option>
          ))}
        </Select>

        <Input
          label="Fecha"
          type="date"
          required
          leftIcon={<Calendar className="w-4 h-4" />}
          error={errors.date?.message}
          {...register('date')}
        />

        <Input
          label="Descripción o concepto"
          placeholder="Ej. Ahorro quincenal, pago de tarjeta..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Realizar Transferencia
          </Button>
        </div>
      </form>
    </Modal>
  );
}
