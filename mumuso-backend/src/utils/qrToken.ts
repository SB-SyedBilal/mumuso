// QR token generation and verification — Ref: Primary Spec Section 14
// Dual-secret support for rotation — Ref: Supplement Section 3.1
// Clock skew tolerance ±60s — Ref: Supplement Section 3.2

import crypto from 'crypto';
import { env } from '../config/env';
import { QRTokenPayload, QRTokenFull, QRVerificationResult } from '../types';
import { logger } from '../middleware/logger';

const TOKEN_TTL = 300; // 5 minutes in seconds — Ref: Primary Spec Rule 5
const CLOCK_SKEW_TOLERANCE = 60; // ±60 seconds — Ref: Supplement Section 3.2

function signPayload(payload: QRTokenPayload, secret: string): string {
  const payloadStr = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
}

// Generate a signed QR token — Ref: Primary Spec Section 14
export function generateQRToken(memberId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: QRTokenPayload = {
    memberId,
    issuedAt: now,
    expiresAt: now + TOKEN_TTL,
  };

  const signature = signPayload(payload, env.QR_SECRET);
  const fullPayload: QRTokenFull = { ...payload, signature };

  return Buffer.from(JSON.stringify(fullPayload)).toString('base64');
}

// Verify with a specific secret — internal helper
function verifyWithSecret(
  decoded: QRTokenFull,
  secret: string,
): QRVerificationResult {
  const now = Math.floor(Date.now() / 1000);

  // Check expiry with clock skew tolerance — Ref: Supplement Section 3.2
  if (decoded.expiresAt + CLOCK_SKEW_TOLERANCE < now) {
    return { valid: false, reason: 'token_expired' };
  }

  // Verify HMAC signature
  const payload: QRTokenPayload = {
    memberId: decoded.memberId,
    issuedAt: decoded.issuedAt,
    expiresAt: decoded.expiresAt,
  };
  const expectedSig = signPayload(payload, secret);

  if (decoded.signature !== expectedSig) {
    return { valid: false, reason: 'invalid_signature' };
  }

  return { valid: true, memberId: decoded.memberId };
}

// Verify QR token with dual-secret support — Ref: Supplement Section 3.1
// Try primary secret first, then secondary (24h grace period during rotation)
export function verifyQRToken(token: string): QRVerificationResult {
  try {
    const jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    const decoded = JSON.parse(jsonStr) as QRTokenFull;

    if (!decoded.memberId || !decoded.issuedAt || !decoded.expiresAt || !decoded.signature) {
      return { valid: false, reason: 'malformed_token' };
    }

    // Try primary secret first
    const primaryResult = verifyWithSecret(decoded, env.QR_SECRET);
    if (primaryResult.valid) {
      return primaryResult;
    }

    // Try secondary secret (grace period) — Ref: Supplement Section 3.1
    if (env.QR_SECRET_OLD) {
      const secondaryResult = verifyWithSecret(decoded, env.QR_SECRET_OLD);
      if (secondaryResult.valid) {
        logger.info('QR token verified with secondary (old) secret — rotation in progress', {
          memberId: decoded.memberId,
        });
        return secondaryResult;
      }
    }

    // Both secrets failed — return the primary result reason
    return primaryResult;
  } catch {
    return { valid: false, reason: 'malformed_token' };
  }
}
