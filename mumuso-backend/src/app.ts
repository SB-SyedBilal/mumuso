// Express app setup, middleware registration — Ref: Primary Spec Section 5
// Strict /api/v1/ prefix on all routes — Authorization Decision D

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { logger } from './middleware/logger';
import { globalErrorHandler } from './middleware/errorHandler';
import { defaultLimiter } from './middleware/rateLimiter';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';
import { correlationIdMiddleware } from './middleware/correlationId';
import { prisma } from './config/database';
import { redis } from './config/redis';

// Route imports
import authRouter from './modules/auth/auth.router';
import memberRouter from './modules/member/member.router';
import membershipRouter from './modules/membership/membership.router';
import storesRouter from './modules/stores/stores.router';
import cashierRouter from './modules/cashier/cashier.router';
import transactionsRouter from './modules/transactions/transactions.router';
import notificationsRouter from './modules/notifications/notifications.router';
import adminRouter from './modules/admin/admin.router';
import posRouter from './modules/pos/pos.router';
import swaggerRouter from './routes/swagger';

const app = express();

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────────────
// Ref: Primary Spec Section 19 — Helmet.js for HTTP security headers
app.use(helmet());

// CORS — whitelist mobile app bundle IDs and admin domains
// Ref: Primary Spec Section 19
app.use(
  cors({
    origin: env.NODE_ENV === 'development' ? '*' : [
      'mumuso://',
      'https://admin.mumuso.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── BODY PARSING ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ─── OBSERVABILITY ──────────────────────────────────────────────────────────
// Correlation ID for distributed tracing — Ref: Law 4.1
app.use(correlationIdMiddleware);

// Prometheus metrics — Ref: Law 4.1
app.use(metricsMiddleware);

// ─── REQUEST LOGGING ────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ─── METRICS ENDPOINT ───────────────────────────────────────────────────────
// GET /metrics — Prometheus scraping endpoint — Ref: Law 4.1
app.get('/metrics', metricsHandler);

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
// GET /health — Public, no auth — Authorization Decision C
app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
    checks.status = 'degraded';
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = 'connected';
  } catch {
    checks.redis = 'disconnected';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});

// GET /ready — Kubernetes readiness probe — Ref: Law 4.2
app.get('/ready', async (_req, res) => {
  try {
    // Check if Prisma can execute queries
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch {
    res.status(503).json({ ready: false, reason: 'database_unavailable' });
  }
});

// ─── DEFAULT RATE LIMITER ───────────────────────────────────────────────────
// 100 per user per minute for all routes — Ref: Primary Spec Section 19
app.use('/api', defaultLimiter);

// ─── API DOCUMENTATION ──────────────────────────────────────────────────────
// OpenAPI/Swagger UI — Ref: Law 5.1
app.use('/api-docs', swaggerRouter);

// ─── API ROUTES ─────────────────────────────────────────────────────────────
// Strict /api/v1/ prefix — Authorization Decision D
const API_PREFIX = `/api/${env.API_VERSION}`;

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/member`, memberRouter);
app.use(`${API_PREFIX}/membership`, membershipRouter);
app.use(`${API_PREFIX}/stores`, storesRouter);
app.use(`${API_PREFIX}/cashier`, cashierRouter);
app.use(`${API_PREFIX}/transactions`, transactionsRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/pos`, posRouter);

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
// Ref: Primary Spec Section 22
app.use(globalErrorHandler);

export default app;
