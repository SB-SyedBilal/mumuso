// Expiry reminder notifications — Ref: Primary Spec Section 20
// Sends push notifications at 30 days, 7 days, and day-of expiry

import { prisma } from '../config/database';
import { logger } from '../middleware/logger';

type ReminderType = '30days' | '7days' | 'today';

export async function runExpiryReminders(type: ReminderType): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate: Date;
  let notificationType: string;
  let title: string;
  let body: string;
  let deepLink: string;

  switch (type) {
    case '30days':
      targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 30);
      notificationType = 'expiry_30_days';
      title = 'Membership expiring soon';
      body = 'Your membership expires in 30 days. Renew now.';
      deepLink = 'mumuso://renewal';
      break;
    case '7days':
      targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 7);
      notificationType = 'expiry_7_days';
      title = '1 week left!';
      body = "Your membership expires in 7 days. Don't lose your discount.";
      deepLink = 'mumuso://renewal';
      break;
    case 'today':
      targetDate = today;
      notificationType = 'expiry_today';
      title = 'Membership expired';
      body = 'Your membership has expired. Renew to keep your discount.';
      deepLink = 'mumuso://renewal';
      break;
  }

  // Find memberships expiring on target date
  const memberships = await prisma.membership.findMany({
    where: {
      expiry_date: targetDate,
      status: 'active',
    },
    include: {
      user: { select: { id: true, full_name: true } },
    },
  });

  logger.info(`Found ${memberships.length} memberships for ${type} reminder`);

  // Create notification records for each member
  for (const membership of memberships) {
    try {
      await prisma.notification.create({
        data: {
          user_id: membership.user_id,
          title,
          body,
          type: notificationType,
          deep_link: deepLink,
          metadata: { membership_id: membership.id, reminder_type: type },
        },
      });

      // Push notification will be sent via notification service (Week 3/5)
      logger.info(`Expiry reminder created for user ${membership.user_id}`, {
        type,
        expiryDate: membership.expiry_date,
      });
    } catch (error) {
      logger.error(`Failed to create expiry reminder for user ${membership.user_id}`, { error });
    }
  }
}
