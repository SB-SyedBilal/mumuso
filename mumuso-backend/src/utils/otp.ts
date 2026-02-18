// OTP generation and validation — Ref: Primary Spec Section 7 (auth endpoints)
// 6-digit OTP, 10-minute expiry, max 3 attempts before lockout

import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

export function generateOTP(): string {
  // Generate cryptographically secure 6-digit OTP
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0) % 1000000;
  return num.toString().padStart(OTP_LENGTH, '0');
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function isOTPLocked(attempts: number): boolean {
  return attempts >= MAX_ATTEMPTS;
}

export { MAX_ATTEMPTS, OTP_EXPIRY_MINUTES };
