import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../../contexts/FinanceContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Tag, Palette } from 'lucide-react';
import { IconRenderer } from '../ui/IconRenderer';

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['income', 'expense', 'both']),
  color: z.string().default('#10b981'),
  icon: z.string().default('tag'),
});

const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#10b981', '#64748b',
];

const PRESET_ICONS = [
  'tag', 'home', 'utensils', 'car', 'heart-pulse', 'graduation-cap', 'gamepad-2', 'shopping-bag', 'plane', 'zap', 'briefcase', 'laptop', 'trending-up', 'coffee', 'gift', 'film'
];

export function CategoryModal({ isOpen, onClose, initialData = null }) {
  const { addCategory, editCategory } = useFinance();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#10b981',
      icon: 'tag',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        type: initialData.type || 'expense',
        color: initialData.color || '#10b981',
        icon: initialData.icon || 'tag',
      });
    } else {
      reset({
        name: '',
        type: 'expense',
        color: '#10b981',
        icon: 'tag',
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      if (initialData?.id) {
        await editCategory(initialData.id, values);
      } else {
        await addCategory(values);
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar la categoría');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Categoría' : 'Nueva Categoría'}
      subtitle="Organiza tus transacciones con categorías personalizadas"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre de la categoría"
          placeholder="Ej. Mascotas, Suscripciones, Cripto..."
          required
          leftIcon={<Tag className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Select
          label="Aplica para"
          required
          error={errors.type?.message}
          {...register('type')}
        >
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
          <option value="both">Ambos (Ingresos y Gastos)</option>
        </Select>

        {/* Icon selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Icono
          </label>
          <div className="grid grid-cols-8 gap-2">
            {PRESET_ICONS.map(ic => {
              const isSelected = selectedIcon === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setValue('icon', ic)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm scale-110'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <IconRenderer name={ic} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Color de identificación</span>
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
            {initialData ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
