import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  type: z.enum(['checking', 'savings', 'cash', 'credit_card', 'investment']),
  balance: z.coerce.number().default(0),
  currency: z.string().default('USD'),
  color: z.string().default('#10b981'),
  icon: z.string().default('landmark'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(['checking', 'savings', 'cash', 'credit_card', 'investment']).optional(),
  balance: z.coerce.number().optional(),
  currency: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const transferFundsSchema = z.object({
  fromAccountId: z.string().uuid('ID de cuenta origen no válido'),
  toAccountId: z.string().uuid('ID de cuenta destino no válido'),
  amount: z.coerce.number().positive('El monto debe ser un número mayor a cero'),
  description: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD').optional(),
  notes: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Las cuentas de origen y destino deben ser distintas',
  path: ['toAccountId'],
});
