// Prometheus metrics middleware
// Ref: Law 4.1 - RED (Rate, Errors, Duration) metrics

import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';

// Enable default metrics (CPU, memory, event loop lag)
promClient.collectDefaultMetrics({ prefix: 'mumuso_' });

// Custom metrics registry
export const register = promClient.register;

// HTTP request duration histogram (RED - Duration)
export const httpRequestDuration = new promClient.Histogram({
  name: 'mumuso_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // 10ms to 5s
});

// HTTP request counter (RED - Rate)
export const httpRequestTotal = new promClient.Counter({
  name: 'mumuso_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// HTTP error counter (RED - Errors)
export const httpErrorTotal = new promClient.Counter({
  name: 'mumuso_http_errors_total',
  help: 'Total number of HTTP errors (4xx, 5xx)',
  labelNames: ['method', 'route', 'status_code', 'error_code'],
});

// Active connections gauge
export const activeConnections = new promClient.Gauge({
  name: 'mumuso_active_connections',
  help: 'Number of active connections',
});

// Database query duration
export const dbQueryDuration = new promClient.Histogram({
  name: 'mumuso_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

// Redis operation duration
export const redisOpDuration = new promClient.Histogram({
  name: 'mumuso_redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
});

// QR token generation counter
export const qrTokenGenerated = new promClient.Counter({
  name: 'mumuso_qr_tokens_generated_total',
  help: 'Total number of QR tokens generated',
  labelNames: ['member_id'],
});

// QR token validation counter
export const qrTokenValidation = new promClient.Counter({
  name: 'mumuso_qr_token_validations_total',
  help: 'Total number of QR token validations',
  labelNames: ['result'], // valid, expired, invalid_signature, malformed
});

// Payment transaction counter
export const paymentTransactions = new promClient.Counter({
  name: 'mumuso_payment_transactions_total',
  help: 'Total number of payment transactions',
  labelNames: ['status', 'gateway'], // pending, completed, failed, refunded
});

// Membership status gauge
export const membershipStatus = new promClient.Gauge({
  name: 'mumuso_memberships_by_status',
  help: 'Number of memberships by status',
  labelNames: ['status'], // active, expired, suspended
});

// Metrics middleware
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();

  // Extract route pattern (remove IDs)
  const route = req.route?.path || req.path;
  const routePattern = route.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');

  // Capture response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();

    // Record duration
    httpRequestDuration.observe(
      { method: req.method, route: routePattern, status_code: statusCode },
      duration
    );

    // Record request count
    httpRequestTotal.inc({
      method: req.method,
      route: routePattern,
      status_code: statusCode,
    });

    // Record errors (4xx, 5xx)
    if (res.statusCode >= 400) {
      const errorCode = (res.locals.errorCode as string) || 'UNKNOWN';
      httpErrorTotal.inc({
        method: req.method,
        route: routePattern,
        status_code: statusCode,
        error_code: errorCode,
      });
    }

    // Decrement active connections
    activeConnections.dec();
  });

  next();
}

// Metrics endpoint handler
export function metricsHandler(_req: Request, res: Response): void {
  res.set('Content-Type', register.contentType);
  register.metrics().then((metrics) => {
    res.end(metrics);
  }).catch((err) => {
    res.status(500).end(err);
  });
}
