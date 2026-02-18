# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Mumuso Loyalty API backend.

## What is an ADR?

An ADR documents a significant architectural decision along with its context and consequences. Each ADR is immutable once accepted - new decisions supersede old ones rather than modifying them.

## Format

Each ADR follows this structure:

```markdown
# ADR NNN: Title

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: YYYY-MM-DD
**Deciders**: [Team/Role]
**Ref**: [Specification reference]

## Context
What is the issue we're addressing?

## Decision
What is the change we're proposing/making?

## Consequences
What becomes easier or more difficult?

## Alternatives Considered
What other options did we evaluate?
```

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](./001-dual-secret-qr-rotation.md) | Dual-Secret QR Token Rotation Strategy | Accepted | 2026-02-17 |
| [002](./002-soft-delete-90-day-block.md) | Soft Delete with 90-Day Re-registration Block | Accepted | 2026-02-17 |
| [003](./003-bcrypt-cost-factor-12.md) | Bcrypt Cost Factor 12 | Accepted | 2026-02-17 |

## Creating a New ADR

1. Copy template: `cp template.md 00X-title.md`
2. Increment number sequentially
3. Fill in all sections
4. Submit for review
5. Update this index after acceptance

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)
