// Redis client singleton — Ref: Primary Spec Section 4, Supplement Section 8.3
// Used for: refresh token blocklist, rate limiting, QR token rate limiting, store discount cache

import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../middleware/logger';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    lazyConnect: true,
  });

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err: Error) => {
  logger.error('Redis connection error', { error: err.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', { error });
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info('Redis disconnected');
}

// Key TTLs — Ref: Supplement Section 8.3
export const REDIS_TTL = {
  REFRESH_TOKEN_BLOCKLIST: 30 * 24 * 60 * 60, // 30 days
  RATE_LIMIT_COUNTERS: 60 * 60,                // 1 hour
  QR_TOKEN_RATE_LIMIT: 5 * 60,                 // 5 minutes
  STORE_DISCOUNT_CACHE: 60 * 60,               // 1 hour
} as const;
