import rateLimit from 'express-rate-limit';

// Strict rate limiter for sensitive authentication endpoints (Login / Register / Password Reset)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Por favor intenta nuevamente en 15 minutos.',
  },
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de solicitudes alcanzado. Por favor espera un momento.',
  },
});
