// Membership service — Ref: Primary Spec Section 9, 15
// Handles: list plans, create payment order, webhook processing, renewal

import { Decimal } from 'decimal.js';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';
import { generateMemberId } from '../../utils/memberId';
import { safepayService } from '../../services/safepay.service';
import { createAuditLog } from '../../services/audit.service';
import { CreateOrderInput, WebhookPayload } from './membership.schema';

// GET /membership/plans — Ref: Primary Spec Section 9
export async function listPlans() {
  const plans = await prisma.membershipPlan.findMany({
    where: { is_active: true },
    orderBy: { price: 'asc' },
  });

  return {
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      currency: p.currency,
      duration_months: p.duration_months,
      benefits: p.benefits,
    })),
  };
}

// POST /membership/create-order — Ref: Primary Spec Section 9, 15
// Creates a Safepay payment order and returns checkout URL/token
export async function createOrder(userId: string, input: CreateOrderInput) {
  // Check if user already has active membership
  const existingMembership = await prisma.membership.findUnique({
    where: { user_id: userId },
    select: { status: true, expiry_date: true },
  });

  const isRenewal = !!existingMembership;

  // Block if already active and not within renewal window (30 days)
  if (existingMembership && existingMembership.status === 'active') {
    const daysUntilExpiry = Math.floor(
      (existingMembership.expiry_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilExpiry > 30) {
      throw new AppError(
        'ALREADY_EXISTS',
        'You already have an active membership. Renewal is available within 30 days of expiry.',
        409,
      );
    }
  }

  // Get plan
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: input.plan_id, is_active: true },
  });

  if (!plan) {
    throw new AppError('NOT_FOUND', 'Membership plan not found', 404);
  }

  // Get user details for Safepay
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { full_name: true, email: true, phone: true },
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      user_id: userId,
      plan_id: plan.id,
      amount: plan.price,
      currency: plan.currency,
      gateway: 'safepay',
      is_renewal: isRenewal,
      idempotency_key: `${userId}_${plan.id}_${Date.now()}`,
    },
  });

  // Create Safepay order
  const safepayOrder = await safepayService.createOrder({
    userId,
    planId: plan.id,
    amount: new Decimal(plan.price.toString()).toNumber(),
    currency: plan.currency,
    orderId: payment.id,
    customerName: user.full_name,
    customerEmail: user.email,
    customerPhone: user.phone || '',
  });

  // Update payment with gateway order ID
  await prisma.payment.update({
    where: { id: payment.id },
    data: { gateway_order_id: safepayOrder.token },
  });

  logger.info('Payment order created', {
    paymentId: payment.id,
    userId,
    planId: plan.id,
    amount: Number(plan.price),
    isRenewal,
  });

  return {
    payment_id: payment.id,
    gateway_token: safepayOrder.token,
    amount: Number(plan.price),
    currency: plan.currency,
    expiry: safepayOrder.expiry,
    is_renewal: isRenewal,
  };
}

// POST /membership/webhook/safepay — Ref: Primary Spec Section 15
// Idempotent — Ref: Supplement Section 2.3
export async function processWebhook(payload: WebhookPayload) {
  const { event, data } = payload;

  // Find payment by gateway order ID
  const payment = await prisma.payment.findFirst({
    where: { gateway_order_id: data.order_id },
  });

  if (!payment) {
    logger.warn('Webhook received for unknown order', { orderId: data.order_id });
    return { processed: false, reason: 'unknown_order' };
  }

  // Idempotency check — Ref: Supplement Section 2.3
  if (payment.webhook_processed_at) {
    logger.info('Duplicate webhook ignored', {
      paymentId: payment.id,
      previouslyProcessedAt: payment.webhook_processed_at,
    });
    return { processed: true, reason: 'duplicate' };
  }

  if (event === 'payment.completed' || data.status === 'paid') {
    // Payment successful — activate/renew membership
    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          gateway_ref: data.payment_id,
          payment_method: data.payment_method,
          webhook_received: true,
          webhook_processed_at: new Date(),
        },
      });

      // Check for existing membership
      const existingMembership = await tx.membership.findUnique({
        where: { user_id: payment.user_id },
      });

      if (existingMembership) {
        // Renewal — Authorization Decision 1.7: extend from current_expiry + 365 days
        const currentExpiry = existingMembership.expiry_date;
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + 365);

        await tx.membership.update({
          where: { id: existingMembership.id },
          data: {
            status: 'active',
            expiry_date: newExpiry,
            payment_ref: data.payment_id,
            plan_id: payment.plan_id,
          },
        });

        logger.info('Membership renewed', {
          userId: payment.user_id,
          memberId: existingMembership.member_id,
          newExpiry,
        });
      } else {
        // New membership — generate member ID
        const memberId = await generateMemberId();
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 365);

        await tx.membership.create({
          data: {
            user_id: payment.user_id,
            member_id: memberId,
            status: 'active',
            plan_id: payment.plan_id,
            start_date: startDate,
            expiry_date: expiryDate,
            payment_ref: data.payment_id,
            activated_at: new Date(),
          },
        });

        logger.info('New membership created', {
          userId: payment.user_id,
          memberId,
          expiryDate,
        });
      }

      // Create notification for user
      await tx.notification.create({
        data: {
          user_id: payment.user_id,
          title: payment.is_renewal ? 'Membership Renewed!' : 'Welcome to Mumuso!',
          body: payment.is_renewal
            ? 'Your membership has been renewed successfully.'
            : 'Your membership is now active. Show your QR card at any Mumuso store.',
          type: payment.is_renewal ? 'membership_renewed' : 'membership_activated',
          deep_link: 'mumuso://dashboard',
          metadata: { payment_id: payment.id },
        },
      });
    });

    // Audit: PAYMENT_COMPLETED — Ref: Primary Spec Section 6
    await createAuditLog({
      actorId: payment.user_id,
      action: 'PAYMENT_COMPLETED',
      targetType: 'payment',
      targetId: payment.id,
      newValue: { gateway_ref: data.payment_id, amount: payment.amount },
    });

    // Audit: MEMBERSHIP_ACTIVATED or MEMBERSHIP_RENEWED
    const membership = await prisma.membership.findUnique({
      where: { user_id: payment.user_id },
      select: { id: true, member_id: true },
    });
    if (membership) {
      await createAuditLog({
        actorId: payment.user_id,
        action: payment.is_renewal ? 'MEMBERSHIP_RENEWED' : 'MEMBERSHIP_ACTIVATED',
        targetType: 'membership',
        targetId: membership.id,
        newValue: { member_id: membership.member_id, payment_id: payment.id },
      });
    }

    return { processed: true, reason: 'payment_completed' };
  }

  if (event === 'payment.failed' || data.status === 'failed') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        webhook_received: true,
        webhook_processed_at: new Date(),
      },
    });

    logger.info('Payment failed', { paymentId: payment.id });

    // Audit: PAYMENT_FAILED — Ref: Primary Spec Section 6
    await createAuditLog({
      actorId: payment.user_id,
      action: 'PAYMENT_FAILED',
      targetType: 'payment',
      targetId: payment.id,
      newValue: { event, status: data.status },
    });

    return { processed: true, reason: 'payment_failed' };
  }

  logger.warn('Unhandled webhook event', { event, status: data.status });
  return { processed: false, reason: 'unhandled_event' };
}

// GET /membership/renewal-info — Ref: Primary Spec Section 9
// Returns current expiry, projected new expiry, and plan details
export async function getRenewalInfo(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { user_id: userId },
    select: {
      status: true,
      expiry_date: true,
      plan_id: true,
    },
  });

  if (!membership) {
    throw new AppError('NOT_FOUND', 'No membership found. Purchase a membership first.', 404);
  }

  // Get the plan for pricing info
  const plan = membership.plan_id
    ? await prisma.membershipPlan.findUnique({
      where: { id: membership.plan_id },
      select: { name: true, price: true, currency: true, duration_months: true },
    })
    : null;

  // Calculate new expiry if renewed today
  const currentExpiry = membership.expiry_date;
  const renewalBase = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiryIfRenewed = new Date(renewalBase);
  newExpiryIfRenewed.setDate(newExpiryIfRenewed.getDate() + 365);

  return {
    current_expiry: currentExpiry,
    membership_status: membership.status,
    new_expiry_if_renewed_today: newExpiryIfRenewed,
    plan: plan
      ? {
        name: plan.name,
        price: Number(plan.price),
        currency: plan.currency,
        duration_months: plan.duration_months,
      }
      : null,
  };
}
