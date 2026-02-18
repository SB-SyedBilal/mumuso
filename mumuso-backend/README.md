# Mumuso Loyalty App — Backend API

> **Version:** 1.0 | **Phase:** 1 — Mobile First | **Stack:** Node.js / PostgreSQL / Redis / AWS

REST API backend powering the Mumuso Paid Membership & Loyalty App. Serves two mobile app modes:
- **Customer Mode** — Purchase memberships, display QR cards, browse stores, track savings
- **Cashier Mode** — Scan member QR codes, validate memberships, record transactions

---

## Quick Start

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7.x
- Docker & Docker Compose (optional, for containerised setup)

### Option A: Docker Compose (Recommended)

```bash
# Clone and enter directory
cd mumuso-backend

# Copy environment template
cp .env.example .env.development

# Start all services (PostgreSQL, Redis, API)
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npx prisma db seed

# API available at http://localhost:3000
# Health check: http://localhost:3000/health
```

### Option B: Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.development

# Edit .env.development with your local PostgreSQL and Redis URLs

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server (hot reload)
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env.development` and configure:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `ACCESS_TOKEN_SECRET` | Yes | JWT access token secret (min 32 chars) |
| `REFRESH_TOKEN_SECRET` | Yes | JWT refresh token secret (min 32 chars) |
| `QR_SECRET` | Yes | QR token HMAC signing secret (min 32 chars) |
| `SAFEPAY_API_KEY` | No* | Safepay API key (*required for payments) |
| `SAFEPAY_WEBHOOK_SECRET` | No* | Safepay webhook verification secret |
| `FIREBASE_PROJECT_ID` | No* | Firebase project ID (*required for push notifications) |
| `TWILIO_ACCOUNT_SID` | No* | Twilio SID (*required for SMS OTP in production) |

See `.env.example` for the complete list.

---

## API Routes

All routes prefixed with `/api/v1/`.

| Group | Base Path | Access | Description |
|---|---|---|---|
| Auth | `/api/v1/auth` | Public | Register, login, OTP, refresh, logout, password reset |
| Member | `/api/v1/member` | Customer | Dashboard, QR token, profile, transactions |
| Membership | `/api/v1/membership` | Customer | Plans, create order, webhook, renewal |
| Stores | `/api/v1/stores` | Customer | Store list, store detail |
| Cashier | `/api/v1/cashier` | Cashier | Validate member QR/ID, store config |
| Transactions | `/api/v1/transactions` | Cashier | Record transaction, offline sync |
| Notifications | `/api/v1/notifications` | Customer | Notification inbox, mark read |
| Health | `/health` | Public | Service health check |

---

## Project Structure

```
mumuso-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Auto-generated migrations
│   └── seed.ts                # Seed script
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── config/                # Environment, DB, Redis, Firebase
│   ├── middleware/            # Auth, role, validation, rate limiting, errors, logging
│   ├── modules/               # Feature modules (auth, member, membership, etc.)
│   ├── jobs/                  # Scheduled cron jobs
│   ├── services/              # External service adapters (SMS, Safepay)
│   ├── utils/                 # QR token, JWT, OTP, pagination, response helpers
│   └── types/                 # TypeScript interfaces and Express augmentation
├── tests/                     # Jest test files
├── .env.example               # Environment template
├── docker-compose.yml         # Local dev containers
├── Dockerfile                 # Multi-stage production build
└── .github/workflows/         # CI/CD pipeline
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start production server |
| `npm test` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Create and apply migrations |
| `npx prisma db seed` | Run seed script |

---

## Seeded Data

After running `npx prisma db seed`:

| Entity | Details |
|---|---|
| Membership Plan | Annual Membership — PKR 1,999 |
| Store 1 | Mumuso Gulberg (Lahore) — 12% discount |
| Store 2 | Mumuso DHA (Lahore) — 10% discount |
| Store 3 | Mumuso Centaurus (Islamabad) — 15% discount |
| Cashier | `cashier.gulberg@mumuso.com` / `Cashier@123` |
| Admin | `admin@mumuso.com` / `Admin@Mumuso2026!` |

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Coverage targets: 85%+ on critical paths (auth, QR token, cashier, payments)
```

---

## Deployment

### Docker Build
```bash
docker build -t mumuso-backend .
docker run -p 3000:3000 --env-file .env.production mumuso-backend
```

### AWS ECS
CI/CD via GitHub Actions: push to `main` → test → build Docker image → push to ECR → deploy to ECS.

See `.github/workflows/deploy.yml` for the full pipeline.

---

## Security

- JWT authentication (access 15m / refresh 30d)
- bcrypt password hashing (cost factor 12)
- HMAC-SHA256 QR token signing with dual-secret rotation
- Safepay webhook signature verification
- Per-endpoint rate limiting
- Helmet.js security headers
- Zod input validation on all endpoints
- No secrets in code — environment variables only
- Sensitive data masked in logs

---

*Mumuso Loyalty App — Backend v1.0 — Phase 1 — Confidential*
