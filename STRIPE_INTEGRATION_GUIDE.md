# Stripe Payment Integration Guide

## Overview

The Mumuso backend now supports **Stripe** as a payment gateway alongside SafePay. This integration is configured for **test mode** by default, making it ideal for demos and development.

---

## Architecture

### Payment Gateway Abstraction

The system follows a service abstraction pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Membership Service                        │
│  (Gateway-agnostic payment order creation & processing)     │
└─────────────────┬───────────────────────────┬───────────────┘
                  │                           │
        ┌─────────▼─────────┐       ┌────────▼────────┐
        │  SafePay Service  │       │  Stripe Service  │
        │  (Pakistan)       │       │  (Global)        │
        └─────────┬─────────┘       └────────┬────────┘
                  │                           │
        ┌─────────▼─────────┐       ┌────────▼────────┐
        │ Real/Mock SafePay │       │ Real/Mock Stripe│
        └───────────────────┘       └─────────────────┘
```

### Key Features

- **Circuit Breaker**: Automatic failover on gateway timeouts
- **Webhook Verification**: HMAC signature validation for security
- **Idempotency**: Duplicate webhook protection
- **Test Mode Support**: Uses Stripe test keys (sk_test_*)
- **Mock Mode**: Configurable scenarios for testing

---

## Setup Instructions

### 1. Get Stripe Test Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Navigate to **Dashboard** → **Developers** → **API Keys**
3. Copy your **test mode** keys:
   - Secret key (starts with `sk_test_`)
   - Publishable key (starts with `pk_test_`)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Stripe Test Mode Configuration
STRIPE_SECRET_KEY=sk_test_51ABC...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...xyz
STRIPE_WEBHOOK_SECRET=whsec_ABC...xyz
STRIPE_MOCK_SCENARIO=SUCCESS
```

**Important**: 
- Use **test keys** (sk_test_*) for development/demos
- Never commit real keys to version control
- The system auto-detects test mode from the key prefix

### 3. Install Dependencies

```bash
cd mumuso-backend
npm install
```

This installs:
- `stripe@^14.14.0` - Official Stripe Node.js SDK

### 4. Setup Webhook Endpoint (Optional for Local Testing)

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/v1/membership/webhook/stripe
```

The CLI will output a webhook signing secret (whsec_*). Add it to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_ABC...xyz
```

---

## API Usage

### Create Payment Order with Stripe

**Endpoint**: `POST /api/v1/membership/create-order`

**Request**:
```json
{
  "plan_id": "uuid-of-membership-plan",
  "gateway": "stripe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "gateway": "stripe",
    "gateway_token": "cs_test_abc123...",
    "client_secret": "cs_test_secret_xyz...",
    "amount": 2999,
    "currency": "PKR",
    "expiry": 1800,
    "is_renewal": false
  }
}
```

### Webhook Events

**Endpoint**: `POST /api/v1/membership/webhook/stripe`

Stripe sends webhooks for:
- `checkout.session.completed` - Payment successful
- `checkout.session.expired` - Session timeout

The webhook handler:
1. Verifies signature using `STRIPE_WEBHOOK_SECRET`
2. Extracts order ID from session metadata
3. Processes payment (activates/renews membership)
4. Returns 200 status to acknowledge receipt

---

## Frontend Integration

### React Native / Mobile App

```typescript
import { loadStripe } from '@stripe/stripe-react-native';

// Initialize Stripe
const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

// Create payment order
const response = await fetch('/api/v1/membership/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    plan_id: selectedPlanId,
    gateway: 'stripe'
  })
});

const { client_secret } = await response.json();

// Present checkout
const { error } = await stripe.confirmPayment(client_secret, {
  paymentMethodType: 'Card',
  paymentMethodData: {
    billingDetails: {
      email: userEmail
    }
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  console.log('Payment successful!');
}
```

### Web App (Next.js / React)

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Create checkout session
const response = await fetch('/api/v1/membership/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    plan_id: selectedPlanId,
    gateway: 'stripe'
  })
});

const { gateway_token } = await response.json();

// Redirect to Stripe Checkout
const stripe = await stripePromise;
await stripe.redirectToCheckout({
  sessionId: gateway_token
});
```

---

## Testing Scenarios

### Mock Mode (No Stripe API Calls)

Set in `.env`:
```bash
STRIPE_MOCK_SCENARIO=SUCCESS
STRIPE_SECRET_KEY=  # Leave empty or use mock key
```

Available scenarios:
- `SUCCESS` - Payment succeeds immediately
- `FAILED` - Payment fails
- `TIMEOUT` - Simulates gateway timeout
- `DUPLICATE_WEBHOOK` - Tests idempotency

### Test Mode (Real Stripe API in Test Environment)

Set in `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_51ABC...
STRIPE_MOCK_SCENARIO=  # Leave empty
```

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Full list: [Stripe Test Cards](https://stripe.com/docs/testing)

---

## Database Schema

The `payments` table supports both gateways:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  gateway VARCHAR(50) DEFAULT 'safepay',  -- 'safepay' or 'stripe'
  gateway_order_id VARCHAR(100),          -- Stripe session ID or SafePay token
  gateway_ref VARCHAR(100),               -- Payment intent ID or SafePay ref
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),             -- 'card', 'jazzcash', etc.
  webhook_received BOOLEAN DEFAULT false,
  webhook_processed_at TIMESTAMP,
  idempotency_key VARCHAR(100) UNIQUE,
  is_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security Considerations

### Webhook Signature Verification

All webhooks are verified using HMAC signatures:

```typescript
// Stripe webhook verification
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
```

**Never** process webhooks without signature verification.

### Environment Variables

- **Development**: Use test keys (sk_test_*)
- **Production**: Use live keys (sk_live_*) with restricted permissions
- **Secrets**: Store in secure vault (AWS Secrets Manager, Azure Key Vault)

### PCI Compliance

- **Never** store card numbers in your database
- Use Stripe.js/Elements to collect payment info
- Stripe handles PCI compliance for you

---

## Monitoring & Logging

### Structured Logging

All payment events are logged:

```typescript
logger.info('Payment order created', {
  paymentId: payment.id,
  userId,
  planId: plan.id,
  amount: Number(plan.price),
  gateway: 'stripe',
  isRenewal
});
```

### Stripe Dashboard

Monitor payments in real-time:
- **Dashboard** → **Payments** - View all transactions
- **Dashboard** → **Webhooks** - Monitor webhook delivery
- **Dashboard** → **Logs** - API request logs

---

## Troubleshooting

### Issue: "Cannot find module 'stripe'"

**Solution**: Run `npm install` to install dependencies.

### Issue: "Invalid webhook signature"

**Causes**:
1. Wrong `STRIPE_WEBHOOK_SECRET` in .env
2. Webhook payload modified in transit
3. Using production secret with test webhooks

**Solution**: 
- For local testing, use Stripe CLI webhook secret
- For production, get secret from Stripe Dashboard → Webhooks

### Issue: "Payment successful but membership not activated"

**Causes**:
1. Webhook not received
2. Webhook signature verification failed
3. Duplicate webhook ignored

**Solution**:
1. Check webhook logs in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check `webhook_processed_at` in database

### Issue: "Circuit breaker opened"

**Cause**: Multiple consecutive Stripe API failures

**Solution**:
1. Check Stripe API status: [status.stripe.com](https://status.stripe.com)
2. Verify network connectivity
3. Circuit breaker auto-recovers after 30 seconds

---

## Production Deployment

### Checklist

- [ ] Replace test keys with live keys
- [ ] Configure production webhook endpoint
- [ ] Set `NODE_ENV=production`
- [ ] Enable webhook signature verification
- [ ] Set up monitoring/alerting
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Test payment flow end-to-end

### Environment Variables (Production)

```bash
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_ABC...
STRIPE_PUBLISHABLE_KEY=pk_live_ABC...
STRIPE_WEBHOOK_SECRET=whsec_live_ABC...
STRIPE_MOCK_SCENARIO=  # Must be empty
```

---

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Backend Issues**: Check logs in `mumuso-backend/logs/`

---

## Appendix: Code Structure

```
mumuso-backend/
├── src/
│   ├── services/
│   │   ├── safepay.service.ts      # SafePay integration
│   │   └── stripe.service.ts       # Stripe integration (NEW)
│   ├── modules/
│   │   └── membership/
│   │       ├── membership.service.ts   # Gateway-agnostic logic
│   │       ├── membership.controller.ts # Webhook handlers
│   │       ├── membership.router.ts     # Routes
│   │       └── membership.schema.ts     # Validation schemas
│   └── config/
│       └── env.ts                  # Environment validation
└── .env.example                    # Template configuration
```

---

**Last Updated**: March 2026  
**Version**: 1.0.0
