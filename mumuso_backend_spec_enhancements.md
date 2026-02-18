# Mumuso Backend Specification — Proposed Enhancements & Clarifications

&gt; **Document Purpose:** Supplementary specification addressing gaps, ambiguities, and operational requirements not covered in v1.0  
&gt; **Version:** 1.1-Supplement  
&gt; **Date:** 2026-02-16  
&gt; **Status:** For Review

---

## Table of Contents

1. [Critical Ambiguities Requiring Resolution](#1-critical-ambiguities-requiring-resolution)
2. [Payment Gateway Integration — Detailed Specifications](#2-payment-gateway-integration--detailed-specifications)
3. [QR Token System — Edge Cases & Rotation Procedures](#3-qr-token-system--edge-cases--rotation-procedures)
4. [Offline Sync — Comprehensive Handling](#4-offline-sync--comprehensive-handling)
5. [Database — Additional Indexes & Constraints](#5-database--additional-indexes--constraints)
6. [API Endpoint Clarifications](#6-api-endpoint-clarifications)
7. [Security Enhancements](#7-security-enhancements)
8. [Operational & Deployment Specifications](#8-operational--deployment-specifications)
9. [Testing Requirements](#9-testing-requirements)
10. [Monitoring & Alerting](#10-monitoring--alerting)
11. [Disaster Recovery & Business Continuity](#11-disaster-recovery--business-continuity)
12. [Implementation Priority Matrix](#12-implementation-priority-matrix)

---

## 1. Critical Ambiguities Requiring Resolution

### 1.1 Membership Renewal Timing

**Current Spec Gap:** What happens if a member renews *before* expiry?

**Proposed Rule:**
```typescript
// If renewed with D days remaining:
new_expiry_date = current_expiry_date + 365 days
// NOT: today + 365 days

// Example:
// Current expiry: 2026-12-31
// Renewed on: 2026-11-15 (46 days early)
// New expiry: 2027-12-31 (not 2027-11-15)

Rationale: Prevents member loss of prepaid time. Common industry practice

1.2 Duplicate Payment Webhook Handling
Current Spec Gap: No handling for Safepay retrying webhooks.
Proposed Solution:
Add webhook_processed_at timestamp to payments table. On webhook receipt:

-- Pseudo-code logic
IF payment.status = 'completed' AND webhook_processed_at IS NOT NULL:
   RETURN 200 OK  // Idempotent response
ELSE:
   Process payment and SET webhook_processed_at = NOW()

Database Migration:

ALTER TABLE payments ADD COLUMN webhook_processed_at TIMESTAMP;
CREATE UNIQUE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);

1.3 Partial Discount Validation Rules
Current Spec Gap: "Partial discount" lacks business rules.
Proposed Rules:

1. discount_amount must be ≤ original_amount × store_discount_pct / 100
2. discount_amount must be ≥ 0
3. Cashier must provide reason_code for partial discount (HQ audit requirement)

Schema Addition:

ALTER TABLE transactions ADD COLUMN partial_discount_reason VARCHAR(50);
-- Allowed values: 'manager_approval', 'promo_exclusion', 'bulk_item_limit', 'other'

1.4 Transaction Timezone Handling
Current Spec Gap: All timestamps assumed UTC, but business operates in Pakistan (PKT, UTC+5).
Proposed Standard:

. Storage: All timestamps UTC in database
. API Response: Convert to PKT (UTC+5) for display fields
. Cron Jobs: Schedule in PKT, execute in UTC (see Section 20 corrections)

Code Pattern:
// Display conversion
const displayDate = moment.utc(dbTimestamp).tz('Asia/Karachi').format();

2. Payment Gateway Integration — Detailed Specifications
2.1 Safepay API Specifications
Base URLs:

. Sandbox: https://sandbox.api.getsafepay.com
. Production: https://api.getsafepay.com

Order Creation Endpoint:

POST /order/v1/init
Headers:
  Authorization: Bearer {SAFEPAY_API_KEY}
  Content-Type: application/json

Body:
{
  "client": "mobile_sdk",
  "amount": 1999.00,
  "currency": "PKR",
  "environment": "sandbox", // or "production"
  "order_id": "{internal_payment_id}", // Your payments.id
  "customer": {
    "name": "Ayesha Khan",
    "email": "ayesha@example.com",
    "phone": "+923001234567"
  },
  "source": "mobile_app",
  "webhook_url": "https://api.mumuso.com/api/v1/membership/webhook/safepay",
  "redirect_url": "mumuso://payment/callback", // Deep link back to app
  "cancel_url": "mumuso://payment/cancel"
}

Expected Response:

{
  "status": "success",
  "data": {
    "token": "sfpy_abc123xyz789",
    "expiry": 300 // seconds
  }
}

2.2 Webhook Payload Schema

interface SafepayWebhookPayload {
  order_id: string;           // Your internal payment ID
  safepay_order_id: string;   // Safepay's order reference
  status: 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: 'PKR';
  payment_method: 'jazzcash' | 'easypaisa' | 'hbl_pay' | 'visa' | 'mastercard';
  transaction_id: string;     // Safepay's transaction reference
  timestamp: string;          // ISO 8601
  signature: string;          // HMAC-SHA256
}

// Signature verification string format:
// order_id={order_id}&status={status}&amount={amount}&timestamp={timestamp}

2.3 Webhook Retry Logic

Safepay Behavior:

. Retries 3 times over 15 minutes if non-200 response
. Exponential backoff: immediate, 5min, 10min

Your Handling:

// Return 200 ONLY after full processing completes
// Return 500 if processing fails (triggers retry)
// Return 400 if signature invalid (no retry, alert team)

2.4 Payment Failure Scenarios

| Scenario           | Safepay Status | Your Action                          |
| ------------------ | -------------- | ------------------------------------ |
| User cancelled     | `cancelled`    | Update payment.status, no membership |
| Insufficient funds | `failed`       | Update payment.status, notify user   |
| Network timeout    | (no webhook)   | Manual reconciliation job daily      |
| Fraud detection    | `failed`       | Update status, flag for review       |

Reconciliation Job (Daily):

// Query payments with status 'pending' created > 1 hour ago
// Call Safepay GET /order/v1/{order_id} to check status
// Update accordingly

3. QR Token System — Edge Cases & Rotation Procedures
3.1 Token Rotation Without Disruption
Problem: Rotating QR_SECRET invalidates all active tokens immediately.
Proposed Solution — Graceful Rotation:

// Support TWO secrets simultaneously during rotation period
const QR_SECRET_PRIMARY = process.env.QR_SECRET;      // Current
const QR_SECRET_SECONDARY = process.env.QR_SECRET_OLD; // Previous (24h TTL)

function verifyQRToken(token: string): VerificationResult {
  // Try primary first
  const primary = verifyWithSecret(token, QR_SECRET_PRIMARY);
  if (primary.valid) return primary;
  
  // Try secondary (grace period)
  const secondary = verifyWithSecret(token, QR_SECRET_SECONDARY);
  if (secondary.valid) return secondary;
  
  return { valid: false, reason: 'invalid_signature' };
}

Rotation Procedure:

1. Generate new secret, set as QR_SECRET_PRIMARY
2. Move old secret to QR_SECRET_SECONDARY with 24h TTL
3. After 24h, remove QR_SECRET_SECONDARY
4. Update all mobile apps to fetch fresh tokens

3.2 Clock Skew Handling

Problem: Device clocks may be off by minutes.

Proposed Tolerance:

const CLOCK_SKEW_TOLERANCE = 60; // seconds

// In verifyQRToken():
if (expiresAt + CLOCK_SKEW_TOLERANCE < now) {
  return { valid: false, reason: 'token_expired' };
}

3.3 QR Token Rate Limiting Enhancement
Current Spec: 30 per user per minute.
Proposed Enhancement:

. Add Redis key with TTL = token expiry (5 min)
. Prevent token regeneration spam
. Log suspicious patterns (e.g., 100 requests/min from same device)

// Redis key: qr_token:{user_id}
// Value: count of requests in last 5 min
// TTL: 300 seconds

4. Offline Sync — Comprehensive Handling

4.1 Local Storage Schema (Cashier App)

interface OfflineTransaction {
  local_id: string;           // Format: {device_uuid}_{timestamp}_{random}
  member_id: string;
  store_id: string;
  original_amount: number;
  final_amount: number;
  discount_type: 'full' | 'partial';
  discount_amount?: number;   // Required if partial
  discount_pct_snapshot: number; // Store's % at time of transaction
  recorded_at: string;        // ISO 8601, device time
  device_timestamp: number;   // Unix ms, for ordering
  sync_status: 'pending' | 'syncing' | 'failed' | 'synced';
  sync_attempts: number;
  last_error?: string;
  // Validation cache (for offline validation)
  member_name_snapshot: string;
  membership_expiry_snapshot: string;
}

4.2 Sync Conflict Resolution

Scenario: Transaction recorded offline, but membership expired before sync.

Proposed Rule:

// On sync:
IF membership.status != 'active' OR membership.expiry_date < transaction.recorded_at:
   REJECT with code: 'MEMBERSHIP_EXPIRED_AT_TRANSACTION_TIME'
   DO NOT record transaction
   NOTIFY cashier app to remove from queue

Alternative: Allow "grace period" of 24h for sync after expiry?

Decision Required: Business rule needed here.

4.3 Batch Sync Size Limits

Current Spec: "Up to 50 transactions"

Proposed Limits:

. Maximum 50 transactions per batch
. Maximum 7 days old (reject older to prevent stale data)
. Maximum total amount per batch: PKR 500,000 (fraud prevention)

4.4 Sync Response Format Enhancement

Current Spec: Basic status per transaction.

Proposed Detailed Response:

{
  "success": true,
  "data": {
    "synced": 45,
    "skipped": 3,
    "failed": 2,
    "requires_action": [
      {
        "local_id": "device-uuid-123",
        "action": "membership_expired",
        "message": "Member expired before transaction date",
        "remove_from_queue": true
      }
    ],
    "results": [
      {
        "local_id": "device-uuid-456",
        "status": "synced",
        "transaction_id": "uuid",
        "server_timestamp": "2026-02-16T14:32:00Z"
      }
    ]
  }
}

5. Database — Additional Indexes & Constraints

5.1 Performance Indexes

-- For dashboard queries
CREATE INDEX idx_transactions_user_id_created_at ON transactions(user_id, created_at DESC);
CREATE INDEX idx_memberships_status_expiry ON memberships(status, expiry_date);

-- For cashier validation (frequent lookup)
CREATE INDEX idx_memberships_member_id_status ON memberships(member_id, status);
CREATE INDEX idx_stores_is_active_discount ON stores(is_active, discount_pct) WHERE is_active = true;

-- For webhook deduplication
CREATE UNIQUE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);

-- For offline sync deduplication
CREATE UNIQUE INDEX idx_transactions_local_id ON transactions(local_id) WHERE local_id IS NOT NULL;

-- For notification jobs
CREATE INDEX idx_memberships_expiry_30_days ON memberships(expiry_date) 
  WHERE status = 'active' AND expiry_date = CURRENT_DATE + INTERVAL '30 days';

5.2 Foreign Key Constraints

Current Spec: Some tables lack explicit FK constraints.

Additions:

-- Ensure data integrity
ALTER TABLE transactions 
  ADD CONSTRAINT fk_transactions_member 
  FOREIGN KEY (member_id) REFERENCES memberships(member_id);

ALTER TABLE store_discount_config
  ADD CONSTRAINT fk_store_discount_config_store
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

5.3 Partitioning Strategy (Future-Proofing)

Transactions Table:

. Partition by created_at monthly after 1M records
. Improves query performance for historical data

6. API Endpoint Clarifications

6.1 GET /member/dashboard — Missing Fields

Add to Response:

{
  "success": true,
  "data": {
    // ... existing fields ...
    "membership": {
      "plan_name": "Annual Membership",
      "activated_at": "2026-02-16T10:00:00Z",
      "renewal_eligible": true,  // > 30 days before expiry
      "auto_renew": false        // Future feature placeholder
    },
    "stats": {
      "this_month_saved": 850.00,
      "favorite_store": "Mumuso Gulberg",
      "last_transaction_date": "2026-02-14"
    }
  }
}

6.2 POST /cashier/validate — Enhanced Response

Add Validation Metadata:

{
  "success": true,
  "data": {
    // ... existing fields ...
    "validation": {
      "method": "qr_scan", // or "manual_entry"
      "validated_at": "2026-02-16T14:32:00Z",
      "token_expires_in": 180, // seconds, if QR scan
      "cashier_id": "uuid",
      "store_discount_pct": 12.0
    },
    "warnings": [] // e.g., "membership_expires_in_7_days"
  }
}

6.3 DELETE /member/device-token

Missing Endpoint: Allow logout on specific device.

DELETE /api/v1/member/device-token
Headers: Authorization: Bearer {token}
Body: { "token": "fcm_token_here" }

Logic: Soft delete (set is_active = false), don't hard delete for audit trail.

7. Security Enhancements

7.1 Additional Rate Limits

| Endpoint                        | Limit                     | Rationale            |
| ------------------------------- | ------------------------- | -------------------- |
| `POST /membership/create-order` | 3 per user per hour       | Prevent payment spam |
| `POST /transactions/sync`       | 10 per cashier per minute | Prevent sync abuse   |
| `GET /stores`                   | 60 per user per minute    | Scraping protection  |
| `POST /auth/refresh`            | 10 per refresh token      | Token rotation abuse |

7.2 IP Allowlisting (Cashier Endpoints)

Proposed: Restrict /cashier/ and /transactions/ to known store IP ranges.

// Middleware: ipAllowlist.middleware.ts
const ALLOWED_IP_RANGES = [
  '203.175.0.0/16',  // Example: Mumuso corporate
  // Store-specific IPs configured per store
];

export const ipAllowlist = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip;
  const storeId = req.user.store_id;
  
  // Check if IP in allowed range for store
  // Return 403 if not
};

7.3 Request Signing (Cashier App)

Enhancement: Sign critical requests with device-specific HMAC.

// Cashier app signs request body
const signature = HMAC-SHA256(body, DEVICE_SECRET);

// Backend verifies against device registration

Prevents: Replay attacks from compromised tokens.

7.4 Data Retention Policy

GDPR/Privacy Compliance:

. Delete inactive user accounts after 2 years
. Anonymize transaction data after 5 years (retain aggregates)
. Soft delete for 30 days, then hard delete

-- Monthly job
UPDATE users SET deleted_at = NOW() 
WHERE last_login_at < NOW() - INTERVAL '2 years' 
AND deleted_at IS NULL;

8. Operational & Deployment Specifications

8.1 AWS Infrastructure

ECS Task Definition:

{
  "family": "mumuso-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [{
    "name": "api",
    "image": "mumuso/backend:latest",
    "portMappings": [{"containerPort": 3000}],
    "environment": [
      {"name": "NODE_ENV", "value": "production"}
    ],
    "secrets": [
      {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."},
      {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/mumuso-backend",
        "awslogs-region": "ap-south-1"
      }
    }
  }]
}

8.2 Database Connection Pooling

Prisma Configuration:

// database.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling
  connectionLimit: 20, // Adjust based on ECS task count
  // Connection timeout
  connectTimeout: 10,
  // Query timeout
  queryTimeout: 30,
});

RDS Proxy: Use AWS RDS Proxy to handle connection limits with multiple ECS tasks.

8.3 Redis Configuration

ElastiCache Redis Cluster:

. Node type: cache.t3.micro (staging), cache.r6g.large (production)
. Multi-AZ: Enabled
. Auto-failover: Enabled
. Snapshot retention: 7 days

Key TTLs:

refresh_token_blocklist: 30 days
rate_limit_counters: 1 hour
qr_token_rate_limit: 5 minutes
store_discount_cache: 1 hour

8.4 CI/CD Pipeline

GitHub Actions Workflow:

name: Deploy to ECS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build image
        run: docker build -t mumuso/backend:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REPO }}
          docker push mumuso/backend:${{ github.sha }}
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster mumuso-prod --service api --force-new-deployment

9. Testing Requirements

9.1 Unit Test Coverage Requirements

| Module           | Minimum Coverage | Critical Paths                                 |
| ---------------- | ---------------- | ---------------------------------------------- |
| Auth             | 90%              | OTP generation, JWT signing, password hashing  |
| QR Token         | 95%              | Sign/verify, expiry, rotation, clock skew      |
| Cashier Validate | 90%              | All 6 scenarios, signature verification        |
| Payments         | 85%              | Webhook signature, idempotency, retry          |
| Transactions     | 85%              | Offline sync, deduplication, amount validation |

9.2 Integration Test Scenarios

Safepay Integration:

1. Successful payment flow (sandbox)
2. Webhook signature failure
3. Duplicate webhook handling
4. Payment timeout and reconciliation

QR Token:

1. Valid token verification
2. Expired token rejection
3. Invalid signature detection
4. Clock skew tolerance (±60s)
5. Secret rotation grace period

Offline Sync:

1. Batch sync of 50 transactions
2. Duplicate local_id handling
3. Membership expired before transaction time
4. Network interruption mid-sync
5. Partial batch failure (some succeed, some fail)

9.3 Load Testing Targets

| Endpoint                         | Target RPS | Latency p95 | Error Rate |
| -------------------------------- | ---------- | ----------- | ---------- |
| POST /cashier/validate           | 1000       | <200ms      | <0.1%      |
| GET /member/qr-token             | 500        | <100ms      | <0.1%      |
| POST /transactions/sync          | 100        | <500ms      | <0.5%      |
| POST /membership/webhook/safepay | 50         | <300ms      | <0.1%      |

Tools: k6 or Artillery for load testing.

10. Monitoring & Alerting

10.1 CloudWatch Dashboards

API Health Dashboard:

. Request count by endpoint (5 min)
. Error rate by status code (5 min)
. Latency p50, p95, p99
. Active connections

Business Metrics Dashboard:

. Memberships activated (daily)
. Transactions processed (hourly)
. Revenue via Safepay (daily)
. Failed payment rate

10.2 Alerting Rules (PagerDuty/Slack)

| Condition                    | Severity | Action       |
| ---------------------------- | -------- | ------------ |
| Error rate > 5% for 5 min    | Critical | Page on-call |
| Latency p95 > 1s for 10 min  | Warning  | Slack alert  |
| Cashier validate 5xx errors  | Critical | Page on-call |
| Database connection failures | Critical | Page on-call |
| Redis connection failures    | Warning  | Slack alert  |
| Failed payment rate > 10%    | Warning  | Slack alert  |
| Disk usage > 80%             | Warning  | Auto-scale   |

10.3 Log Aggregation

Winston Configuration:

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mumuso-api' },
  transports: [
    new winston.transports.Console(),
    new CloudWatchTransport({
      logGroupName: '/ecs/mumuso-backend',
      logStreamName: 'api',
      awsRegion: 'ap-south-1'
    })
  ]
});

Sensitive Data Masking:

. Mask: password, password_hash, token, authorization, card_number
. Never log full QR tokens (log only first 8 chars for debugging)

11. Disaster Recovery & Business Continuity

11.1 Backup Strategy

| Data       | Frequency | Retention | Method                      |
| ---------- | --------- | --------- | --------------------------- |
| PostgreSQL | Daily     | 30 days   | RDS automated snapshots     |
| PostgreSQL | Weekly    | 90 days   | Manual snapshot             |
| Redis      | N/A       | N/A       | Ephemeral (rebuild from DB) |
| S3 Assets  | Real-time | 30 days   | Versioning enabled          |

11.2 Recovery Time Objectives (RTO)

| Scenario                | RTO     | RPO | Procedure                   |
| ----------------------- | ------- | --- | --------------------------- |
| Single AZ failure       | 5 min   | 0   | Multi-AZ failover automatic |
| Database corruption     | 30 min  | 24h | Restore from snapshot       |
| Complete region failure | 4 hours | 24h | Failover to standby region  |
| Data center outage      | 15 min  | 0   | ECS tasks in multiple AZs   |

11.3 Runbook: Database Restore

# 1. Identify snapshot to restore
aws rds describe-db-snapshots --db-instance-identifier mumuso-prod

# 2. Restore to new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier mumuso-prod-recovery \
  --db-snapshot-identifier rds:mumuso-prod-2026-02-16

# 3. Update ECS task definition with new endpoint
# 4. Verify data integrity
# 5. Redirect traffic

11.4 Circuit Breakers

Implementation: Use opossum npm package for external service calls.

// Safepay circuit breaker
const safepayBreaker = new CircuitBreaker(callSafepay, {
  timeout: 5000, // 5s
  errorThresholdPercentage: 50,
  resetTimeout: 30000 // 30s
});

safepayBreaker.on('open', () => {
  logger.error('Safepay circuit breaker opened');
  // Alert team, queue orders for retry
});

12. Implementation Priority Matrix

P0 — Critical for Launch (Weeks 1-4)

| Item                             | Effort | Risk if Omitted         |
| -------------------------------- | ------ | ----------------------- |
| Duplicate webhook handling       | 4h     | Double-charge customers |
| QR token rotation procedure      | 8h     | Security vulnerability  |
| Offline sync conflict resolution | 16h    | Data inconsistency      |
| Database indexes                 | 4h     | Performance degradation |
| Webhook signature verification   | 4h     | Payment fraud           |
| Rate limiting                    | 8h     | API abuse, downtime     |

P1 — High Priority (Weeks 5-6)

| Item                    | Effort | Risk if Omitted            |
| ----------------------- | ------ | -------------------------- |
| Comprehensive logging   | 8h     | Debugging impossible       |
| Basic monitoring alerts | 8h     | Undetected outages         |
| Reconciliation job      | 8h     | Orphaned payments          |
| Clock skew tolerance    | 4h     | False rejections           |
| Device token management | 8h     | Push notification failures |

P2 — Post-Launch (Month 2)

| Item                    | Effort | Value                  |
| ----------------------- | ------ | ---------------------- |
| IP allowlisting         | 8h     | Enhanced security      |
| Request signing         | 16h    | Prevent replay attacks |
| Data retention policies | 8h     | Compliance             |
| Load testing automation | 16h    | Confidence in scaling  |
| Circuit breakers        | 8h     | Resilience             |

P3 — Future Enhancements (Phase 2)

| Item                             | Effort | Value                 |
| -------------------------------- | ------ | --------------------- |
| Database partitioning            | 16h    | Long-term performance |
| Multi-region deployment          | 40h    | Disaster recovery     |
| Advanced analytics               | 24h    | Business insights     |
| Machine learning fraud detection | 80h    | Security              |

Appendix A: Decision Log

| Date       | Decision                                                              | Rationale                             | Decision Maker |
| ---------- | --------------------------------------------------------------------- | ------------------------------------- | -------------- |
| 2026-02-16 | Renewal adds 365 days to current expiry, not today                    | Fairness to customers who renew early | Product Owner  |
| 2026-02-16 | 24h grace period for QR secret rotation                               | Prevent mass customer disruption      | Tech Lead      |
| 2026-02-16 | Reject offline transactions if membership expired before recorded\_at | Data integrity over convenience       | Compliance     |
| 2026-02-16 | 7-day limit on offline transaction age                                | Prevent stale data accumulation       | Risk Team      |

Appendix B: Glossary

| Term             | Definition                                                       |
| ---------------- | ---------------------------------------------------------------- |
| **CBS IMS**      | Mumuso's existing Point of Sale system (passive, no integration) |
| **Safepay**      | Pakistani payment gateway (JazzCash, EasyPaisa, cards)           |
| **PKT**          | Pakistan Standard Time (UTC+5)                                   |
| **Local ID**     | Client-generated UUID for offline transaction deduplication      |
| **Grace Period** | Time window allowing old credentials/tokens during rotation      |


This document supplements Mumuso Backend Specification v1.0. Both documents should be read together for complete system requirements.


---

**How to use this:**

1. Copy the entire content above
2. Save as `mumuso_backend_spec_enhancements.md`
3. Review with your team and decide on the "Decision Required" items
4. Prioritize P0 items for immediate implementation

This supplement addresses the gaps that would prevent an AI (or human team) from achieving production-ready code. Would you like me to expand on any specific section?