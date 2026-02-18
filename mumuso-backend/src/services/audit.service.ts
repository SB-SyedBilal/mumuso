// Audit log service — Ref: Primary Spec Section 6, audit_logs table
// Logs all critical actions for compliance and debugging

import { prisma } from '../config/database';
import { logger } from '../middleware/logger';
import { AuditAction } from '../types';

interface AuditLogEntry {
  actorId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: entry.actorId,
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId,
        old_value: entry.oldValue ?? undefined,
        new_value: entry.newValue ?? undefined,
        ip_address: entry.ipAddress,
      },
    });

    logger.info('Audit log created', {
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
    });
  } catch (error) {
    // Audit log failure should never block the main operation
    logger.error('Failed to create audit log', { error, entry });
  }
}
