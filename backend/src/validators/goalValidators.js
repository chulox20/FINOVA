import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  target_amount: z.coerce.number().positive('El objetivo debe ser mayor a cero'),
  current_amount: z.coerce.number().min(0).default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  color: z.string().default('#10b981'),
  icon: z.string().default('target'),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

export const updateGoalSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  target_amount: z.coerce.number().positive().optional(),
  current_amount: z.coerce.number().min(0).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

export const addContributionSchema = z.object({
  amount: z.coerce.number().positive('El monto a aportar debe ser mayor a cero'),
  account_id: z.string().uuid().optional().nullable(),
  contribution_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().split('T')[0]),
  note: z.string().max(255).optional().nullable(),
});
