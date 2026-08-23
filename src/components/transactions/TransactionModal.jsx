import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Tag, Wallet, Calendar, FileText } from 'lucide-react';
import { getCurrentISODate } from '../../utils/date';

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  account_id: z.string().min(1, 'Debes seleccionar una cuenta'),
  to_account_id: z.string().optional(),
  category_id: z.string().optional(),
  transaction_date: z.string().min(1, 'La fecha es obligatoria'),
  notes: z.string().optional(),
});

export function TransactionModal({ isOpen, onClose, initialData = null }) {
  const { accounts, categories, addTransaction, editTransaction, currency, formatMoney } = useFinance();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      description: '',
      amount: '',
      account_id: accounts[0]?.id || '',
      to_account_id: accounts[1]?.id || '',
      category_id: '',
      transaction_date: getCurrentISODate(),
      notes: '',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type || 'expense',
        description: initialData.description || '',
        amount: initialData.amount || '',
        account_id: initialData.account_id || accounts[0]?.id || '',
        to_account_id: initialData.to_account_id || accounts[1]?.id || '',
        category_id: initialData.category_id || '',
        transaction_date: initialData.transaction_date || getCurrentISODate(),
        notes: initialData.notes || '',
      });
    } else {
      reset({
        type: 'expense',
        description: '',
        amount: '',
        account_id: accounts[0]?.id || '',
        to_account_id: accounts[1]?.id || '',
        category_id: '',
        transaction_date: getCurrentISODate(),
        notes: '',
      });
    }
  }, [initialData, isOpen, accounts, reset]);

  // Filter categories based on transaction type
  const availableCategories = categories.filter(c => {
    if (selectedType === 'income') return c.type === 'income' || c.type === 'both';
    if (selectedType === 'expense') return c.type === 'expense' || c.type === 'both';
    return true;
  });

  const onSubmit = async (values) => {
    try {
      if (initialData?.id) {
        await editTransaction(initialData.id, values);
      } else {
        await addTransaction(values);
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar el movimiento');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Movimiento' : 'Registrar Movimiento'}
      subtitle="Ingresa los detalles de tu transacción financiera"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Selector (Ingreso / Gasto / Transferencia) */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Tipo de Movimiento
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                selectedType === 'expense'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              <span>Gasto</span>
            </button>

            <button
              type="button"
              onClick={() => setValue('type', 'income')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                selectedType === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>Ingreso</span>
            </button>

            <button
              type="button"
              onClick={() => setValue('type', 'transfer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                selectedType === 'transfer'
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-cyan-500" />
              <span>Transferencia</span>
            </button>
          </div>
        </div>

        {/* Monto & Descripción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0.00"
            prefix={currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'Bs.'}
            required
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Input
            label="Fecha"
            type="date"
            required
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.transaction_date?.message}
            {...register('transaction_date')}
          />
        </div>

        <Input
          label="Descripción"
          placeholder="Ej. Supermercado, Salario quincenal, Gasolina..."
          required
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Cuenta Origen / Destino / Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={selectedType === 'transfer' ? 'Desde la Cuenta' : 'Cuenta'}
            required
            leftIcon={<Wallet className="w-4 h-4" />}
            error={errors.account_id?.message}
            {...register('account_id')}
          >
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatMoney(a.balance)})
              </option>
            ))}
          </Select>

          {selectedType === 'transfer' ? (
            <Select
              label="Hacia la Cuenta"
              required
              leftIcon={<Wallet className="w-4 h-4" />}
              error={errors.to_account_id?.message}
              {...register('to_account_id')}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatMoney(a.balance)})
                </option>
              ))}
            </Select>
          ) : (
            <Select
              label="Categoría"
              leftIcon={<Tag className="w-4 h-4" />}
              error={errors.category_id?.message}
              {...register('category_id')}
            >
              <option value="">Seleccionar categoría...</option>
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Notas adicionales */}
        <Input
          label="Nota o detalle (opcional)"
          placeholder="Ej. Factura #482, compartido con amigos..."
          leftIcon={<FileText className="w-4 h-4" />}
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Guardar Cambios' : 'Registrar Movimiento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
