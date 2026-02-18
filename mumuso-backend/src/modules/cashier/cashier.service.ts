// Cashier service — THE MOST CRITICAL BUSINESS LOGIC — Ref: Primary Spec Section 11, 17
// Must handle all 6 transaction scenarios correctly

import moment from 'moment-timezone';
import { prisma } from '../../config/database';
import { logger } from '../../middleware/logger';
import { verifyQRToken } from '../../utils/qrToken';
import { ValidateMemberInput } from './cashier.schema';

// ─── POST /cashier/validate ─────────────────────────────────────────────────
// Ref: Primary Spec Section 11, 17 — All six scenarios
// Scenario 1: Valid member, QR scan → valid: true + discount %
// Scenario 2: Valid member, manual ID → valid: true + discount % + manual_entry: true
// Scenario 3: Membership expired → valid: false, reason: expired
// Scenario 4: Member not found → valid: false, reason: not_found
// Scenario 5: Partial discount → valid: true + discount % (partial handled at record time)
// Scenario 6: Offline sync → N/A (validated locally, recorded via /transactions/sync)

export async function validateMember(input: ValidateMemberInput, cashierId: string) {
  let memberId: string | undefined;
  let manualEntry = false;

  // ─── Step 1: Extract member_id from QR token or manual input ──────────
  if (input.qr_token) {
    // QR scan path — Ref: Primary Spec Section 11, validation logic steps 1-5
    const qrResult = verifyQRToken(input.qr_token);

    if (!qrResult.valid) {
      // Scenario: Invalid Token Signature
      logger.warn('QR token verification failed', {
        reason: qrResult.reason,
        cashierId,
        storeId: input.store_id,
      });

      return {
        valid: false,
        reason: qrResult.reason === 'token_expired' ? 'token_expired' : 'invalid_token',
        message:
          qrResult.reason === 'token_expired'
            ? 'QR code has expired. Ask customer to refresh their card.'
            : 'QR code is invalid. Ask customer to refresh their card.',
      };
    }

    memberId = qrResult.memberId;
  } else if (input.member_id) {
    // Manual ID entry path — Ref: Primary Spec Section 11, steps for manual entry
    memberId = input.member_id;
    manualEntry = true;
  }

  if (!memberId) {
    return {
      valid: false,
      reason: 'invalid_input',
      message: 'No QR token or member ID provided.',
    };
  }

  // ─── Step 2: Look up membership — Ref: Primary Spec Section 11, steps 6-8 ─
  const membership = await prisma.membership.findUnique({
    where: { member_id: memberId },
    include: {
      user: { select: { id: true, full_name: true } },
    },
  });

  // Scenario 4: Member not found
  if (!membership) {
    logger.info('Member not found during validation', { memberId, cashierId });
    return {
      valid: false,
      reason: 'not_found',
      message: 'Member not found. Ask customer to verify their ID.',
    };
  }

  // Scenario: Suspended
  if (membership.status === 'suspended') {
    return {
      valid: false,
      reason: 'suspended',
      member_name: membership.user.full_name,
      message: 'Account suspended. Direct customer to Mumuso support.',
    };
  }

  // Scenario 3: Membership expired — Ref: Primary Spec Rule 10
  const today = moment.tz('Asia/Karachi').startOf('day');
  const expiryDate = moment.tz(membership.expiry_date, 'Asia/Karachi').startOf('day');

  if (membership.status === 'expired' || expiryDate.isBefore(today)) {
    return {
      valid: false,
      reason: 'expired',
      expired_on: membership.expiry_date,
      member_name: membership.user.full_name,
      message: 'Membership expired. Ask customer to renew in their app.',
      renewal_prompt: true,
    };
  }

  // ─── Step 3: Look up store discount — Ref: Primary Spec Section 11, step 9 ─
  const store = await prisma.store.findUnique({
    where: { id: input.store_id },
    select: { id: true, name: true, discount_pct: true, is_active: true },
  });

  if (!store || !store.is_active || !store.discount_pct) {
    logger.error('Store not found or not configured during validation', {
      storeId: input.store_id,
      cashierId,
    });
    return {
      valid: false,
      reason: 'store_error',
      message: 'Store not configured. Contact HQ.',
    };
  }

  // ─── Scenario 1 & 2: Valid member ─────────────────────────────────────
  // Calculate days until expiry for warnings — Ref: Supplement Section 6.2
  const daysUntilExpiry = expiryDate.diff(today, 'days');
  const warnings: string[] = [];
  if (daysUntilExpiry <= 7) {
    warnings.push('membership_expires_in_7_days');
  } else if (daysUntilExpiry <= 30) {
    warnings.push('membership_expires_in_30_days');
  }

  logger.info('Member validated successfully', {
    memberId,
    cashierId,
    storeId: input.store_id,
    manualEntry,
    discountPct: Number(store.discount_pct),
  });

  return {
    valid: true,
    member_id: membership.member_id,
    member_name: membership.user.full_name,
    discount_pct: Number(store.discount_pct),
    expiry_date: membership.expiry_date,
    membership_status: membership.status,
    manual_entry: manualEntry,
    message: `Active member. Apply ${Number(store.discount_pct)}% discount.`,
    // Enhanced response — Ref: Supplement Section 6.2
    validation: {
      method: manualEntry ? 'manual_entry' : 'qr_scan',
      validated_at: new Date().toISOString(),
      cashier_id: cashierId,
      store_discount_pct: Number(store.discount_pct),
    },
    warnings,
  };
}

// GET /cashier/store-config — Ref: Primary Spec Section 11
export async function getStoreConfig(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      discount_pct: true,
      updated_at: true,
    },
  });

  if (!store) {
    return null;
  }

  return {
    store_id: store.id,
    store_name: store.name,
    discount_pct: store.discount_pct ? Number(store.discount_pct) : null,
    last_updated: store.updated_at,
  };
}
