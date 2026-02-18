// Correlation ID middleware for distributed tracing
// Ref: Law 4.1 - Distributed tracing with correlation IDs

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from './logger';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract correlation ID from header or generate new one
  const correlationId = 
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    randomUUID();

  // Attach to request
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Add to logger context
  logger.defaultMeta = {
    ...logger.defaultMeta,
    correlationId,
  };

  next();
}
