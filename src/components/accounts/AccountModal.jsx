import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Wallet, Palette, Landmark, PiggyBank, Banknote, CreditCard, TrendingUp } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

const accountSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'cash', 'credit_card', 'investment']),
  balance: z.coerce.number().default(0),
  currency: z.string().default('USD'),
  color: z.string().default('#10b981'),
  icon: z.string().default('landmark'),
});

const PRESET_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];

const PRESET_ICONS = [
  { id: 'landmark', label: 'Banco', icon: Landmark },
  { id: 'piggy-bank', label: 'Ahorros', icon: PiggyBank },
  { id: 'banknote', label: 'Efectivo', icon: Banknote },
  { id: 'credit-card', label: 'Tarjeta', icon: CreditCard },
  { id: 'trending-up', label: 'Inversión', icon: TrendingUp },
];

export function AccountModal({ isOpen, onClose, initialData = null }) {
  const { addAccount, editAccount, currency } = useFinance();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      balance: '',
      currency: currency || 'USD',
      color: '#10b981',
      icon: 'landmark',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        type: initialData.type || 'checking',
        balance: initialData.balance ?? '',
        currency: initialData.currency || currency || 'USD',
        color: initialData.color || '#10b981',
        icon: initialData.icon || 'landmark',
      });
    } else {
      reset({
        name: '',
        type: 'checking',
        balance: '',
        currency: currency || 'USD',
        color: '#10b981',
        icon: 'landmark',
      });
    }
  }, [initialData, isOpen, currency, reset]);

  const onSubmit = async (values) => {
    try {
      if (initialData?.id) {
        await editAccount(initialData.id, values);
      } else {
        await addAccount(values);
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar la cuenta');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}
      subtitle="Registra una cuenta bancaria, tarjeta o billetera"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre de la cuenta"
          placeholder="Ej. Banco Nacional, Banesco Ahorros, Billetera..."
          required
          leftIcon={<Wallet className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo de Cuenta"
            required
            error={errors.type?.message}
            {...register('type')}
          >
            <option value="checking">Cuenta Corriente</option>
            <option value="savings">Cuenta de Ahorros</option>
            <option value="cash">Efectivo / Billetera</option>
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="investment">Inversión</option>
          </Select>

          <Select
            label="Moneda"
            required
            error={errors.currency?.message}
            {...register('currency')}
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Balance Inicial"
          type="number"
          step="0.01"
          placeholder="0.00"
          helperText="Monto disponible al momento de crear esta cuenta"
          error={errors.balance?.message}
          {...register('balance')}
        />

        {/* Icon selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Icono representativo
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_ICONS.map(ic => {
              const IconComp = ic.icon;
              const isSelected = selectedIcon === ic.id;
              return (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => setValue('icon', ic.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span className="text-[9px] font-medium">{ic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Color de la tarjeta</span>
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
            {initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
