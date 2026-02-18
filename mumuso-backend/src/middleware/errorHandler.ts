// Global error handler — Ref: Primary Spec Section 22
// Never return stack traces in production. Log full error with Winston.

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';
import { sendError, ErrorCodes } from '../utils/response';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: { field: string; message: string }[];

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(
      res,
      ErrorCodes.VALIDATION_ERROR.code,
      'Validation failed',
      ErrorCodes.VALIDATION_ERROR.status,
      details,
    );
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Unexpected errors — log full stack, return sanitised response
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  sendError(
    res,
    ErrorCodes.INTERNAL_ERROR.code,
    isProduction ? 'An unexpected error occurred' : err.message,
    ErrorCodes.INTERNAL_ERROR.status,
  );
}
