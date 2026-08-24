import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors: errorDetails,
    });
  }

  // Handle custom App / Http errors
  const statusCode = err.statusCode || 500;
  const message = err.isOperational || statusCode < 500
    ? err.message
    : 'Ha ocurrido un error interno en el servidor';

  if (env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
