// Update expired memberships — Ref: Primary Spec Section 20
// Sets status = 'expired' for memberships past expiry_date

import { prisma } from '../config/database';
import { logger } from '../middleware/logger';

export async function updateExpiredMemberships(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.membership.updateMany({
    where: {
      expiry_date: { lt: today },
      status: 'active',
    },
    data: {
      status: 'expired',
      updated_at: new Date(),
    },
  });

  logger.info(`Updated ${result.count} expired memberships`);
}
