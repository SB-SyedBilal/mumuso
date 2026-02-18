// Standardised API response formatter — Ref: Primary Spec Section 22

import { Response } from 'express';
import { StandardError, FieldError } from '../types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number,
  details?: FieldError[],
): void {
  const error: StandardError = { code, message };
  if (details && details.length > 0) {
    error.details = details;
  }
  res.status(statusCode).json({
    success: false,
    error,
  });
}

// Pre-built error responses — Ref: Primary Spec Section 22, Error Codes table
export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401 },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401 },
  TOKEN_INVALID: { code: 'TOKEN_INVALID', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  ALREADY_EXISTS: { code: 'ALREADY_EXISTS', status: 409 },
  PAYMENT_REQUIRED: { code: 'PAYMENT_REQUIRED', status: 402 },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
} as const;
