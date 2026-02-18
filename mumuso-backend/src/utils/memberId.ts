// Member ID generator — Ref: Primary Spec Section 6, memberships table
// Format: MUM-XXXXXX (6-digit zero-padded number)

import { prisma } from '../config/database';
import { logger } from '../middleware/logger';

export async function generateMemberId(): Promise<string> {
  // Get the highest existing member_id number
  const lastMembership = await prisma.membership.findFirst({
    orderBy: { member_id: 'desc' },
    select: { member_id: true },
  });

  let nextNumber = 1;

  if (lastMembership) {
    const match = lastMembership.member_id.match(/^MUM-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const memberId = `MUM-${nextNumber.toString().padStart(6, '0')}`;

  logger.info('Generated member ID', { memberId });
  return memberId;
}
