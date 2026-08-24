import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  type: z.enum(['income', 'expense', 'both']),
  color: z.string().default('#64748b'),
  icon: z.string().default('tag'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(['income', 'expense', 'both']).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});
