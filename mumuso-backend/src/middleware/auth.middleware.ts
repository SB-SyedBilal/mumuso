// JWT verification and role injection middleware — Ref: Primary Spec Section 18
// Verifies access token, injects user object into req.user

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { sendError, ErrorCodes } from '../utils/response';
import { logger } from './logger';
import { UserRole } from '../types';

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  store_id?: string;
  iat: number;
  exp: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, ErrorCodes.TOKEN_INVALID.code, 'Missing or invalid authorization header', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      store_id: decoded.store_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, ErrorCodes.TOKEN_EXPIRED.code, 'Access token has expired', 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, ErrorCodes.TOKEN_INVALID.code, 'Invalid access token', 401);
      return;
    }
    logger.error('Unexpected auth error', { error });
    sendError(res, ErrorCodes.INTERNAL_ERROR.code, 'Authentication failed', 500);
  }
}

// Verify refresh token — checks Redis blocklist
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    // Check if token is blocklisted — Ref: Primary Spec Section 19
    const isBlocked = await redis.get(`blocklist:${token}`);
    if (isBlocked) {
      return null;
    }

    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
