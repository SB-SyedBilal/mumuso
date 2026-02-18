# ADR 003: Bcrypt Cost Factor 12

**Status**: Accepted  
**Date**: 2026-02-17  
**Deciders**: Security Team  
**Ref**: Primary Spec Section 19

## Context

Password hashing must balance security (resistance to brute force) with performance (login speed). Bcrypt cost factor determines number of hashing rounds (2^cost).

## Decision

Use **bcrypt cost factor 12** for all password hashing.

### Rationale

- **Security**: 2^12 = 4,096 rounds provides strong protection against GPU-based attacks
- **Performance**: ~200-300ms hash time on modern hardware (acceptable for login)
- **Industry Standard**: OWASP recommends cost factor 10-12 as of 2024
- **Future-proof**: Can increase to 13-14 in 2-3 years as hardware improves

### Implementation

```typescript
const BCRYPT_COST_FACTOR = 12;
const password_hash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
```

## Consequences

### Positive
- Strong protection against rainbow tables and brute force
- Automatic salt generation
- Widely tested and audited algorithm

### Negative
- ~250ms per hash (impacts registration/password change)
- Cannot be parallelized (intentional security feature)
- May need adjustment in 3-5 years

## Benchmarks (Node.js 20, Intel i7)

| Cost Factor | Time per Hash | Hashes/sec |
|-------------|---------------|------------|
| 10          | ~65ms         | ~15        |
| 12          | ~250ms        | ~4         |
| 14          | ~1000ms       | ~1         |

## Monitoring

- Track average password hash duration
- Alert if hash time exceeds 500ms (indicates CPU saturation)
- Review cost factor annually

## Migration Path

If cost factor needs increase:
1. Hash new passwords with new cost
2. Rehash existing passwords on next login
3. No forced password reset required
