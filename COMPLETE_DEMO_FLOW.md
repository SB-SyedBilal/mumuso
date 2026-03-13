# MUMUSO COMPLETE DEMO FLOW
## End-to-End Customer Journey with Stripe Payment

This document outlines the **complete demo flow** showing how a customer purchases a membership, pays with Stripe, and then uses it at a physical store POS terminal.

---

## 🎯 Demo Components

### 1. **Mobile App** (React Native)
- Customer-facing loyalty app
- Membership purchase & payment
- QR code display
- Transaction history

### 2. **Backend API** (Node.js + Express)
- Payment processing (Stripe/SafePay)
- Membership management
- POS validation endpoints
- Real-time webhooks

### 3. **Mock POS Terminal** (Next.js Web App)
- Simulates cashier terminal
- Validates memberships
- Records transactions
- Real-time sync with admin dashboard

### 4. **Admin Dashboard** (Next.js)
- View all members
- Monitor transactions
- Manage stores & discounts
- Real-time updates

---

## 📱 Complete Customer Journey

### **Phase 1: Customer Purchases Membership**

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP                                │
│                                                              │
│  1. Customer opens Mumuso app                               │
│  2. Navigates to "Membership Plans"                         │
│  3. Selects annual plan (Rs. 2,999)                         │
│  4. Chooses payment gateway: "Stripe"                       │
│  5. Taps "Purchase Membership"                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/v1/membership/create-order
                       │ { "plan_id": "uuid", "gateway": "stripe" }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│                                                              │
│  1. Creates payment record in database                      │
│  2. Calls Stripe API to create checkout session            │
│  3. Returns session ID + client secret                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Response:
                       │ {
                       │   "gateway_token": "cs_test_abc123...",
                       │   "client_secret": "cs_test_secret_xyz...",
                       │   "amount": 2999,
                       │   "expiry": 1800
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP                                │
│                                                              │
│  6. Redirects to Stripe checkout                            │
│  7. Customer enters card details                            │
│     - Test card: 4242 4242 4242 4242                        │
│     - Expiry: Any future date                               │
│     - CVC: Any 3 digits                                     │
│  8. Completes payment                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Stripe processes payment
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRIPE                                    │
│                                                              │
│  1. Processes card payment                                  │
│  2. Sends webhook to backend                                │
│     POST /api/v1/membership/webhook/stripe                  │
│     Event: checkout.session.completed                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│                                                              │
│  1. Verifies webhook signature                              │
│  2. Updates payment status to "completed"                   │
│  3. Creates/activates membership                            │
│     - Generates member ID: MUM-12345                        │
│     - Sets expiry date: +365 days                           │
│  4. Sends push notification to customer                     │
│     "Welcome to Mumuso! Your membership is active"          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP                                │
│                                                              │
│  9. Receives notification                                   │
│  10. Shows success screen                                   │
│  11. Displays QR code with member ID                        │
│  12. Customer can now use membership at stores              │
└─────────────────────────────────────────────────────────────┘
```

---

### **Phase 2: Customer Shops at Store**

```
┌─────────────────────────────────────────────────────────────┐
│                    PHYSICAL STORE                            │
│                                                              │
│  1. Customer shops and brings items to cashier              │
│  2. Cashier scans items (Rs. 2,500 total)                  │
│  3. Customer shows QR code from mobile app                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOCK POS TERMINAL                         │
│                    (Web Interface)                           │
│                                                              │
│  1. Cashier enters cart items:                              │
│     - Water Bottle: 2 × Rs. 300 = Rs. 600                  │
│     - Notebook Set: 1 × Rs. 1,900 = Rs. 1,900              │
│     - Subtotal: Rs. 2,500                                   │
│                                                              │
│  2. Cashier scans/enters member ID: MUM-12345               │
│  3. Clicks "Validate Member"                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/v1/pos/validate-membership
                       │ {
                       │   "member_id": "MUM-12345",
                       │   "store_id": "STORE-001",
                       │   "cart_total": 2500,
                       │   "timestamp": "2026-03-13T14:30:00Z"
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│                                                              │
│  1. Looks up membership by member_id                        │
│  2. Checks status (active/expired/suspended)                │
│  3. Gets store discount percentage (10%)                    │
│  4. Calculates discount: Rs. 2,500 × 10% = Rs. 250         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Response:
                       │ {
                       │   "valid": true,
                       │   "member_name": "Ahmed Khan",
                       │   "discount_percentage": 10,
                       │   "discount_amount": 250,
                       │   "expiry_date": "2027-03-13",
                       │   "message": "Discount applied successfully"
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOCK POS TERMINAL                         │
│                                                              │
│  4. Shows validation result:                                │
│     ✅ Valid Membership                                     │
│     Member: Ahmed Khan                                      │
│     Discount: 10%                                           │
│     Valid Until: 13/03/2027                                 │
│                                                              │
│  5. Order Summary updates:                                  │
│     Subtotal:    Rs. 2,500                                  │
│     Discount:   -Rs. 250 (10%)                              │
│     Tax (15%):  +Rs. 337.50                                 │
│     ─────────────────────                                   │
│     Total:       Rs. 2,587.50                               │
│                                                              │
│  6. Cashier selects payment method: Cash                    │
│  7. Clicks "Complete Purchase"                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/v1/pos/record-transaction
                       │ {
                       │   "transaction_id": "TXN-20260313-001234",
                       │   "member_id": "MUM-12345",
                       │   "store_id": "STORE-001",
                       │   "original_amount": 2500,
                       │   "discount_amount": 250,
                       │   "final_amount": 2587.50,
                       │   "payment_method": "cash",
                       │   "items": [...]
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│                                                              │
│  1. Creates transaction record in database                  │
│  2. Sends push notification to customer                     │
│     "Purchase complete! You saved Rs. 250"                  │
│  3. Updates admin dashboard in real-time                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Response:
                       │ {
                       │   "success": true,
                       │   "transaction_id": "TXN-20260313-001234",
                       │   "message": "Transaction recorded"
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOCK POS TERMINAL                         │
│                                                              │
│  8. Shows success message                                   │
│  9. Adds transaction to history                             │
│  10. Resets for next customer                               │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP                                │
│                                                              │
│  Customer receives notification:                            │
│  "Purchase complete! You saved Rs. 250"                     │
│                                                              │
│  Transaction appears in app history:                        │
│  - Store: Dolmen Mall Clifton                               │
│  - Date: 13 Mar 2026, 2:30 PM                              │
│  - Amount: Rs. 2,587.50                                     │
│  - Saved: Rs. 250                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Setup

### **1. Backend Setup**

```bash
cd mumuso-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Add Stripe test keys
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Add POS demo API key
POS_DEMO_API_KEY=demo-pos-api-key-12345

# Run database migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start server
npm run dev
```

### **2. Mobile App Setup**

```bash
cd mumuso-app

# Install dependencies
npm install

# Configure API endpoint
# Edit src/config/index.ts
API_BASE_URL=http://localhost:3000/api/v1

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### **3. Mock POS Terminal Setup**

```bash
# Create Next.js app (following Mumuso_Mock_POS_Specification.md)
npx create-next-app@latest mumuso-pos --typescript --tailwind --app

cd mumuso-pos

# Install dependencies
npm install lucide-react axios

# Configure environment
# Create .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_POS_API_KEY=demo-pos-api-key-12345

# Start development server
npm run dev
```

---

## 📊 API Endpoints Reference

### **Customer Endpoints (Mobile App)**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/register` | None | Register new user |
| POST | `/api/v1/auth/login` | None | Login user |
| GET | `/api/v1/membership/plans` | JWT | List membership plans |
| POST | `/api/v1/membership/create-order` | JWT | Create payment order |
| POST | `/api/v1/membership/webhook/stripe` | Signature | Stripe webhook |
| GET | `/api/v1/member/profile` | JWT | Get member profile |
| GET | `/api/v1/member/qr-token` | JWT | Get QR code token |
| GET | `/api/v1/transactions/history` | JWT | Transaction history |

### **POS Endpoints (Mock Terminal)**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/pos/stores` | API Key | List all stores |
| POST | `/api/v1/pos/validate-membership` | API Key | Validate member |
| POST | `/api/v1/pos/record-transaction` | API Key | Record transaction |

**API Key Header:**
```
Authorization: Bearer demo-pos-api-key-12345
```

---

## 🎬 Demo Script

### **For Client Presentation**

**1. Show Mobile App (5 minutes)**
- Open app, show login/register
- Navigate to membership plans
- Select plan, choose Stripe payment
- Complete payment with test card
- Show success screen with QR code

**2. Show Backend Logs (2 minutes)**
- Terminal showing webhook received
- Membership activated log
- Push notification sent

**3. Show POS Terminal (5 minutes)**
- Open Mock POS web interface
- Select store from dropdown
- Add items to cart
- Scan/enter member ID
- Show validation result
- Complete purchase
- Show transaction in history

**4. Show Mobile App Again (2 minutes)**
- Notification received
- Transaction appears in history
- Savings displayed

**5. Show Admin Dashboard (3 minutes)**
- Real-time transaction appears
- Member details updated
- Analytics updated

---

## 🧪 Test Scenarios

### **Scenario 1: Happy Path**
- ✅ New customer registers
- ✅ Purchases membership with Stripe
- ✅ Uses membership at store
- ✅ Receives discount and notification

### **Scenario 2: Expired Membership**
- ❌ Member ID validated at POS
- ❌ Shows "Membership expired"
- ℹ️ Prompts customer to renew

### **Scenario 3: Invalid Member ID**
- ❌ Member ID not found
- ℹ️ Shows error message

### **Scenario 4: Multiple Transactions**
- ✅ Same member shops multiple times
- ✅ All transactions recorded
- ✅ History shows all purchases

---

## 🔐 Security Notes

### **Demo Environment**
- Uses Stripe **test mode** (sk_test_*)
- POS API key is hardcoded for demo
- No real money processed
- Safe for client demonstrations

### **Production Considerations**
- Replace with live Stripe keys
- Implement proper POS authentication
- Add rate limiting per terminal
- Enable audit logging
- Use HTTPS only

---

## 📈 Metrics to Show Client

### **Real-time Dashboard**
- Total members: 1,234
- Active memberships: 987
- Transactions today: 156
- Total savings: Rs. 45,678

### **Transaction Details**
- Average discount: Rs. 250
- Most popular store: Dolmen Mall Clifton
- Peak hours: 2 PM - 6 PM
- Payment methods: 60% cash, 40% card

---

## 🎯 Key Demo Points

### **For Client**
1. **Seamless Payment** - Stripe test mode works perfectly
2. **Real-time Sync** - Instant validation at POS
3. **Customer Experience** - Simple QR code, instant savings
4. **Store Integration** - Easy for cashiers to use
5. **Admin Visibility** - Complete transaction tracking

### **Technical Highlights**
1. **Webhook Integration** - Automatic membership activation
2. **API Architecture** - Clean, RESTful endpoints
3. **Security** - Signature verification, API keys
4. **Scalability** - Ready for production deployment
5. **Monitoring** - Structured logging, metrics

---

## 📞 Support

**Backend API:** http://localhost:3000  
**Mock POS:** http://localhost:3001  
**Admin Dashboard:** http://localhost:3002  
**Mobile App:** iOS Simulator / Android Emulator

**Documentation:**
- `STRIPE_INTEGRATION_GUIDE.md` - Stripe setup
- `Mumuso_Mock_POS_Specification.md` - POS terminal spec
- `BACKEND_SETUP_GUIDE.md` - Backend setup
- `API_DOCUMENTATION.md` - API reference

---

**Demo Ready!** 🚀
