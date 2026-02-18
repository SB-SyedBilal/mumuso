// Register all cron jobs — Ref: Primary Spec Section 20
// All times in UTC — Ref: Supplement Section 1.4

import cron from 'node-cron';
import { logger } from '../middleware/logger';
import { updateExpiredMemberships } from './expiredToday.job';
import { runExpiryReminders } from './expiryReminder.job';
import { runReconciliation } from './reconciliation.job';

export function registerJobs(): void {
  logger.info('Registering scheduled jobs...');

  // Daily at 02:00 UTC — update membership statuses
  // Ref: Primary Spec Section 20
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running: updateExpiredMemberships');
    try {
      await updateExpiredMemberships();
    } catch (error) {
      logger.error('Job failed: updateExpiredMemberships', { error });
    }
  });

  // Daily at 03:00 UTC (08:00 PKT) — expired today notification
  // Ref: Primary Spec Section 20
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running: expiredTodayNotification');
    try {
      await runExpiryReminders('today');
    } catch (error) {
      logger.error('Job failed: expiredTodayNotification', { error });
    }
  });

  // Daily at 04:00 UTC (09:00 PKT) — 30-day and 7-day expiry reminders
  // Ref: Primary Spec Section 20
  cron.schedule('0 4 * * *', async () => {
    logger.info('Running: expiryReminder30Days');
    try {
      await runExpiryReminders('30days');
    } catch (error) {
      logger.error('Job failed: expiryReminder30Days', { error });
    }
  });

  cron.schedule('0 4 * * *', async () => {
    logger.info('Running: expiryReminder7Days');
    try {
      await runExpiryReminders('7days');
    } catch (error) {
      logger.error('Job failed: expiryReminder7Days', { error });
    }
  });

  // Daily at 06:00 UTC (11:00 PKT) — payment reconciliation
  // Authorization Decision 1.2
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running: paymentReconciliation');
    try {
      await runReconciliation();
    } catch (error) {
      logger.error('Job failed: paymentReconciliation', { error });
    }
  });

  logger.info('All scheduled jobs registered');
}
