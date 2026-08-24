import { z } from 'zod';

export const createTransactionSchema = z.object({
  account_id: z.string().uuid('ID de cuenta no válido'),
  to_account_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres').max(255),
  amount: z.coerce.number().positive('El monto debe ser un número positivo mayor a cero'),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD').default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().optional().nullable(),
});

export const updateTransactionSchema = z.object({
  account_id: z.string().uuid().optional(),
  to_account_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  description: z.string().min(2).max(255).optional(),
  amount: z.coerce.number().positive().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional().nullable(),
});

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer', 'all']).optional(),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(50),
});
