// Zod-validated environment variables — Ref: Primary Spec Section 23
// All env vars validated at startup. Server refuses to start with invalid config.
import 'dotenv/config'; // Add this line at the top
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default('v1'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT — Ref: Primary Spec Section 19
  ACCESS_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),

  // QR Token — Ref: Primary Spec Section 14, Supplement Section 3.1
  QR_SECRET: z.string().min(32),
  QR_SECRET_OLD: z.string().optional(), // For 24h grace period during rotation

  // Safepay — Ref: Primary Spec Section 15, Supplement Section 2.1
  SAFEPAY_API_KEY: z.string().default(''),
  SAFEPAY_SECRET_KEY: z.string().default(''),
  SAFEPAY_WEBHOOK_SECRET: z.string().default(''),
  SAFEPAY_BASE_URL: z.string().url().default('https://sandbox.api.getsafepay.com'),
  SAFEPAY_MOCK_SCENARIO: z
    .enum(['SUCCESS', 'FAILED', 'TIMEOUT', 'DUPLICATE_WEBHOOK', ''])
    .default(''),

  // Stripe — Test mode for demos
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_MOCK_SCENARIO: z
    .enum(['SUCCESS', 'FAILED', 'TIMEOUT', 'DUPLICATE_WEBHOOK', ''])
    .default(''),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),

  // Twilio (SMS/OTP)
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_PHONE_NUMBER: z.string().default(''),

  // AWS
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_SES_FROM_EMAIL: z.string().default('noreply@mumuso.com'),
  AWS_S3_BUCKET: z.string().default('mumuso-assets'),

  // Discount Boundaries — Ref: Primary Spec Rule 3
  DISCOUNT_MIN_PCT: z.coerce.number().default(5),
  DISCOUNT_MAX_PCT: z.coerce.number().default(20),

  // Rate limit allowlists
  LOGIN_RATE_LIMIT_ALLOWLIST: z.string().default(''),

  // Feature Flags — Ref: Supplement Section 7.2
  IP_ALLOWLIST_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // POS Demo API Key
  POS_DEMO_API_KEY: z.string().default('demo-pos-api-key-12345'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

function validateEnv(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    const errorMessages = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errors = (value as { _errors?: string[] })._errors;
        return `  ${key}: ${errors?.join(', ') ?? 'unknown error'}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return parsed.data;
}

export const env = validateEnv();
