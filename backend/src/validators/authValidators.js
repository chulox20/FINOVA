import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Correo electrónico no válido').toLowerCase().trim(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  currency: z.enum(['USD', 'EUR', 'VES', 'GBP']).optional().default('USD'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido').toLowerCase().trim(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal('')),
  currency: z.enum(['USD', 'EUR', 'VES', 'GBP']).optional(),
  decimal_format: z.enum(['dot', 'comma']).optional(),
  week_start: z.enum(['monday', 'sunday']).optional(),
  budget_alerts: z.boolean().optional(),
  goal_notifications: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico no válido').toLowerCase().trim(),
});
