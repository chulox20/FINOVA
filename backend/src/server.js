import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';

const app = express();

// Security and CORS
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Acceso denegado por CORS para el origen: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply General Rate Limiter to API routes
app.use('/api', apiRateLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Fallback 404 for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start listening
const server = app.listen(env.PORT, () => {
  console.log(`\n💎 FINOVA Backend REST API activo en: http://localhost:${env.PORT}`);
  console.log(`🚀 Entorno: ${env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
  console.log(`🛡️ Rate Limiting y autenticación JWT activos.\n`);
});

export default app;
