# ADR 001: Dual-Secret QR Token Rotation Strategy

**Status**: Accepted  
**Date**: 2026-02-17  
**Deciders**: Backend Team  
**Ref**: Supplement Section 3.1

## Context

QR tokens used for cashier validation have a 5-minute TTL and use HMAC-SHA256 signatures. We need a strategy to rotate the signing secret without invalidating tokens already generated with the old secret.

## Decision

Implement dual-secret verification with a 24-hour grace period:

1. **Primary Secret** (`QR_SECRET`): Used for all new token generation
2. **Secondary Secret** (`QR_SECRET_OLD`): Optional, used only for verification during rotation
3. **Grace Period**: 24 hours to allow all old tokens to expire naturally (5 min TTL × safety margin)

### Implementation

```typescript
// Generation: Always use primary secret
const signature = signPayload(payload, env.QR_SECRET);

// Verification: Try primary first, fallback to secondary
const primaryResult = verifyWithSecret(decoded, env.QR_SECRET);
if (primaryResult.valid) return primaryResult;

if (env.QR_SECRET_OLD) {
  return verifyWithSecret(decoded, env.QR_SECRET_OLD);
}
```

### Rotation Process

1. Generate new secret: `openssl rand -hex 32`
2. Set `QR_SECRET_OLD=<current_QR_SECRET>`
3. Set `QR_SECRET=<new_secret>`
4. Deploy to all instances
5. Wait 24 hours
6. Remove `QR_SECRET_OLD`

## Consequences

### Positive
- Zero-downtime secret rotation
- No token invalidation during deployment
- Backward compatible with existing tokens

### Negative
- Slightly increased verification complexity
- Requires manual rotation process (not automated)
- 24-hour window where old secret still valid

## Alternatives Considered

1. **Immediate rotation**: Would invalidate all active tokens (rejected - poor UX)
2. **Versioned tokens**: Added complexity in payload (rejected - over-engineering)
3. **Longer TTL**: Increases security risk (rejected)

## Monitoring

- Log when tokens verified with secondary secret (indicates rotation in progress)
- Alert if `QR_SECRET_OLD` present for >48 hours (rotation not completed)
