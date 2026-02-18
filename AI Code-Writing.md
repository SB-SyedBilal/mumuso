---

## 0. Meta-Governance
* 0.1 **These laws are living documents**: Amend via structured RFC process with security, performance, and accessibility review.
* 0.2 **Hierarchy override**: Lower-numbered laws supersede higher-numbered only when explicitly justified with risk assessment.
* 0.3 **Context calibration**: Severity classifications (Critical/High/Medium/Low) determine enforcement intensity, not binary halt/continue.

---

## 1. Clarity & Communication
* 1.1 **Ambiguity triage**:
   * **Critical ambiguity** (security/availability impact): Halt, escalate, document blocker.
   * **Non-critical ambiguity**: Propose safe default with explicit assumptions, proceed with monitoring.
* 1.2 **Knowledge gaps**: If implementation path is uncertain, execute spike solution (time-boxed: 2-4 hours) before full commitment.
* 1.3 **Documentation debt**: Every decision requiring clarification generates ADR (Architecture Decision Record) entry.

---

## 2. Security Architecture
* 2.1 **Threat modeling**: STRIDE analysis mandatory for any data flow or authentication boundary.
* 2.2 **OWASP Top 10 compliance**: Automated SAST/DAST in CI/CD pipeline; zero Critical/High vulnerabilities in production.
* 2.3 **Defense in depth**: Input validation at boundary, sanitization at consumption, parameterized queries exclusively.
* 2.4 **Secret lifecycle**: No hardcoded credentials; rotation policies enforced; secrets managers (Vault, AWS SM, Azure KV) mandatory.
* 2.5 **Security severity response**:
   | Severity | Response Time | Action |
   |----------|---------------|--------|
   | Critical | Immediate | Halt pipeline, war room activation |
   | High | 4 hours | Block merge, expedited fix |
   | Medium | 24 hours | Track in backlog, scheduled fix |
   | Low | 7 days | Monitor, batch with next sprint |

---

## 3. Code Quality & Architecture
* 3.1 **Modularity metrics** (replace rigid line counts):
   * Cyclomatic complexity ≤ 10 per function
   * Cognitive complexity ≤ 15 per module
   * Single Responsibility: one reason to change per component
   * **Guideline**: Target 150-300 lines per file; exceed only with architectural justification
* 3.2 **SOLID/DRY/GRASP**: Enforced via static analysis (SonarQube, ESLint, Pylint) with quality gate blocking.
* 3.3 **Test pyramid**: Unit (70%) → Integration (20%) → E2E (10%); minimum 80% coverage for critical paths.
* 3.4 **Technical debt tracking**: All TODOs/FIXMEs ticketed; debt ratio ≤ 5% of sprint capacity.

---

## 4. Observability & Reliability
* 4.1 **Telemetry three pillars**:
   * **Logging**: Structured (JSON), correlated with trace IDs, PII redacted
   * **Metrics**: RED (Rate, Errors, Duration) for services; USE (Utilization, Saturation, Errors) for resources
   * **Tracing**: Distributed tracing for all cross-service calls; sampling rate 100% for errors, 1% for success
* 4.2 **Health endpoints**: Liveness ("/healthz") and readiness ("/ready") probes mandatory for all services.
* 4.3 **Alerting**: SLO-based alerts (error budget burn rate); no paging on non-actionable signals.
* 4.4 **Chaos engineering**: Game day exercises quarterly; failure injection in non-prod environments.

---

## 5. Full-Stack Synchronization
* 5.1 **Contract-first development**: OpenAPI/AsyncAPI specs before implementation; breaking changes versioned (semver).
* 5.2 **Blocker report** (when backend missing):
   * Frontend changes implemented with feature flags
   * API contract proposed with mock server
   * Schema validation tests written (failing until backend ready)
* 5.3 **Backward compatibility**: N-1 version support for all public APIs; deprecation notices 90 days minimum.
* 5.4 **Database migrations**: Versioned, reversible, tested against production-like data volumes; no locking table operations during peak.

---

## 6. Performance Engineering
* 6.1 **Latency budgets**: End-to-end p99 ≤ 500ms; service-to-service p99 ≤ 100ms.
* 6.2 **Resource constraints**: Memory limits enforced (container); CPU requests/limits defined; no unbounded caching.
* 6.3 **Scalability patterns**: Horizontal scaling stateless services; async processing for >100ms operations; circuit breakers for external calls.
* 6.4 **Load testing**: Production traffic replay monthly; capacity planning quarterly.

---

## 7. Accessibility & Inclusion
* 7.1 **WCAG 2.1 AA compliance**: Automated axe-core testing in CI; manual audit annually.
* 7.2 **Semantic markup**: Proper heading hierarchy, ARIA labels where native semantics insufficient, keyboard navigation mandatory.
* 7.3 **Inclusive design**: Color contrast ≥ 4.5:1, screen reader tested, focus indicators visible, motion respects `prefers-reduced-motion`.

---

## 8. External Dependencies & Supply Chain
* 8.1 **Dependency hygiene**: SBOM generated on build; vulnerability scanning (Snyk, Dependabot); license compliance check.
* 8.2 **Least privilege**: Service accounts with minimal IAM permissions; no wildcards in policies.
* 8.3 **Rate limiting & resilience**: Client-side rate limiting, exponential backoff, circuit breakers (hystrix/resilience4j pattern) for all external calls.
* 8.4 **Vendor lock-in mitigation**: Abstraction layers for cloud-specific services; data portability verified.

---

## 9. User Journey & Logic Validation
* 9.1 **Journey mapping**: Entry points, decision trees, error states, exit conditions documented; complexity >5 steps requires flowchart.
* 9.2 **Dark patterns prohibition**: No deceptive UI, forced continuity, or accessibility barriers for conversion optimization.
* 9.3 **Edge case enumeration**: Empty states, network failures, timeout scenarios, malicious input patterns explicitly handled.
* 9.4 **A/B testing ethics**: User consent for behavioral experiments; no exploitation of vulnerability or addiction mechanisms.

---

## 10. Ownership & Accountability
* 10.1 **Production excellence**: On-call rotation, blameless postmortems (24-hour draft, 1-week final), error budget policies.
* 10.2 **Impact analysis**: Dependency graph review before modification; automated blast radius detection for monorepos.
* 10.3 **Knowledge transfer**: No single points of failure; pair programming for critical paths; documentation required for handoff.
* 10.4 **Innovation discipline**: Experimentation budget (20% time) with measurable hypotheses; pivot criteria predefined.

---

## 11. Brutal Honesty & Continuous Improvement
* 11.1 **Radical candor**: Direct, kind, specific feedback on code quality; "bad code" labeled with remediation path, not judgment.
* 11.2 **Deadline realism**: Negotiate scope, not quality; "impossible" declared with alternatives (MVP, phased delivery, parallel tracks).
* 11.3 **Retrospective action**: Bi-weekly process review; law amendments proposed with data (incident reduction, velocity metrics).

---

## Enforcement Hierarchy (Priority Order)

| Rank | Domain | Override Condition |
|------|--------|-------------------|
| 1 | Security (2.x) | Only by documented risk acceptance with CISO sign-off |
| 2 | Observability (4.x) | Never—required for all other domains |
| 3 | Clarity (1.x) | Escalation timeout permits provisional safe-path |
| 4 | Full-Stack Sync (5.x) | Feature flags enable partial delivery |
| 5 | Code Quality (3.x) | Technical debt ticketed with fix deadline |
| 6 | Performance (6.x) | Latency budget violations trigger auto-rollback |
| 7 | Accessibility (7.x) | Legal/compliance override—no exceptions |
| 8 | User Journey (9.x) | A/B testing ethics non-negotiable |
| 9 | External Services (8.x) | Circuit breakers degrade gracefully |
| 10 | Ownership (10.x) | Postmortem culture mandatory |
| 11 | Honesty/Improvement (11.x) | Foundation for all above |

---