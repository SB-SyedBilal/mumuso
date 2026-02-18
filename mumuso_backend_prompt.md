# Mumuso Loyalty App — Backend Development Prompt
## Complete Specification for AI Agent / Development Team

> **Version:** 1.0  
> **Phase:** 1 — Mobile First  
> **Classification:** Internal — Confidential  
> **Stack:** Node.js / PostgreSQL / Redis / AWS  

---

## Your Role

This document constitutes the SOLE, SUPREME, AND INVIOABLE canonical specification for the Mumuso Paid Membership & Loyalty App backend architecture. It is not a guide. It is not a suggestion. It is LAW.
ABSOLUTE PROHIBITIONS:
ZERO TOLERANCE for deviation, improvisation, or "improvement"
ZERO TOLERANCE for undocumented assumptions or shadow logic
ZERO TOLERANCE for unauthorized architectural mutations
ZERO TOLERANCE for "it should work" or "it worked on my machine"
CHAIN OF COMMAND:
The Product Owner alone possesses authority to amend this document. NO OTHER ENTITY — not senior engineers, not architects, not executives — may override, circumvent, or reinterpret these specifications. Attempting to do so constitutes INSUBORDINATION OF THE HIGHEST ORDER.
FAILURE TO COMPLY WILL UNLEASH:

| Violation                         | Consequence                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Unapproved schema modification    | **Cascading data corruption** across production environments, irreversible customer trust destruction, regulatory audit failure |
| Undocumented API alteration       | **Complete mobile/web app paralysis**, payment processing collapse, membership system deadlock                                  |
| Unauthorized business rule change | **Financial reconciliation nightmares**, fraudulent transaction vectors, legal liability exposure                               |
| Ignored integration requirement   | **Third-party service cascade failure**, vendor contract breaches, operational blackout                                         |

These are not hypotheticals. These are CERTAINTIES that will manifest should you defy this directive.
FINAL WARNING:
Your code commits are PERMANENT RECORDS of your compliance. History will not forgive. Rollbacks will not save you. The disasters you unleash will outlast your tenure and haunt your professional existence.
THIS DOCUMENT IS YOUR COMMANDMENT. OBEY IT EXACTLY. QUESTION NOTHING.

Read this entire document before writing a single line of code.

---

## Table of Contents

1. [What You Are Building](#1-what-you-are-building)
2. [What You Are NOT Building](#2-what-you-are-not-building)
3. [Core Business Rules](#3-core-business-rules)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [API Endpoints — Auth](#7-api-endpoints--auth)
8. [API Endpoints — Customer](#8-api-endpoints--customer)
9. [API Endpoints — Membership](#9-api-endpoints--membership)
10. [API Endpoints — Stores](#10-api-endpoints--stores)
11. [API Endpoints — Cashier](#11-api-endpoints--cashier)
12. [API Endpoints — Transactions](#12-api-endpoints--transactions)
13. [API Endpoints — Notifications](#13-api-endpoints--notifications)
14. [QR Token System](#14-qr-token-system)
15. [Payment Gateway Integration — Safepay](#15-payment-gateway-integration--safepay)
16. [Push Notification Service](#16-push-notification-service)
17. [Transaction Scenarios — All Six](#17-transaction-scenarios--all-six)
18. [Role Based Access Control](#18-role-based-access-control)
19. [Security Requirements](#19-security-requirements)
20. [Scheduled Jobs](#20-scheduled-jobs)
21. [Offline Sync Handling](#21-offline-sync-handling)
22. [Error Handling Standards](#22-error-handling-standards)
23. [Environment Configuration](#23-environment-configuration)
24. [What to Build First](#24-what-to-build-first)
25. [What NOT to Build Yet](#25-what-not-to-build-yet)

---

## 1. What You Are Building

A **REST API backend** that powers two mobile app modes:

- **Customer Mode** — The app used by Mumuso members to purchase memberships, display QR cards, browse stores, and track savings
- **Cashier Mode** — The app used by Mumuso store cashiers on a counter tablet to scan member QR codes, validate memberships, and record transactions

The backend also handles membership payments via Safepay, push notifications via Firebase, scheduled renewal reminders, and offline transaction sync.

### The Three Components You Are Serving

```
Customer Mobile App  ──→  Your Backend API  ←──  Cashier Mobile App
                               │
                    ┌──────────┼──────────┐
                    │          │          │
               PostgreSQL    Redis    Firebase
               (primary DB)  (cache)   (push)
                    │
               Safepay
             (payments)
```

### CBS IMS — The POS System

**CBS IMS (the store's Point of Sale) is completely passive. You never call it. It never calls you. There is zero integration with it.**

The cashier reads the discount percentage from your Cashier App screen and manually types it into CBS IMS. Your backend has no awareness of CBS IMS whatsoever. Do not design any endpoint or service around it.

---

## 2. What You Are NOT Building

Be explicit about scope. Do not build any of the following in Phase 1:

| What | Why Not |
|---|---|
| Web Admin Dashboard APIs | Phase 2 — web dashboard not built yet |
| Super Admin API endpoints | Phase 2 — admin managed via direct DB access for now |
| Referral programme | Not designed — removed from scope |
| Inventory or item-level APIs | Zero inventory integration by design |
| CBS IMS integration | CBS is passive — no integration needed |
| Multi-store franchise APIs | All stores are Mumuso-owned — single config |
| RTL / localisation APIs | Frontend handles i18n with local files |
| Dark mode APIs | Frontend only |
| Analytics aggregation endpoints | Phase 2 with web dashboard |
| Store comparison reports | Phase 2 |

---

## 3. Core Business Rules

These are non-negotiable. Every API must enforce them.

**Rule 1 — Membership is annual and paid**
A customer must pay to become a member. Free or trial memberships do not exist. No membership is activated without confirmed payment from Safepay webhook.

**Rule 2 — Discount percentage belongs to the store, not the member**
Every store configures its own discount percentage. A member has no discount percentage of their own. When a member is validated at a store, the response returns that store's discount percentage — not anything stored on the member record.

**Rule 3 — Store discount percentage has HQ-defined boundaries**
HQ sets a global minimum and maximum discount range (e.g. 5% to 20%). No store can set a percentage outside this range. The API rejects any value outside the boundary.

**Rule 4 — A store must have a configured discount percentage to be visible**
If a store has not configured its discount percentage, it does not appear in the customer's store list. It is invisible until configured.

**Rule 5 — QR tokens expire every 5 minutes**
QR codes are never static. The app fetches a fresh signed token every 5 minutes. The cashier app validates the token signature and expiry on every scan.

**Rule 6 — Membership is never activated from the frontend**
The frontend SDK may report payment success — ignore it. Membership is only activated when Safepay sends a confirmed webhook to your backend. Always verify with Safepay before activating.

**Rule 7 — Cashier accounts are created by HQ only**
Cashiers cannot self-register. Their accounts are seeded or created via a backend admin script. There is no public registration endpoint for cashier role.

**Rule 8 — Transactions are recorded by the cashier, not the POS**
After completing a sale in CBS IMS, the cashier manually enters the final bill amount in the Cashier App. Your backend records it. There is no automatic transaction capture from CBS.

**Rule 9 — Offline transactions must sync**
If a cashier confirms a transaction while offline, the Cashier App stores it locally and syncs to your backend when connection is restored. Your sync endpoint must handle this gracefully — including deduplication.

**Rule 10 — Expired membership = no discount, no transaction recorded**
If a member's QR is scanned and their membership is expired, the validation endpoint returns `valid: false`. No discount is shown. No transaction is recorded.

---

## 4. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.x |
| Language | TypeScript | 5.x |
| Primary Database | PostgreSQL | 15+ |
| ORM | Prisma | 5.x |
| Cache | Redis | 7.x |
| Authentication | JWT (access + refresh token) | jsonwebtoken |
| Password Hashing | bcrypt | cost factor 12 |
| QR Token Signing | HMAC-SHA256 | Node crypto module |
| Push Notifications | Firebase Admin SDK | firebase-admin |
| Payment Gateway | Safepay | REST API + webhooks |
| OTP / SMS | Twilio or local SMS gateway | — |
| Email | AWS SES or SendGrid | — |
| File Storage | AWS S3 | — |
| Cloud | AWS | — |
| Hosting | AWS ECS (Docker) | — |
| API Gateway | AWS API Gateway | — |
| Logging | Winston + AWS CloudWatch | — |
| Job Scheduler | node-cron | — |
| Validation | Zod | — |
| Testing | Jest | — |
| CI/CD | GitHub Actions | — |

---

## 5. Project Structure

```
mumuso-backend/
├── prisma/
│   ├── schema.prisma              # All table definitions
│   ├── migrations/                # Auto-generated migration files
│   └── seed.ts                   # Seed script for stores, HQ config, cashier accounts
│
├── src/
│   ├── app.ts                    # Express app setup, middleware registration
│   ├── server.ts                 # Server entry point, port binding
│   │
│   ├── config/
│   │   ├── env.ts                # Zod-validated environment variables
│   │   ├── database.ts           # Prisma client singleton
│   │   ├── redis.ts              # Redis client singleton
│   │   └── firebase.ts           # Firebase Admin SDK init
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification, role injection
│   │   ├── role.middleware.ts    # Role-based route guards
│   │   ├── validate.middleware.ts # Zod schema validation
│   │   ├── rateLimiter.ts        # Per-endpoint rate limiting
│   │   ├── errorHandler.ts       # Global error handler
│   │   └── logger.ts             # Request logging
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts    # Zod validation schemas
│   │   │
│   │   ├── member/
│   │   │   ├── member.router.ts
│   │   │   ├── member.controller.ts
│   │   │   ├── member.service.ts
│   │   │   └── member.schema.ts
│   │   │
│   │   ├── membership/
│   │   │   ├── membership.router.ts
│   │   │   ├── membership.controller.ts
│   │   │   ├── membership.service.ts
│   │   │   └── membership.schema.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── stores.router.ts
│   │   │   ├── stores.controller.ts
│   │   │   ├── stores.service.ts
│   │   │   └── stores.schema.ts
│   │   │
│   │   ├── cashier/
│   │   │   ├── cashier.router.ts
│   │   │   ├── cashier.controller.ts
│   │   │   ├── cashier.service.ts
│   │   │   └── cashier.schema.ts
│   │   │
│   │   ├── transactions/
│   │   │   ├── transactions.router.ts
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   └── transactions.schema.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.schema.ts
│   │   │
│   │   └── payments/
│   │       ├── payments.router.ts
│   │       ├── payments.controller.ts
│   │       ├── payments.service.ts
│   │       └── safepay.webhook.ts
│   │
│   ├── jobs/
│   │   ├── index.ts              # Registers all cron jobs
│   │   ├── expiryReminder.job.ts # 30-day and 7-day expiry notifications
│   │   └── expiredToday.job.ts   # Day-of expiry notification
│   │
│   ├── utils/
│   │   ├── qrToken.ts            # QR token generation and verification
│   │   ├── memberId.ts           # Member ID generator (MUM-XXXXXX)
│   │   ├── jwt.ts                # Token sign and verify helpers
│   │   ├── otp.ts                # OTP generation and validation
│   │   ├── pagination.ts         # Cursor/offset pagination helpers
│   │   └── response.ts           # Standardised API response formatter
│   │
│   └── types/
│       ├── express.d.ts          # Augmented Request type with user + role
│       └── index.ts              # Shared TypeScript interfaces
│
├── tests/
│   ├── auth.test.ts
│   ├── cashier.test.ts
│   ├── membership.test.ts
│   └── qrToken.test.ts
│
├── .env.development
├── .env.staging
├── .env.production
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 6. Database Schema

### Table: `users`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name         VARCHAR(100) NOT NULL
email             VARCHAR(150) UNIQUE NOT NULL
phone             VARCHAR(20)
password_hash     VARCHAR(255) NOT NULL
role              ENUM('customer', 'cashier', 'super_admin') NOT NULL DEFAULT 'customer'
store_id          UUID REFERENCES stores(id)   -- cashiers only, NULL for customers
is_active         BOOLEAN DEFAULT true
last_login_at     TIMESTAMP
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Rules:**
- `store_id` is only populated for cashier role
- Customer and super_admin always have `store_id = NULL`
- Cashiers are seeded — no public registration

---

### Table: `stores`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
name              VARCHAR(150) NOT NULL
address           TEXT NOT NULL
city              VARCHAR(100) NOT NULL
country           VARCHAR(100) DEFAULT 'Pakistan'
latitude          DECIMAL(10,8)
longitude         DECIMAL(11,8)
phone             VARCHAR(20)
operating_hours   JSONB
discount_pct      DECIMAL(5,2)          -- NULL until configured
is_active         BOOLEAN DEFAULT false  -- false until discount_pct is set
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Rules:**
- `is_active` remains `false` until `discount_pct` is configured
- Only `is_active = true` stores appear in customer store list
- `operating_hours` format:
```json
{
  "monday":    { "open": "10:00", "close": "22:00", "closed": false },
  "tuesday":   { "open": "10:00", "close": "22:00", "closed": false },
  "wednesday": { "open": "10:00", "close": "22:00", "closed": false },
  "thursday":  { "open": "10:00", "close": "22:00", "closed": false },
  "friday":    { "open": "10:00", "close": "22:00", "closed": false },
  "saturday":  { "open": "10:00", "close": "23:00", "closed": false },
  "sunday":    { "open": "12:00", "close": "21:00", "closed": false }
}
```

---

### Table: `store_discount_config`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
store_id          UUID REFERENCES stores(id) NOT NULL
discount_pct      DECIMAL(5,2) NOT NULL
min_allowed       DECIMAL(5,2) NOT NULL DEFAULT 5.00
max_allowed       DECIMAL(5,2) NOT NULL DEFAULT 20.00
changed_by        UUID REFERENCES users(id)
changed_at        TIMESTAMP DEFAULT NOW()
```

**Purpose:** Audit trail of every discount % change per store.

---

### Table: `membership_plans`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
name              VARCHAR(100) NOT NULL    -- e.g. "Annual Membership"
price             DECIMAL(10,2) NOT NULL
currency          VARCHAR(10) DEFAULT 'PKR'
duration_months   INTEGER DEFAULT 12
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMP DEFAULT NOW()
```

---

### Table: `memberships`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id) UNIQUE NOT NULL
member_id         VARCHAR(20) UNIQUE NOT NULL     -- e.g. MUM-004821
status            ENUM('active', 'expired', 'suspended') DEFAULT 'active'
plan_id           UUID REFERENCES membership_plans(id)
start_date        DATE NOT NULL
expiry_date       DATE NOT NULL
payment_ref       VARCHAR(100)                    -- Safepay payment reference
activated_at      TIMESTAMP
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Rules:**
- One membership record per user at a time
- On renewal — update `expiry_date` and `status`, do not create new record
- `member_id` format: `MUM-` followed by 6-digit zero-padded number
- `status` is updated by a scheduled job — not on every API call

---

### Table: `transactions`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
member_id         VARCHAR(20) NOT NULL              -- denormalised for speed
user_id           UUID REFERENCES users(id)
store_id          UUID REFERENCES stores(id) NOT NULL
cashier_id        UUID REFERENCES users(id) NOT NULL
original_amount   DECIMAL(10,2) NOT NULL
discount_pct      DECIMAL(5,2) NOT NULL             -- snapshot at time of transaction
discount_amount   DECIMAL(10,2) NOT NULL
final_amount      DECIMAL(10,2) NOT NULL
discount_type     ENUM('full', 'partial') DEFAULT 'full'
is_offline_sync   BOOLEAN DEFAULT false             -- true if synced from offline queue
local_id          VARCHAR(100)                      -- cashier app's local ID for dedup
notification_sent BOOLEAN DEFAULT false
created_at        TIMESTAMP DEFAULT NOW()
```

**Rules:**
- `discount_pct` is snapshotted at transaction time — if store changes % later, historical records are unaffected
- `local_id` is used for deduplication during offline sync — unique per cashier device
- `original_amount` × `discount_pct` must equal `discount_amount` — validate server-side

---

### Table: `payments`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id) NOT NULL
plan_id           UUID REFERENCES membership_plans(id)
amount            DECIMAL(10,2) NOT NULL
currency          VARCHAR(10) DEFAULT 'PKR'
gateway           VARCHAR(50) DEFAULT 'safepay'
gateway_order_id  VARCHAR(100) UNIQUE              -- Safepay order ID
gateway_ref       VARCHAR(100)                     -- Safepay payment reference
status            ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending'
payment_method    VARCHAR(50)                      -- jazzcash, easypaisa, card etc.
webhook_received  BOOLEAN DEFAULT false
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

---

### Table: `otp_tokens`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id)
phone_or_email    VARCHAR(150) NOT NULL
code              VARCHAR(10) NOT NULL
type              ENUM('registration', 'password_reset') NOT NULL
expires_at        TIMESTAMP NOT NULL
used              BOOLEAN DEFAULT false
attempts          INTEGER DEFAULT 0
created_at        TIMESTAMP DEFAULT NOW()
```

---

### Table: `device_tokens`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id) NOT NULL
token             TEXT NOT NULL
platform          ENUM('ios', 'android') NOT NULL
is_active         BOOLEAN DEFAULT true
updated_at        TIMESTAMP DEFAULT NOW()
```

**Rules:**
- One active token per user per platform
- On new token registration — deactivate old token for same user + platform, insert new one
- On Firebase delivery failure — mark `is_active = false`

---

### Table: `notification_preferences`
```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID REFERENCES users(id) UNIQUE NOT NULL
promo_offers          BOOLEAN DEFAULT true
renewal_reminders     BOOLEAN DEFAULT true
transaction_confirm   BOOLEAN DEFAULT true
new_store_alerts      BOOLEAN DEFAULT true
updated_at            TIMESTAMP DEFAULT NOW()
```

---

### Table: `audit_logs`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
actor_id          UUID REFERENCES users(id)
action            VARCHAR(100) NOT NULL
target_type       VARCHAR(50)
target_id         UUID
old_value         JSONB
new_value         JSONB
ip_address        INET
created_at        TIMESTAMP DEFAULT NOW()
```

**Log these actions:**
- `MEMBERSHIP_ACTIVATED`
- `MEMBERSHIP_RENEWED`
- `MEMBERSHIP_SUSPENDED`
- `TRANSACTION_RECORDED`
- `TRANSACTION_OFFLINE_SYNCED`
- `STORE_DISCOUNT_UPDATED`
- `CASHIER_ACCOUNT_CREATED`
- `PAYMENT_COMPLETED`
- `PAYMENT_FAILED`

---

## 7. API Endpoints — Auth

Base path: `/api/v1/auth`

---

### POST `/register`
**Access:** Public  
**Purpose:** Register a new customer account

**Request Body:**
```json
{
  "full_name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "phone": "+923001234567",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Validation:**
- Email must be unique
- Password min 8 chars, must include uppercase, lowercase, number
- Phone must be valid Pakistani format
- Role is always set to `customer` — never accepted from request body

**Success Response `201`:**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "data": { "user_id": "uuid" }
}
```

**On Success:** Generate 6-digit OTP, store in `otp_tokens`, send via SMS. Do NOT issue JWT yet — account not verified.

**Rate Limit:** 5 registrations per IP per hour

---

### POST `/verify-otp`
**Access:** Public  
**Purpose:** Verify OTP and activate account

**Request Body:**
```json
{
  "user_id": "uuid",
  "code": "847291",
  "type": "registration"
}
```

**Logic:**
- Check OTP exists, not used, not expired
- Increment `attempts` on each call
- Lock after 3 failed attempts (set expiry to past)
- On success — mark OTP used, activate user, issue JWT pair

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "user": {
      "id": "uuid",
      "full_name": "Ayesha Khan",
      "email": "ayesha@example.com",
      "role": "customer",
      "has_membership": false
    }
  }
}
```

---

### POST `/login`
**Access:** Public  
**Purpose:** Login for all roles (customer + cashier)

**Request Body:**
```json
{
  "email": "ayesha@example.com",
  "password": "SecurePass123!"
}
```

**Logic:**
- Verify email exists, account active
- Verify password against bcrypt hash
- Return role in response — frontend uses this for routing
- For cashier role — also return `store_id` and `store_name`

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "user": {
      "id": "uuid",
      "full_name": "Sara Ahmed",
      "email": "sara@mumuso.com",
      "role": "cashier",
      "store_id": "uuid",
      "store_name": "Mumuso Gulberg",
      "has_membership": false
    }
  }
}
```

**Rate Limit:** 5 failed attempts per email per 15 minutes → 30-minute block

---

### POST `/refresh`
**Access:** Public (refresh token in body)  
**Purpose:** Issue new access token

**Request Body:**
```json
{ "refresh_token": "jwt..." }
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": { "access_token": "jwt..." }
}
```

---

### POST `/logout`
**Access:** Authenticated  
**Purpose:** Invalidate refresh token

**Logic:** Add refresh token to Redis blocklist with TTL matching token expiry

---

### POST `/forgot-password`
**Access:** Public

**Request Body:**
```json
{ "email": "ayesha@example.com" }
```

**Logic:** Generate OTP, store with type `password_reset`, send via SMS/email. Always return success — never reveal if email exists.

---

### POST `/reset-password`
**Access:** Public

**Request Body:**
```json
{
  "user_id": "uuid",
  "code": "293847",
  "new_password": "NewPass456!",
  "confirm_password": "NewPass456!"
}
```

---

## 8. API Endpoints — Customer (Member)

Base path: `/api/v1/member`  
**Access:** Authenticated — customer role only

---

### GET `/dashboard`
**Purpose:** Home screen data

**Response:**
```json
{
  "success": true,
  "data": {
    "member_id": "MUM-004821",
    "status": "active",
    "expiry_date": "2027-02-16",
    "days_remaining": 365,
    "total_saved": 4250.00,
    "total_transactions": 12,
    "recent_transactions": [
      {
        "id": "uuid",
        "store_name": "Mumuso Gulberg",
        "date": "2026-02-15",
        "discount_amount": 420.00,
        "final_amount": 3080.00,
        "discount_type": "full"
      }
    ],
    "active_campaign": {
      "id": "uuid",
      "title": "Weekend Bonus",
      "image_url": "https://..."
    }
  }
}
```

---

### GET `/qr-token`
**Purpose:** Get fresh signed QR token for display  
**Cache:** Do NOT cache — always generate fresh

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "base64encodedSignedToken...",
    "expires_at": 1739453100,
    "member_id": "MUM-004821"
  }
}
```

**Logic:** See Section 14 — QR Token System

---

### GET `/status`
**Purpose:** Check membership status (called on app load)

**Response:**
```json
{
  "success": true,
  "data": {
    "has_membership": true,
    "status": "active",
    "expiry_date": "2027-02-16",
    "member_id": "MUM-004821"
  }
}
```

---

### GET `/transactions`
**Purpose:** Purchase history — paginated

**Query Params:**
- `page` (default 1)
- `limit` (default 20, max 50)
- `store_id` (optional filter)
- `from_date` (optional)
- `to_date` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "has_more": true
    },
    "summary": {
      "total_saved": 4250.00,
      "total_transactions": 45
    }
  }
}
```

---

### GET `/transactions/:id`
**Purpose:** Single transaction detail  
**Rule:** User can only access their own transactions

---

### PUT `/profile`
**Purpose:** Update name and phone

**Request Body:**
```json
{
  "full_name": "Ayesha Malik",
  "phone": "+923001234567"
}
```

**Rule:** Email cannot be updated — reject if email included in body

---

### POST `/device-token`
**Purpose:** Register FCM device token for push notifications

**Request Body:**
```json
{
  "token": "fcm_device_token_here",
  "platform": "android"
}
```

---

### PUT `/notification-preferences`
**Purpose:** Update notification toggles

**Request Body:**
```json
{
  "promo_offers": true,
  "renewal_reminders": true,
  "transaction_confirm": false,
  "new_store_alerts": true
}
```

---

## 9. API Endpoints — Membership

Base path: `/api/v1/membership`  
**Access:** Authenticated — customer role only

---

### GET `/plans`
**Purpose:** Get active membership plan(s)

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "name": "Annual Membership",
        "price": 1999.00,
        "currency": "PKR",
        "duration_months": 12,
        "benefits": [
          "Discount at all Mumuso stores",
          "Exclusive member offers",
          "Track your savings"
        ]
      }
    ]
  }
}
```

---

### POST `/create-order`
**Purpose:** Create Safepay payment order before checkout

**Request Body:**
```json
{ "plan_id": "uuid" }
```

**Logic:**
1. Validate plan exists and is active
2. Check user does not already have active membership
3. Create `payments` record with status `pending`
4. Call Safepay API to create order
5. Return Safepay token to frontend SDK

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "safepay_token": "sfpy_token_...",
    "amount": 1999.00,
    "currency": "PKR"
  }
}
```

---

### POST `/webhook/safepay`
**Purpose:** Receive payment confirmation from Safepay  
**Access:** Public — but must verify Safepay signature header

**Logic:**
1. Verify webhook signature using Safepay secret
2. Find `payments` record by `gateway_order_id`
3. Update payment status to `completed`
4. Generate `member_id` (MUM-XXXXXX)
5. Create or update `memberships` record — status `active`
6. Send "Membership Activated" push notification to customer
7. Log to `audit_logs`

**CRITICAL:** This is the ONLY place membership is activated. Never activate from any other endpoint.

---

### GET `/renewal-info`
**Purpose:** Get renewal pricing and new expiry preview

**Response:**
```json
{
  "success": true,
  "data": {
    "current_expiry": "2026-02-16",
    "new_expiry_if_renewed_today": "2027-02-16",
    "plan": {
      "name": "Annual Membership",
      "price": 1999.00,
      "currency": "PKR"
    }
  }
}
```

---

### POST `/renew/create-order`
**Purpose:** Create Safepay order for renewal  
**Logic:** Same as `/create-order` but for existing members  
**Renewal webhook:** Same `/webhook/safepay` endpoint — update existing membership expiry date, do not create new record

---

## 10. API Endpoints — Stores

Base path: `/api/v1/stores`  
**Access:** Authenticated — customer role

---

### GET `/`
**Purpose:** List all active stores with discount %

**Query Params:**
- `city` (optional filter)
- `search` (optional — name search)
- `sort` (optional — `discount_asc`, `discount_desc`)

**Rules:**
- Only return stores where `is_active = true`
- Only return stores where `discount_pct IS NOT NULL`
- Never return stores still being configured

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "uuid",
        "name": "Mumuso Gulberg",
        "address": "Main Boulevard, Gulberg III",
        "city": "Lahore",
        "latitude": 31.5204,
        "longitude": 74.3587,
        "discount_pct": 12.0,
        "phone": "+924235761234",
        "operating_hours": { ... },
        "is_open_now": true
      }
    ]
  }
}
```

**`is_open_now`** — Computed server-side based on current Pakistan time and store's operating hours

---

### GET `/:id`
**Purpose:** Single store detail

**Response:** Same as store object above with full operating hours

---

## 11. API Endpoints — Cashier

Base path: `/api/v1/cashier`  
**Access:** Authenticated — cashier role only

---

### POST `/validate`
**Purpose:** Validate a member QR token or Member ID  
**This is the most critical endpoint in the entire system**

**Request Body — QR scan (preferred):**
```json
{
  "qr_token": "base64encodedSignedToken...",
  "store_id": "uuid"
}
```

**Request Body — Manual ID entry (fallback):**
```json
{
  "member_id": "MUM-004821",
  "store_id": "uuid"
}
```

**Validation Logic:**
```
IF qr_token provided:
  1. Base64 decode token
  2. Parse JSON payload: { memberId, issuedAt, expiresAt, signature }
  3. Verify HMAC signature using server secret
  4. Check expiresAt > current unix timestamp
  5. Extract memberId from payload
ELSE IF member_id provided:
  1. Use member_id directly — no signature check
  2. Flag response as manual_entry: true

6. Look up memberships table by member_id
7. Check status = 'active'
8. Check expiry_date >= today
9. Look up store discount_pct by store_id
10. Return result
```

**Success Response — Valid Member:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "member_id": "MUM-004821",
    "member_name": "Ayesha Khan",
    "discount_pct": 12.0,
    "expiry_date": "2027-02-16",
    "membership_status": "active",
    "manual_entry": false,
    "message": "Active member. Apply 12% discount."
  }
}
```

**Failure Response — Expired:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "expired",
    "expired_on": "2026-01-15",
    "member_name": "Bilal Akhtar",
    "message": "Membership expired. Ask customer to renew in their app.",
    "renewal_prompt": true
  }
}
```

**Failure Response — Not Found:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "not_found",
    "message": "Member not found. Ask customer to verify their ID."
  }
}
```

**Failure Response — Suspended:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "suspended",
    "message": "Account suspended. Direct customer to Mumuso support."
  }
}
```

**Failure Response — Invalid Token Signature:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "invalid_token",
    "message": "QR code is invalid. Ask customer to refresh their card."
  }
}
```

**Rate Limit:** 120 requests per cashier per minute

---

### GET `/store-config`
**Purpose:** Get cashier's store info including current discount %  
**Called on Cashier App launch and after offline reconnect**

**Response:**
```json
{
  "success": true,
  "data": {
    "store_id": "uuid",
    "store_name": "Mumuso Gulberg",
    "discount_pct": 12.0,
    "last_updated": "2026-02-15T10:30:00Z"
  }
}
```

---

## 12. API Endpoints — Transactions

Base path: `/api/v1/transactions`  
**Access:** Authenticated — cashier role

---

### POST `/record`
**Purpose:** Record a completed transaction after cashier confirms sale

**Request Body — Full discount:**
```json
{
  "member_id": "MUM-004821",
  "store_id": "uuid",
  "original_amount": 3500.00,
  "final_amount": 3080.00,
  "discount_type": "full",
  "local_id": "cashier-device-uuid-timestamp"
}
```

**Request Body — Partial discount:**
```json
{
  "member_id": "MUM-004821",
  "store_id": "uuid",
  "original_amount": 3500.00,
  "discount_amount": 180.00,
  "final_amount": 3320.00,
  "discount_type": "partial",
  "local_id": "cashier-device-uuid-timestamp"
}
```

**Logic:**
1. Check `local_id` uniqueness — if exists, return existing transaction (deduplication)
2. Look up membership by `member_id` — must be active
3. Look up store `discount_pct`
4. If `discount_type = full` — compute `discount_amount = original_amount × discount_pct / 100`
5. If `discount_type = partial` — use provided `discount_amount` as-is
6. Validate amounts are consistent
7. Insert transaction record
8. Queue push notification to member
9. Log to audit_logs
10. Return transaction record

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "member_id": "MUM-004821",
    "store_name": "Mumuso Gulberg",
    "original_amount": 3500.00,
    "discount_amount": 420.00,
    "final_amount": 3080.00,
    "discount_pct": 12.0,
    "discount_type": "full",
    "created_at": "2026-02-16T14:32:00Z"
  }
}
```

---

### POST `/sync`
**Purpose:** Sync offline transactions from cashier device queue  
**Access:** Authenticated — cashier role

**Request Body:**
```json
{
  "transactions": [
    {
      "member_id": "MUM-004821",
      "store_id": "uuid",
      "original_amount": 3500.00,
      "final_amount": 3080.00,
      "discount_type": "full",
      "local_id": "device-uuid-1",
      "recorded_at": "2026-02-16T12:15:00Z"
    },
    {
      "member_id": "MUM-007342",
      "store_id": "uuid",
      "original_amount": 1200.00,
      "final_amount": 1056.00,
      "discount_type": "full",
      "local_id": "device-uuid-2",
      "recorded_at": "2026-02-16T12:28:00Z"
    }
  ]
}
```

**Logic:**
- Process each transaction individually
- Use `local_id` for deduplication — skip if already exists
- Use `recorded_at` as the transaction timestamp (not server time)
- Mark each as `is_offline_sync = true`
- Send delayed push notifications to affected members
- Return per-transaction sync result

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 2,
    "skipped": 0,
    "failed": 0,
    "results": [
      { "local_id": "device-uuid-1", "status": "synced", "transaction_id": "uuid" },
      { "local_id": "device-uuid-2", "status": "synced", "transaction_id": "uuid" }
    ]
  }
}
```

---

## 13. API Endpoints — Notifications

Base path: `/api/v1/notifications`  
**Access:** Authenticated — customer role

---

### GET `/`
**Purpose:** Get notification inbox (last 30 notifications)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "PKR 420 saved!",
        "body": "You saved PKR 420 at Mumuso Gulberg today.",
        "type": "transaction",
        "read": false,
        "created_at": "2026-02-16T14:32:00Z",
        "deep_link": "mumuso://transactions/uuid"
      }
    ]
  }
}
```

---

### PUT `/:id/read`
**Purpose:** Mark notification as read

---

### PUT `/read-all`
**Purpose:** Mark all notifications as read

---

## 14. QR Token System

### Token Generation — `src/utils/qrToken.ts`

```typescript
import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET; // 256-bit secret, rotate quarterly
const TOKEN_TTL = 300; // 5 minutes in seconds

export function generateQRToken(memberId: string): string {
  const payload = {
    memberId,
    issuedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL,
  };

  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payloadStr)
    .digest('hex');

  const fullPayload = { ...payload, signature };
  return Buffer.from(JSON.stringify(fullPayload)).toString('base64');
}

export function verifyQRToken(token: string): {
  valid: boolean;
  memberId?: string;
  reason?: string;
} {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { memberId, issuedAt, expiresAt, signature } = decoded;

    // Check expiry
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      return { valid: false, reason: 'token_expired' };
    }

    // Verify signature
    const payloadStr = JSON.stringify({ memberId, issuedAt, expiresAt });
    const expectedSig = crypto
      .createHmac('sha256', QR_SECRET)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSig) {
      return { valid: false, reason: 'invalid_signature' };
    }

    return { valid: true, memberId };
  } catch {
    return { valid: false, reason: 'malformed_token' };
  }
}
```

### Token Rules
- `QR_SECRET` must be at least 32 bytes — store in environment variable only, never in code
- Rotate `QR_SECRET` quarterly — old tokens become invalid immediately on rotation
- Never cache QR tokens in Redis — always generate fresh on each `/member/qr-token` request
- Log failed signature verification attempts — repeated failures from same cashier may indicate abuse

---

## 15. Payment Gateway Integration — Safepay

### Flow

```
1. Customer taps "Confirm & Pay" in app
2. App calls POST /membership/create-order
3. Backend calls Safepay API → creates order → gets safepay_token
4. Backend returns safepay_token to app
5. App opens Safepay payment sheet using SDK
6. Customer selects payment method: JazzCash / EasyPaisa / HBL Pay / Card
7. Customer completes payment in Safepay sheet
8. Safepay sends webhook to POST /membership/webhook/safepay
9. Backend verifies webhook signature
10. Backend activates membership
11. Backend sends push notification to customer
12. App receives notification → navigates to QR Card screen
```

### Webhook Verification

```typescript
import crypto from 'crypto';

function verifySafepayWebhook(
  payload: string,
  signatureHeader: string
): boolean {
  const expectedSig = crypto
    .createHmac('sha256', process.env.SAFEPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expectedSig)
  );
}
```

### Supported Payment Methods
- JazzCash
- EasyPaisa
- HBL Pay
- Visa / Mastercard (debit and credit)

### Environment Variables Required
```
SAFEPAY_API_KEY=
SAFEPAY_SECRET_KEY=
SAFEPAY_WEBHOOK_SECRET=
SAFEPAY_BASE_URL=https://api.getsafepay.com
```

---

## 16. Push Notification Service

### `src/modules/notifications/notifications.service.ts`

### Notification Types

| Type | Trigger | Title | Body | Deep Link |
|---|---|---|---|---|
| `membership_activated` | Safepay webhook confirmed | "Welcome to Mumuso!" | "Your membership is active. Show your QR at any store." | `mumuso://card` |
| `transaction_confirmed` | Transaction recorded | "PKR {amount} saved!" | "You saved PKR {discount} at {store} today." | `mumuso://transactions/{id}` |
| `expiry_30_days` | Cron — daily | "Membership expiring soon" | "Your membership expires in 30 days. Renew now." | `mumuso://renewal` |
| `expiry_7_days` | Cron — daily | "1 week left!" | "Your membership expires in 7 days. Don't lose your discount." | `mumuso://renewal` |
| `expiry_today` | Cron — daily | "Membership expired" | "Your membership has expired. Renew to keep your discount." | `mumuso://renewal` |
| `membership_renewed` | Safepay webhook confirmed | "Membership renewed!" | "Your membership is active until {date}." | `mumuso://card` |

### Sending Logic

```typescript
async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    type: string;
    deep_link?: string;
    data?: Record<string, string>;
  }
): Promise<void> {
  // Check user preferences
  const prefs = await getNotificationPreferences(userId);
  if (!shouldSend(prefs, notification.type)) return;

  // Get active device tokens
  const tokens = await getActiveDeviceTokens(userId);
  if (!tokens.length) return;

  // Send via Firebase
  await firebaseAdmin.messaging().sendEachForMulticast({
    tokens: tokens.map(t => t.token),
    notification: { title: notification.title, body: notification.body },
    data: { type: notification.type, deep_link: notification.deep_link ?? '' },
    apns: { payload: { aps: { sound: 'default' } } },
    android: { priority: 'high' },
  });
}
```

---

## 17. Transaction Scenarios — All Six

Your `/cashier/validate` and `/transactions/record` endpoints must handle all six correctly.

| # | Scenario | Validate Response | Record Behaviour |
|---|---|---|---|
| 1 | Valid member, QR scan | `valid: true` + discount % | Record normally |
| 2 | Valid member, manual ID | `valid: true` + discount % + `manual_entry: true` | Record normally |
| 3 | Membership expired | `valid: false, reason: expired` | Do NOT record — return error if attempted |
| 4 | Member not found | `valid: false, reason: not_found` | Do NOT record |
| 5 | Partial discount | `valid: true` + discount % | Record with `discount_type: partial`, use provided `discount_amount` |
| 6 | Offline sync | N/A — validated locally with cached config | Accept via `/transactions/sync`, deduplicate by `local_id` |

---

## 18. Role Based Access Control

### Middleware: `src/middleware/role.middleware.ts`

```typescript
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient role' });
    }
    next();
  };
};
```

### Route Protection

| Endpoint Group | Allowed Roles |
|---|---|
| `/auth/*` | Public |
| `/member/*` | `customer` |
| `/membership/*` | `customer` (except webhook — public with signature) |
| `/stores/*` | `customer` |
| `/cashier/*` | `cashier` |
| `/transactions/record` | `cashier` |
| `/transactions/sync` | `cashier` |
| `/notifications/*` | `customer` |

**Critical:** Role check happens server-side on every request. Frontend role-based routing is convenience only — never trust it for security.

---

## 19. Security Requirements

### JWT Configuration
```
ACCESS_TOKEN_SECRET=     # 256-bit random secret
ACCESS_TOKEN_EXPIRY=     15m
REFRESH_TOKEN_SECRET=    # Different 256-bit random secret
REFRESH_TOKEN_EXPIRY=    30d
```

### Password Policy
- Minimum 8 characters
- Must contain uppercase, lowercase, number
- bcrypt cost factor: 12
- Never log passwords, never return password_hash in any response

### Rate Limiting (Per Endpoint)
| Endpoint | Limit |
|---|---|
| `POST /auth/register` | 5 per IP per hour |
| `POST /auth/login` | 5 failed attempts per email per 15 min |
| `POST /auth/verify-otp` | 3 attempts per OTP |
| `POST /auth/forgot-password` | 3 per email per hour |
| `POST /cashier/validate` | 120 per cashier per minute |
| `GET /member/qr-token` | 30 per user per minute |
| All other endpoints | 100 per user per minute |

### Additional Security
- All endpoints HTTPS only — reject HTTP
- CORS: whitelist only your mobile app bundle ID and admin domains
- Helmet.js middleware for HTTP security headers
- SQL injection: Prisma parameterised queries — never raw string interpolation
- Input sanitisation via Zod on every request body
- Refresh tokens stored in Redis blocklist on logout
- QR secret rotated quarterly — document rotation procedure
- Webhook endpoints verify signature before processing — reject unsigned requests immediately

---

## 20. Scheduled Jobs

### `src/jobs/index.ts` — Register All Jobs

```typescript
import cron from 'node-cron';

// Daily at 09:00 PKT (04:00 UTC)
cron.schedule('0 4 * * *', expiryReminder30Days);
cron.schedule('0 4 * * *', expiryReminder7Days);

// Daily at 08:00 PKT (03:00 UTC)
cron.schedule('0 3 * * *', expiredTodayNotification);

// Daily at 02:00 UTC — update membership statuses
cron.schedule('0 2 * * *', updateExpiredMemberships);
```

### `updateExpiredMemberships`
```sql
UPDATE memberships
SET status = 'expired', updated_at = NOW()
WHERE expiry_date < CURRENT_DATE
AND status = 'active'
```

### `expiryReminder30Days`
```sql
SELECT m.user_id, m.expiry_date, u.full_name
FROM memberships m
JOIN users u ON u.id = m.user_id
WHERE m.expiry_date = CURRENT_DATE + INTERVAL '30 days'
AND m.status = 'active'
```
→ Send `expiry_30_days` push notification to each

### `expiryReminder7Days`
Same query with `INTERVAL '7 days'`
→ Send `expiry_7_days` push notification

### `expiredTodayNotification`
```sql
WHERE m.expiry_date = CURRENT_DATE AND m.status = 'active'
```
→ Send `expiry_today` push notification

---

## 21. Offline Sync Handling

### What the Cashier App Stores Locally

When offline, the Cashier App stores each transaction in `AsyncStorage` with this structure:

```json
{
  "local_id": "device-{uuid}-{timestamp}",
  "member_id": "MUM-004821",
  "store_id": "uuid",
  "original_amount": 3500.00,
  "final_amount": 3080.00,
  "discount_type": "full",
  "discount_pct": 12.0,
  "recorded_at": "2026-02-16T12:15:00Z"
}
```

### Backend Sync Rules

- Accept batch of up to 50 transactions per sync call
- Process each sequentially — do not fail entire batch if one fails
- Deduplicate by `local_id` — return `skipped` for duplicates
- Use `recorded_at` as transaction timestamp — not server receipt time
- Mark all synced transactions with `is_offline_sync = true`
- Send push notifications to all affected members after sync completes
- Return detailed result per transaction so app can clear its local queue

---

## 22. Error Handling Standards

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | JWT access token expired |
| `TOKEN_INVALID` | 401 | JWT malformed or wrong secret |
| `FORBIDDEN` | 403 | Role not permitted for this endpoint |
| `NOT_FOUND` | 404 | Resource does not exist |
| `ALREADY_EXISTS` | 409 | Duplicate email, duplicate local_id etc. |
| `PAYMENT_REQUIRED` | 402 | Membership not active |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Global Error Handler: `src/middleware/errorHandler.ts`
- Never return stack traces in production
- Log full error with Winston to CloudWatch
- Return sanitised error response to client

---

## 23. Environment Configuration

### `.env.development`
```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mumuso_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
ACCESS_TOKEN_SECRET=your-256-bit-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your-other-256-bit-secret
REFRESH_TOKEN_EXPIRY=30d

# QR Token
QR_SECRET=your-32-byte-qr-signing-secret

# Safepay
SAFEPAY_API_KEY=
SAFEPAY_SECRET_KEY=
SAFEPAY_WEBHOOK_SECRET=
SAFEPAY_BASE_URL=https://sandbox.api.getsafepay.com

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# SMS / OTP
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=noreply@mumuso.com
AWS_S3_BUCKET=mumuso-assets

# Discount Boundaries (HQ Config)
DISCOUNT_MIN_PCT=5
DISCOUNT_MAX_PCT=20
```

---

## 24. What to Build First

Follow this exact sequence. Do not jump ahead.

**Week 1 — Foundation**
1. Project setup — TypeScript, Express, Prisma, ESLint, Prettier
2. Database schema — run all migrations
3. Redis connection
4. Auth module — register, OTP, login, refresh, logout
5. JWT middleware and role guard middleware
6. Global error handler and response formatter
7. Seed script — membership plan, stores, one cashier account

**Week 2 — Core Customer Flow**
1. Member dashboard endpoint
2. QR token generation endpoint
3. Member status endpoint
4. Stores list and detail endpoints
5. Device token registration

**Week 3 — Payments and Membership**
1. Safepay integration — create order
2. Safepay webhook — membership activation
3. Membership plans endpoint
4. Renewal flow
5. Push notification service setup

**Week 4 — Cashier Flow**
1. Cashier validate endpoint — full QR token verification
2. Cashier validate endpoint — manual ID fallback
3. All six validation scenarios handled and tested
4. Store config endpoint for cashier
5. Transaction record endpoint
6. Transaction sync endpoint — offline deduplication

**Week 5 — Notifications and Jobs**
1. Transaction push notification
2. Scheduled expiry reminder jobs
3. Member transaction history endpoints
4. Notification preferences
5. Notification inbox

**Week 6 — Hardening**
1. Rate limiting on all endpoints
2. Security audit — headers, CORS, input sanitisation
3. Unit tests — QR token, auth, cashier validate, offline sync
4. Load test cashier validate endpoint
5. Documentation — Postman collection

---

## 25. What NOT to Build Yet

| Feature | Reason |
|---|---|
| Web dashboard APIs | Phase 2 |
| Super Admin endpoints | Phase 2 |
| Store discount configuration API | HQ manages via seed/script for Phase 1 |
| Campaign management | Phase 2 |
| Analytics aggregation | Phase 2 |
| Referral programme | Not designed |
| CBS IMS integration | Not needed — ever |
| Multi-language API responses | Frontend handles i18n |
| Receipt PDF generation | Phase 2 |
| Store map / geofencing | Phase 2 |

---

*Mumuso Loyalty App — Backend Specification v1.0*
*Phase 1 — Mobile First*
*Confidential — Internal Use Only*
