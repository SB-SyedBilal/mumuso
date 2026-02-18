# ADR 002: Soft Delete with 90-Day Re-registration Block

**Status**: Accepted  
**Date**: 2026-02-17  
**Deciders**: Backend Team, Legal  
**Ref**: Authorization Decision 1.5

## Context

Users may request account deletion. We need to balance:
- Legal compliance (GDPR right to erasure)
- Fraud prevention (prevent abuse of signup bonuses)
- Data retention for audit/compliance

## Decision

Implement **soft delete** with a 90-day re-registration block:

1. Set `deleted_at` timestamp instead of hard delete
2. Block re-registration with same email for 90 days
3. Exclude soft-deleted users from all queries via `WHERE deleted_at IS NULL`
4. Hard delete after 90 days via scheduled job

### Database Schema

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- Partial unique index (only active users)
CREATE UNIQUE INDEX idx_users_email_active 
ON users(email) WHERE deleted_at IS NULL;
```

### Registration Logic

```typescript
const existingUser = await prisma.user.findUnique({ where: { email } });

if (existingUser?.deleted_at) {
  const daysSinceDeleted = Math.floor(
    (Date.now() - existingUser.deleted_at.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceDeleted < 90) {
    throw new AppError('ALREADY_EXISTS', 
      'This email was recently deactivated. Please wait before re-registering.', 409);
  }
}
```

## Consequences

### Positive
- Prevents signup bonus abuse
- Maintains audit trail for 90 days
- Allows legitimate re-registration after cooling period
- GDPR compliant (data deleted after 90 days)

### Negative
- Users must wait 90 days to re-register
- Requires scheduled job for hard deletion
- Increased database storage (temporary)

## Compliance

- **GDPR Article 17**: Right to erasure satisfied after 90-day retention
- **PCI DSS**: No payment data stored (handled by Safepay)
- **Local regulations**: Complies with Pakistan data protection laws

## Monitoring

- Track soft-delete requests per month
- Alert if hard-delete job fails
- Monitor re-registration attempts within 90 days
