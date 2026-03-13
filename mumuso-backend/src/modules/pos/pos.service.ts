// POS service — Public API for Mock POS Demo Terminal
// These endpoints are for demo purposes and use API key authentication
// Real CBS POS integration would use different authentication

import { prisma } from '../../config/database';
import { logger } from '../../middleware/logger';
import { AppError } from '../../middleware/errorHandler';
import moment from 'moment-timezone';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ValidateMembershipInput {
  member_id: string;
  store_id: string;
  cart_total: number;
  timestamp: string;
}

export interface RecordTransactionInput {
  transaction_id: string;
  member_id: string;
  store_id: string;
  store_name: string;
  timestamp: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  tax_amount: number;
  payment_method: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  cashier_id: string;
  pos_terminal_id: string;
}

// ─── POST /api/pos/validate-membership ─────────────────────────────────────

export async function validateMembership(input: ValidateMembershipInput) {
  const { member_id, store_id, cart_total } = input;

  // Look up membership
  const membership = await prisma.membership.findUnique({
    where: { member_id },
    include: {
      user: { select: { id: true, full_name: true } },
    },
  });

  // Member not found
  if (!membership) {
    logger.info('[POS] Member not found', { member_id });
    return {
      valid: false,
      member_status: 'not_found',
      discount_percentage: 0,
      discount_amount: 0,
      message: 'Member ID not found',
    };
  }

  // Check if suspended
  if (membership.status === 'suspended') {
    return {
      valid: false,
      member_id,
      member_status: 'suspended',
      discount_percentage: 0,
      discount_amount: 0,
      message: 'Membership has been suspended',
    };
  }

  // Check if expired
  const today = moment.tz('Asia/Karachi').startOf('day');
  const expiryDate = moment.tz(membership.expiry_date, 'Asia/Karachi').startOf('day');

  if (membership.status === 'expired' || expiryDate.isBefore(today)) {
    return {
      valid: false,
      member_id,
      member_status: 'expired',
      discount_percentage: 0,
      discount_amount: 0,
      expiry_date: membership.expiry_date.toISOString().split('T')[0],
      message: `Membership expired on ${expiryDate.format('DD/MM/YYYY')}`,
    };
  }

  // Get store discount
  const store = await prisma.store.findUnique({
    where: { id: store_id },
    select: { discount_pct: true, is_active: true },
  });

  if (!store || !store.is_active || !store.discount_pct) {
    throw new AppError('NOT_FOUND', 'Store not found or not configured', 404);
  }

  // Calculate discount
  const discountPercentage = Number(store.discount_pct);
  const discountAmount = (cart_total * discountPercentage) / 100;

  logger.info('[POS] Member validated successfully', {
    member_id,
    store_id,
    discount_percentage: discountPercentage,
  });

  return {
    valid: true,
    member_id,
    member_name: membership.user.full_name,
    member_status: 'active',
    discount_percentage: discountPercentage,
    discount_amount: Number(discountAmount.toFixed(2)),
    expiry_date: membership.expiry_date.toISOString().split('T')[0],
    message: 'Discount applied successfully',
  };
}

// ─── POST /api/pos/record-transaction ──────────────────────────────────────

export async function recordTransaction(input: RecordTransactionInput) {
  const { member_id, store_id, original_amount, discount_amount, final_amount, items } = input;

  // Look up member
  const membership = await prisma.membership.findUnique({
    where: { member_id },
    select: { user_id: true },
  });

  if (!membership) {
    throw new AppError('NOT_FOUND', 'Member not found', 404);
  }

  // Get store discount to calculate percentage
  const store = await prisma.store.findUnique({
    where: { id: store_id },
    select: { discount_pct: true },
  });

  const discountPct = store?.discount_pct ? Number(store.discount_pct) : 0;

  // Create transaction record
  const transaction = await prisma.transaction.create({
    data: {
      member_id,
      user_id: membership.user_id,
      store_id,
      cashier_id: membership.user_id, // Demo: use member's user_id as placeholder
      original_amount,
      discount_pct: discountPct,
      discount_amount,
      final_amount,
      discount_type: 'full',
      is_offline_sync: false,
      local_id: input.transaction_id,
    },
  });

  logger.info('[POS] Transaction recorded', {
    transaction_id: transaction.id,
    member_id,
    store_id,
    final_amount,
  });

  // Create notification for member
  await prisma.notification.create({
    data: {
      user_id: membership.user_id,
      title: 'Purchase Complete',
      body: `You saved Rs. ${discount_amount.toFixed(2)} on your purchase!`,
      type: 'transaction_confirm',
      deep_link: 'mumuso://transactions',
      metadata: {
        transaction_id: transaction.id,
        discount_amount,
        items_count: items.length,
      },
    },
  });

  return {
    success: true,
    transaction_id: input.transaction_id,
    message: 'Transaction recorded successfully',
  };
}

// ─── GET /api/pos/stores ────────────────────────────────────────────────────

export async function getStores() {
  const stores = await prisma.store.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      city: true,
      address: true,
    },
    orderBy: { name: 'asc' },
  });

  return {
    stores: stores.map((s) => ({
      store_id: s.id,
      name: s.name,
      city: s.city,
      address: s.address,
    })),
  };
}
