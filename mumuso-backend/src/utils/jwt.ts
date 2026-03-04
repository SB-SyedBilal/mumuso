// JWT token sign and verify helpers — Ref: Primary Spec Section 19
// Access token: 15m, Refresh token: 30d

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  store_id?: string;
}

export function signAccessToken(payload: TokenPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as object, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as any,
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as object, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as any,
  });
}

export function generateTokenPair(payload: TokenPayload): {
  access_token: string;
  refresh_token: string;
} {
  return {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
}

export function decodeRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Get refresh token TTL in seconds for Redis blocklist
export function getRefreshTokenTTL(): number {
  const expiry = env.REFRESH_TOKEN_EXPIRY;
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 30 * 24 * 60 * 60; // default 30 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 30 * 24 * 60 * 60;
  }
}
