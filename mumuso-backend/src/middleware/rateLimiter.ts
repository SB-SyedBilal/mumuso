// Per-endpoint rate limiting — Ref: Primary Spec Section 19, Supplement Section 7.1
// Uses express-rate-limit with Redis store pattern via ioredis

import rateLimit from 'express-rate-limit';
import { Request, RequestHandler } from 'express';
import { redis } from '../config/redis';
import { logger } from './logger';
import { env } from '../config/env';

// Custom Redis store for rate limiting
class RedisRateLimitStore {
  private prefix: string;
  private windowMs: number;

  constructor(prefix: string, windowMs: number) {
    this.prefix = prefix;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const redisKey = `${this.prefix}:${key}`;
    const multi = redis.multi();
    multi.incr(redisKey);
    multi.pttl(redisKey);
    const results = await multi.exec();

    const totalHits = (results?.[0]?.[1] as number) || 1;
    const ttl = (results?.[1]?.[1] as number) || -1;

    if (ttl === -1) {
      await redis.pexpire(redisKey, this.windowMs);
    }

    const resetTime = new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs));
    return { totalHits, resetTime };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = `${this.prefix}:${key}`;
    await redis.decr(redisKey);
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = `${this.prefix}:${key}`;
    await redis.del(redisKey);
  }
}

// Rate limiter factory
function createLimiter(options: {
  windowMs: number;
  max: number;
  prefix: string;
  keyGenerator?: (req: Request) => string;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisRateLimitStore(options.prefix, options.windowMs) as never,
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip || 'unknown'),
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: options.message || 'Too many requests, please try again later',
      },
    },
    handler: (_req, res, _next, optionsUsed) => {
      logger.warn('Rate limit exceeded', {
        prefix: options.prefix,
        ip: _req.ip,
        userId: _req.user?.id,
      });
      res.status(429).json(optionsUsed.message);
    },
  });
}

// Pre-configured limiters — Ref: Primary Spec Section 19

// POST /auth/register — 5 per IP per hour
export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  prefix: 'rl:register',
  message: 'Too many registration attempts. Try again in 1 hour.',
});

// POST /auth/login — 5 failed attempts per email per 15 min
const loginAllowlist = new Set(
  env.LOGIN_RATE_LIMIT_ALLOWLIST.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0),
);

const baseLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: 'rl:login',
  keyGenerator: (req: Request) => (req.body as { email?: string })?.email || req.ip || 'unknown',
  message: 'Too many login attempts. Account locked for 30 minutes.',
});

export const loginLimiter: RequestHandler = (req, res, next) => {
  const email = (req.body as { email?: string })?.email?.toLowerCase();
  if (email && loginAllowlist.has(email)) {
    return next();
  }
  return baseLoginLimiter(req, res, next);
};

// POST /auth/forgot-password — 3 per email per hour
export const forgotPasswordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  prefix: 'rl:forgot',
  keyGenerator: (req: Request) => (req.body as { email?: string })?.email || req.ip || 'unknown',
  message: 'Too many password reset requests. Try again in 1 hour.',
});

// POST /cashier/validate — 120 per cashier per minute
export const cashierValidateLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  prefix: 'rl:cashier:validate',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: 'Too many validation requests.',
});

// GET /member/qr-token — 30 per user per minute
export const qrTokenLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  prefix: 'rl:qr',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: 'Too many QR token requests.',
});

// POST /membership/create-order — 3 per user per hour (Supplement Section 7.1)
export const createOrderLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  prefix: 'rl:create-order',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: 'Too many payment attempts. Try again in 1 hour.',
});

// POST /transactions/sync — 10 per cashier per minute (Supplement Section 7.1)
export const syncLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  prefix: 'rl:sync',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: 'Too many sync requests.',
});

// GET /stores — 60 per user per minute (Supplement Section 7.1)
export const storesLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  prefix: 'rl:stores',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: 'Too many store requests.',
});

// POST /auth/refresh — 10 per refresh token (Supplement Section 7.1)
export const refreshLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  prefix: 'rl:refresh',
  message: 'Too many token refresh attempts.',
});

// Default — 100 per user per minute
export const defaultLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  prefix: 'rl:default',
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
});
