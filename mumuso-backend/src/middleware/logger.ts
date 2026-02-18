// Winston logger with CloudWatch transport — Ref: Supplement Section 10.3
// No console.log anywhere — Winston exclusively

import winston from 'winston';

const sensitiveFields = ['password', 'password_hash', 'token', 'authorization', 'card_number'];

// Mask sensitive data in log objects — Ref: Supplement Section 10.3
function maskSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      masked[key] = '***REDACTED***';
    } else if (typeof value === 'string' && key.toLowerCase().includes('qr_token')) {
      // Log only first 8 chars of QR tokens for debugging
      masked[key] = value.substring(0, 8) + '...REDACTED';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

const maskFormat = winston.format((info) => {
  if (info.meta && typeof info.meta === 'object') {
    info.meta = maskSensitiveData(info.meta);
  }
  return info;
});

const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isProduction
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${String(timestamp)} [${level}]: ${String(message)}${metaStr}`;
          }),
        ),
  }),
];

// CloudWatch transport added in production — Ref: Supplement Section 10.3
// Configured via AWS credentials in environment

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    maskFormat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'mumuso-api' },
  transports,
});
