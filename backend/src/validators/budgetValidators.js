import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  period: z.enum(['monthly', 'weekly', 'yearly', 'custom']).default('monthly'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
  categories: z.array(
    z.object({
      category_id: z.string().uuid('ID de categoría no válido'),
      limit_amount: z.coerce.number().positive('El límite debe ser mayor a cero'),
    })
  ).min(1, 'Debes asignar límites a por lo menos una categoría'),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  period: z.enum(['monthly', 'weekly', 'yearly', 'custom']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categories: z.array(
    z.object({
      category_id: z.string().uuid(),
      limit_amount: z.coerce.number().positive(),
    })
  ).optional(),
});
