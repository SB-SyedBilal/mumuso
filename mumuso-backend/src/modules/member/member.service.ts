// Member service — business logic for customer endpoints — Ref: Primary Spec Section 8

import { Decimal } from 'decimal.js';
import moment from 'moment-timezone';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';
import { generateQRToken } from '../../utils/qrToken';
import { parsePaginationParams, buildPaginationResult, getSkip } from '../../utils/pagination';
import {
  UpdateProfileInput,
  DeviceTokenInput,
  DeleteDeviceTokenInput,
  NotificationPreferencesInput,
  TransactionsQueryInput,
} from './member.schema';

// GET /member/dashboard — Ref: Primary Spec Section 8
// Authorization Decision E: active_campaign returns null
export async function getDashboard(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { user_id: userId },
    include: { plan: true },
  });

  if (!membership) {
    return {
      has_membership: false,
      member_id: null,
      status: null,
      expiry_date: null,
      days_remaining: 0,
      total_saved: 0,
      total_transactions: 0,
      recent_transactions: [],
      active_campaign: null, // Authorization Decision E
    };
  }

  // Calculate days remaining
  const today = moment.tz('Asia/Karachi').startOf('day');
  const expiry = moment.tz(membership.expiry_date, 'Asia/Karachi').startOf('day');
  const daysRemaining = Math.max(0, expiry.diff(today, 'days'));

  // Total savings — use decimal.js for monetary precision (Authorization Decision B)
  const transactions = await prisma.transaction.findMany({
    where: { user_id: userId },
    select: { discount_amount: true },
  });
  const totalSaved = transactions.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  // Recent transactions (last 5)
  const recentTransactions = await prisma.transaction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 5,
    include: { store: { select: { name: true } } },
  });

  // Stats — Ref: Supplement Section 6.1
  const thisMonthStart = moment.tz('Asia/Karachi').startOf('month').toDate();
  const thisMonthTransactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      created_at: { gte: thisMonthStart },
    },
    select: { discount_amount: true },
  });
  const thisMonthSaved = thisMonthTransactions.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  return {
    member_id: membership.member_id,
    status: membership.status,
    expiry_date: membership.expiry_date,
    days_remaining: daysRemaining,
    total_saved: totalSaved.toNumber(),
    total_transactions: transactions.length,
    recent_transactions: recentTransactions.map((t) => ({
      id: t.id,
      store_name: t.store.name,
      date: moment.tz(t.created_at, 'Asia/Karachi').format('YYYY-MM-DD'),
      discount_amount: Number(t.discount_amount),
      final_amount: Number(t.final_amount),
      discount_type: t.discount_type,
    })),
    membership: {
      plan_name: membership.plan?.name ?? 'Annual Membership',
      activated_at: membership.activated_at,
      renewal_eligible: daysRemaining <= 30,
      auto_renew: false, // Future feature placeholder — Ref: Supplement Section 6.1
    },
    stats: {
      this_month_saved: thisMonthSaved.toNumber(),
      favorite_store: recentTransactions[0]?.store.name ?? null,
      last_transaction_date: recentTransactions[0]
        ? moment.tz(recentTransactions[0].created_at, 'Asia/Karachi').format('YYYY-MM-DD')
        : null,
    },
    active_campaign: null, // Authorization Decision E
  };
}

// GET /member/qr-token — Ref: Primary Spec Section 8, 14
// Never cache — always generate fresh
export async function getQRToken(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { user_id: userId },
    select: { member_id: true, status: true, expiry_date: true },
  });

  if (!membership || membership.status !== 'active') {
    throw new AppError('PAYMENT_REQUIRED', 'Active membership required to generate QR token', 402);
  }

  const token = generateQRToken(membership.member_id);
  const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5 minutes

  return {
    token,
    expires_at: expiresAt,
    member_id: membership.member_id,
  };
}

// GET /member/status — Ref: Primary Spec Section 8
export async function getMemberStatus(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { user_id: userId },
    select: { member_id: true, status: true, expiry_date: true },
  });

  return {
    has_membership: !!membership,
    status: membership?.status ?? null,
    expiry_date: membership?.expiry_date ?? null,
    member_id: membership?.member_id ?? null,
  };
}

// PUT /member/profile — Ref: Primary Spec Section 8
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.full_name ? { full_name: input.full_name } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
    },
    select: { id: true, full_name: true, email: true, phone: true },
  });

  return user;
}

// POST /member/device-token — Ref: Primary Spec Section 8
// One active token per user per platform
export async function registerDeviceToken(userId: string, input: DeviceTokenInput) {
  // Deactivate old token for same user + platform
  await prisma.deviceToken.updateMany({
    where: { user_id: userId, platform: input.platform, is_active: true },
    data: { is_active: false },
  });

  await prisma.deviceToken.create({
    data: {
      user_id: userId,
      token: input.token,
      platform: input.platform,
      is_active: true,
    },
  });

  logger.info('Device token registered', { userId, platform: input.platform });
  return { registered: true };
}

// DELETE /member/device-token — Ref: Supplement Section 6.3
// Soft delete for audit trail
export async function deleteDeviceToken(userId: string, input: DeleteDeviceTokenInput) {
  await prisma.deviceToken.updateMany({
    where: { user_id: userId, token: input.token },
    data: { is_active: false },
  });

  return { removed: true };
}

// PUT /member/notification-preferences — Ref: Primary Spec Section 8
export async function updateNotificationPreferences(
  userId: string,
  input: NotificationPreferencesInput,
) {
  const prefs = await prisma.notificationPreference.upsert({
    where: { user_id: userId },
    update: input,
    create: { user_id: userId, ...input },
  });

  return prefs;
}

// GET /member/transactions — Ref: Primary Spec Section 8
export async function getTransactions(userId: string, query: TransactionsQueryInput) {
  const { page, limit } = parsePaginationParams(query);
  const skip = getSkip(page, limit);

  const where: Record<string, unknown> = { user_id: userId };
  if (query.store_id) where.store_id = query.store_id;
  if (query.from_date || query.to_date) {
    where.created_at = {
      ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
      ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: { store: { select: { name: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Summary — Authorization Decision B: decimal.js for monetary precision
  const allDiscounts = await prisma.transaction.findMany({
    where: { user_id: userId },
    select: { discount_amount: true },
  });
  const totalSaved = allDiscounts.reduce(
    (sum, t) => sum.plus(new Decimal(t.discount_amount.toString())),
    new Decimal(0),
  );

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      store_name: t.store.name,
      date: moment.tz(t.created_at, 'Asia/Karachi').format('YYYY-MM-DD'),
      original_amount: Number(t.original_amount),
      discount_amount: Number(t.discount_amount),
      final_amount: Number(t.final_amount),
      discount_pct: Number(t.discount_pct),
      discount_type: t.discount_type,
      is_offline_sync: t.is_offline_sync,
    })),
    pagination: buildPaginationResult(page, limit, total),
    summary: {
      total_saved: totalSaved.toNumber(),
      total_transactions: allDiscounts.length,
    },
  };
}

// GET /member/transactions/:id — Ref: Primary Spec Section 8
// User can only access their own transactions
export async function getTransactionById(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, user_id: userId },
    include: { store: { select: { name: true, city: true } } },
  });

  if (!transaction) {
    throw new AppError('NOT_FOUND', 'Transaction not found', 404);
  }

  return {
    id: transaction.id,
    member_id: transaction.member_id,
    store_name: transaction.store.name,
    store_city: transaction.store.city,
    date: moment.tz(transaction.created_at, 'Asia/Karachi').format('YYYY-MM-DD HH:mm'),
    original_amount: Number(transaction.original_amount),
    discount_pct: Number(transaction.discount_pct),
    discount_amount: Number(transaction.discount_amount),
    final_amount: Number(transaction.final_amount),
    discount_type: transaction.discount_type,
    is_offline_sync: transaction.is_offline_sync,
  };
}
