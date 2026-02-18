// Payment reconciliation job — Authorization Decision 1.2
// Daily at 06:00 UTC — checks pending payments >1 hour old
// Escalation: Alert if pending payments >10 for >2 hours

import { prisma } from '../config/database';
import { logger } from '../middleware/logger';

export async function runReconciliation(): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Find pending payments older than 1 hour — Ref: Supplement Section 2.4
  const stalePayments = await prisma.payment.findMany({
    where: {
      status: 'pending',
      created_at: { lt: oneHourAgo },
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  logger.info(`Reconciliation: Found ${stalePayments.length} stale pending payments`);

  // Escalation check: >10 pending for >2 hours
  const criticalPayments = stalePayments.filter(
    (p) => p.created_at < twoHoursAgo,
  );

  if (criticalPayments.length > 10) {
    logger.error('ESCALATION: More than 10 pending payments older than 2 hours', {
      count: criticalPayments.length,
      paymentIds: criticalPayments.map((p) => p.id),
    });
    // TODO: Send alert to PagerDuty/Slack (Week 5/6)
  }

  // For each stale payment, attempt to check status with Safepay
  // Ref: Supplement Section 2.4 — Call Safepay GET /order/v1/{order_id}
  for (const payment of stalePayments) {
    try {
      // TODO: Implement Safepay status check (Week 3)
      // For now, log the stale payment for manual review
      logger.warn('Stale payment requires manual review', {
        paymentId: payment.id,
        userId: payment.user_id,
        amount: payment.amount,
        createdAt: payment.created_at,
        gatewayOrderId: payment.gateway_order_id,
      });
    } catch (error) {
      logger.error('Failed to reconcile payment', {
        paymentId: payment.id,
        error,
      });
    }
  }
}
