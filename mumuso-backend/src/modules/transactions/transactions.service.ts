// Transactions service — Ref: Primary Spec Section 12, Supplement Section 4
// Handles online recording and offline sync with deduplication

import { Decimal } from 'decimal.js';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';
import { env } from '../../config/env';
import { createAuditLog } from '../../services/audit.service';
import {
  RecordTransactionInput,
  SyncTransactionsInput,
  OfflineTransactionInput,
} from './transactions.schema';

// ─── POST /transactions/record — Ref: Primary Spec Section 12 ──────────────
// Online transaction recording — cashier records after validation
export async function recordTransaction(input: RecordTransactionInput, cashierId: string) {
  // Look up membership
  const membership = await prisma.membership.findUnique({
    where: { member_id: input.member_id },
    select: { user_id: true, status: true },
  });

  if (!membership || membership.status !== 'active') {
    throw new AppError('VALIDATION_ERROR', 'Member does not have an active membership', 400);
  }

  // Look up store discount — Ref: Primary Spec Rule 3
  const store = await prisma.store.findUnique({
    where: { id: input.store_id },
    select: { discount_pct: true },
  });

  if (!store || !store.discount_pct) {
    throw new AppError('VALIDATION_ERROR', 'Store discount not configured', 400);
  }

  // Calculate discount — Authorization Decision B: decimal.js for monetary precision
  const originalAmount = new Decimal(input.original_amount);
  let discountPct = new Decimal(store.discount_pct.toString());

  // Partial discount handling — Ref: Supplement Section 1.3
  // Authorization Decision 1.3: partial = 50% of store discount
  if (input.discount_type === 'partial') {
    discountPct = discountPct.dividedBy(2);
  }

  // Enforce boundaries — Ref: Primary Spec Rule 3
  const minPct = new Decimal(env.DISCOUNT_MIN_PCT);
  const maxPct = new Decimal(env.DISCOUNT_MAX_PCT);
  if (discountPct.lessThan(minPct)) discountPct = minPct;
  if (discountPct.greaterThan(maxPct)) discountPct = maxPct;

  const discountAmount = originalAmount.times(discountPct).dividedBy(100).toDecimalPlaces(2);
  const finalAmount = originalAmount.minus(discountAmount).toDecimalPlaces(2);

  const transaction = await prisma.transaction.create({
    data: {
      member_id: input.member_id,
      user_id: membership.user_id,
      store_id: input.store_id,
      cashier_id: cashierId,
      original_amount: originalAmount.toNumber(),
      discount_pct: discountPct.toNumber(),
      discount_amount: discountAmount.toNumber(),
      final_amount: finalAmount.toNumber(),
      discount_type: input.discount_type,
      partial_discount_reason: input.partial_discount_reason,
      is_offline_sync: false,
    },
    include: { store: { select: { name: true } } },
  });

  logger.info('Transaction recorded', {
    transactionId: transaction.id,
    memberId: input.member_id,
    storeId: input.store_id,
    originalAmount: originalAmount.toNumber(),
    discountAmount: discountAmount.toNumber(),
    finalAmount: finalAmount.toNumber(),
  });

  // Audit: TRANSACTION_RECORDED — Ref: Primary Spec Section 6
  await createAuditLog({
    actorId: cashierId,
    action: 'TRANSACTION_RECORDED',
    targetType: 'transaction',
    targetId: transaction.id,
    newValue: {
      member_id: input.member_id,
      store_id: input.store_id,
      original_amount: originalAmount.toNumber(),
      discount_amount: discountAmount.toNumber(),
      final_amount: finalAmount.toNumber(),
    },
  });

  // Push notification to member — Ref: Primary Spec Section 16
  await prisma.notification.create({
    data: {
      user_id: membership.user_id,
      title: `PKR ${discountAmount.toNumber()} saved!`,
      body: `You saved PKR ${discountAmount.toNumber()} at ${transaction.store.name} today.`,
      type: 'transaction_confirmed',
      deep_link: `mumuso://transactions/${transaction.id}`,
      metadata: { transaction_id: transaction.id },
    },
  });

  return {
    id: transaction.id,
    member_id: transaction.member_id,
    store_name: transaction.store.name,
    original_amount: Number(transaction.original_amount),
    discount_pct: Number(transaction.discount_pct),
    discount_amount: Number(transaction.discount_amount),
    final_amount: Number(transaction.final_amount),
    discount_type: transaction.discount_type,
    created_at: transaction.created_at,
  };
}

// ─── POST /transactions/sync — Ref: Primary Spec Section 12, Supplement Section 4
// Offline sync with deduplication by local_id and detailed per-transaction responses
export async function syncTransactions(input: SyncTransactionsInput, cashierId: string) {
  const results: Array<{
    local_id: string;
    status: 'created' | 'duplicate' | 'error';
    transaction_id?: string;
    error?: string;
  }> = [];

  for (const txn of input.transactions) {
    try {
      const result = await processOfflineTransaction(txn, cashierId);
      results.push(result);
    } catch (error) {
      logger.error('Failed to process offline transaction', {
        localId: txn.local_id,
        error,
      });
      results.push({
        local_id: txn.local_id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const created = results.filter((r) => r.status === 'created').length;
  const duplicates = results.filter((r) => r.status === 'duplicate').length;
  const errors = results.filter((r) => r.status === 'error').length;

  logger.info('Offline sync completed', {
    cashierId,
    total: input.transactions.length,
    created,
    duplicates,
    errors,
  });

  return {
    summary: {
      total: input.transactions.length,
      created,
      duplicates,
      errors,
    },
    results,
  };
}

// Process a single offline transaction — Ref: Supplement Section 4.2
async function processOfflineTransaction(
  txn: OfflineTransactionInput,
  cashierId: string,
): Promise<{
  local_id: string;
  status: 'created' | 'duplicate' | 'error';
  transaction_id?: string;
  error?: string;
}> {
  // Deduplication check by cashier_id + local_id compound unique — Ref: Supplement Section 4.1
  const existing = await prisma.transaction.findFirst({
    where: { cashier_id: cashierId, local_id: txn.local_id },
    select: { id: true },
  });

  if (existing) {
    return {
      local_id: txn.local_id,
      status: 'duplicate',
      transaction_id: existing.id,
    };
  }

  // Look up membership
  const membership = await prisma.membership.findUnique({
    where: { member_id: txn.member_id },
    select: { user_id: true, status: true },
  });

  if (!membership) {
    return {
      local_id: txn.local_id,
      status: 'error',
      error: 'Member not found',
    };
  }

  // Look up store discount
  const store = await prisma.store.findUnique({
    where: { id: txn.store_id },
    select: { discount_pct: true },
  });

  if (!store || !store.discount_pct) {
    return {
      local_id: txn.local_id,
      status: 'error',
      error: 'Store discount not configured',
    };
  }

  // Calculate discount — same logic as online recording
  const originalAmount = new Decimal(txn.original_amount);
  let discountPct = new Decimal(store.discount_pct.toString());

  if (txn.discount_type === 'partial') {
    discountPct = discountPct.dividedBy(2);
  }

  const minPct = new Decimal(env.DISCOUNT_MIN_PCT);
  const maxPct = new Decimal(env.DISCOUNT_MAX_PCT);
  if (discountPct.lessThan(minPct)) discountPct = minPct;
  if (discountPct.greaterThan(maxPct)) discountPct = maxPct;

  const discountAmount = originalAmount.times(discountPct).dividedBy(100).toDecimalPlaces(2);
  const finalAmount = originalAmount.minus(discountAmount).toDecimalPlaces(2);

  const transaction = await prisma.transaction.create({
    data: {
      member_id: txn.member_id,
      user_id: membership.user_id,
      store_id: txn.store_id,
      cashier_id: cashierId,
      original_amount: originalAmount.toNumber(),
      discount_pct: discountPct.toNumber(),
      discount_amount: discountAmount.toNumber(),
      final_amount: finalAmount.toNumber(),
      discount_type: txn.discount_type,
      partial_discount_reason: txn.partial_discount_reason,
      is_offline_sync: true,
      local_id: txn.local_id,
      created_at: new Date(txn.created_at), // Use device timestamp
    },
  });

  // Audit: TRANSACTION_OFFLINE_SYNCED — Ref: Primary Spec Section 6
  await createAuditLog({
    actorId: cashierId,
    action: 'TRANSACTION_OFFLINE_SYNCED',
    targetType: 'transaction',
    targetId: transaction.id,
    newValue: {
      local_id: txn.local_id,
      member_id: txn.member_id,
      store_id: txn.store_id,
    },
  });

  // Push notification to member — Ref: Primary Spec Section 16
  await prisma.notification.create({
    data: {
      user_id: membership.user_id,
      title: `PKR ${discountAmount.toNumber()} saved!`,
      body: `You saved PKR ${discountAmount.toNumber()} at a Mumuso store.`,
      type: 'transaction_confirmed',
      deep_link: `mumuso://transactions/${transaction.id}`,
      metadata: { transaction_id: transaction.id },
    },
  });

  return {
    local_id: txn.local_id,
    status: 'created' as const,
    transaction_id: transaction.id,
  };
}
