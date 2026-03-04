# MUMUSO LOYALTY APP - API ENDPOINT AUDIT INSTRUCTIONS

> **Purpose:** This document provides step-by-step instructions for an AI assistant to audit the Mumuso Loyalty App codebase and verify that all required API endpoints have been implemented correctly.

---

## INSTRUCTIONS FOR AI ASSISTANT

You are tasked with performing a comprehensive audit of the Mumuso Loyalty App backend codebase. Your goal is to verify that **every required API endpoint** has been implemented, is properly configured, and follows the specification.

---

## STEP 1: UNDERSTAND THE PROJECT STRUCTURE

First, examine the project structure and identify:

1. **Main server file** (likely `server.js`, `index.js`, `app.js`, or `src/server.ts`)
2. **Routes directory** (likely `routes/`, `src/routes/`, or `api/`)
3. **Controllers directory** (likely `controllers/`, `src/controllers/`)
4. **Middleware directory** (likely `middleware/`, `src/middleware/`)
5. **Database/models directory** (likely `models/`, `src/models/`, or `database/`)

**Action:** List all directories and files in the project root.

---

## STEP 2: LOCATE ALL ROUTE DEFINITIONS

Search the codebase for route definitions. Routes are typically defined using Express.js patterns like:

```javascript
app.get('/api/...')
app.post('/api/...')
router.get('/...')
router.post('/...')
```

**Action:** Search for all files containing route definitions and list them.

---

## STEP 3: VERIFY EACH REQUIRED ENDPOINT

For each endpoint in the list below, verify:

1. ✅ **Endpoint EXISTS** in the codebase
2. ✅ **HTTP Method is CORRECT** (GET, POST, PATCH, DELETE)
3. ✅ **Authentication is IMPLEMENTED** (if required)
4. ✅ **Request validation EXISTS** (if endpoint accepts input)
5. ✅ **Response format MATCHES specification**
6. ✅ **Error handling is IMPLEMENTED**
7. ✅ **Database queries are PRESENT** (if endpoint reads/writes data)

---

## REQUIRED ENDPOINTS CHECKLIST

### **CATEGORY A: CBS POS INTEGRATION (3 endpoints)**

#### ✅ A.1 - Validate Membership

```
Endpoint:    POST /api/pos/validate-membership
Auth:        Bearer token (CBS_API_KEY)
Required:    CRITICAL - System cannot work without this
```

**What to verify:**

```javascript
// 1. Route definition exists
POST /api/pos/validate-membership

// 2. Authentication middleware
- Checks Authorization header
- Validates CBS_API_KEY
- Returns 401 if invalid

// 3. Request body validation
{
  member_id: string (required),
  store_id: string (required),
  cart_total: number (required),
  timestamp: string (optional)
}

// 4. Database queries
- Query memberships table by member_id
- Check status = 'active'
- Check expiry_date >= current date

// 5. Response format (SUCCESS)
{
  valid: boolean,
  member_id: string,
  member_name: string,
  member_status: string,
  discount_percentage: number,
  discount_amount: number,
  expiry_date: string,
  message: string
}

// 6. Response format (FAILURE)
{
  valid: false,
  member_status: string, // 'expired', 'not_found', etc.
  discount_percentage: 0,
  discount_amount: 0,
  message: string
}

// 7. Error handling
- Try-catch blocks
- Database error handling
- 500 response on server errors
```

**Report format:**
```
A.1 - Validate Membership:
  [✅ / ❌] Route exists
  [✅ / ❌] Authentication implemented
  [✅ / ❌] Request validation
  [✅ / ❌] Database queries present
  [✅ / ❌] Response format correct
  [✅ / ❌] Error handling
  Location: [file path and line number]
  Issues: [list any issues found]
```

---

#### ✅ A.2 - Record Transaction

```
Endpoint:    POST /api/pos/record-transaction
Auth:        Bearer token (CBS_API_KEY)
Required:    CRITICAL - Transaction data will be lost without this
```

**What to verify:**

```javascript
// 1. Route definition exists
POST /api/pos/record-transaction

// 2. Authentication middleware
- Same as A.1

// 3. Request body validation
{
  transaction_id: string (required),
  member_id: string (required),
  store_id: string (required),
  store_name: string,
  timestamp: string (required),
  original_amount: number (required),
  discount_amount: number (required),
  final_amount: number (required),
  tax_amount: number,
  payment_method: string,
  items: array,
  cashier_id: string,
  pos_terminal_id: string
}

// 4. Database operations
- INSERT into transactions table
- UPDATE memberships table (increment total_saved)
- Check for duplicate transaction_id (idempotency)

// 5. Side effects
- Send push notification to user (FCM)
- Update analytics/metrics
- Emit WebSocket event (if real-time dashboard exists)

// 6. Response format
{
  success: boolean,
  transaction_id: string,
  message: string
}

// 7. Error handling
- Duplicate transaction handling
- Database constraint violations
- Push notification failures (should not block response)
```

**Report format:**
```
A.2 - Record Transaction:
  [✅ / ❌] Route exists
  [✅ / ❌] Authentication implemented
  [✅ / ❌] Request validation
  [✅ / ❌] Idempotency check (duplicate prevention)
  [✅ / ❌] Database INSERT
  [✅ / ❌] Member savings update
  [✅ / ❌] Push notification triggered
  [✅ / ❌] Response format correct
  Location: [file path and line number]
  Issues: [list any issues found]
```

---

#### ✅ A.3 - Manual Membership Lookup

```
Endpoint:    POST /api/pos/lookup-member
Auth:        Bearer token (CBS_API_KEY)
Required:    RECOMMENDED - Fallback when QR doesn't scan
```

**What to verify:**

```javascript
// 1. Route definition exists
POST /api/pos/lookup-member

// 2. Request body accepts EITHER
{
  phone_number: string
}
// OR
{
  member_id: string
}

// 3. Database queries
- Query memberships table by phone_number OR member_id
- JOIN with users table to get name

// 4. Response format
{
  found: boolean,
  member_id: string,
  member_name: string,
  member_status: string,
  phone_number: string,
  expiry_date: string
}
```

**Report format:**
```
A.3 - Manual Membership Lookup:
  [✅ / ❌] Route exists
  [✅ / ❌] Accepts phone_number OR member_id
  [✅ / ❌] Database query
  [✅ / ❌] Response format correct
  Location: [file path and line number]
  Status: [IMPLEMENTED / MISSING / OPTIONAL]
```

---

### **CATEGORY B: MOBILE APP - AUTHENTICATION (4 endpoints)**

#### ✅ B.1 - User Registration

```
Endpoint:    POST /api/auth/register
Auth:        None (public)
Required:    CRITICAL - Users can't sign up without this
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/auth/register

// 2. Request body validation
{
  phone_number: string (required, E.164 format),
  name: string (required),
  email: string (optional),
  date_of_birth: string (optional),
  city: string (optional),
  gender: string (optional),
  password: string (required, hashed)
}

// 3. Validation checks
- Phone number format validation (Pakistani +92)
- Email format validation (if provided)
- Password strength validation (min 8 chars)
- Duplicate phone number check

// 4. Database operations
- INSERT into users table
- Hash password before storing (bcrypt, argon2)

// 5. Side effects
- Generate and send OTP
- Create session/token (optional)

// 6. Response format
{
  success: boolean,
  user_id: string,
  message: string,
  otp_sent: boolean
}

// 7. Security
- Password is NEVER stored in plain text
- Password is hashed with salt
```

**Report format:**
```
B.1 - User Registration:
  [✅ / ❌] Route exists
  [✅ / ❌] Request validation
  [✅ / ❌] Phone format validation
  [✅ / ❌] Duplicate check
  [✅ / ❌] Password hashing
  [✅ / ❌] Database INSERT
  [✅ / ❌] OTP sending
  [✅ / ❌] Response format
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

#### ✅ B.2 - Send OTP

```
Endpoint:    POST /api/auth/send-otp
Auth:        None (public)
Required:    CRITICAL - OTP verification flow depends on this
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/auth/send-otp

// 2. Request body
{
  phone_number: string (required)
}

// 3. OTP generation
- Generates random 6-digit code
- Stores in database or Redis with expiry (5 minutes)
- Associates with phone number

// 4. SMS sending
- Calls SMS gateway API (Twilio, local provider)
- Error handling if SMS fails

// 5. Rate limiting
- Max 3 OTP per phone per hour
- Prevents abuse

// 6. Response format
{
  success: boolean,
  message: string,
  expires_in: number, // seconds
  retry_after: number // seconds until can request again
}

// 7. Security
- OTP is NOT returned in response
- OTP is hashed/encrypted before storage (optional but recommended)
```

**Report format:**
```
B.2 - Send OTP:
  [✅ / ❌] Route exists
  [✅ / ❌] OTP generation (6 digits)
  [✅ / ❌] OTP storage with expiry
  [✅ / ❌] SMS gateway integration
  [✅ / ❌] Rate limiting
  [✅ / ❌] Response format
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

#### ✅ B.3 - Verify OTP

```
Endpoint:    POST /api/auth/verify-otp
Auth:        None (public)
Required:    CRITICAL - Can't complete registration without this
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/auth/verify-otp

// 2. Request body
{
  phone_number: string (required),
  otp: string (required, 6 digits)
}

// 3. Verification logic
- Retrieve stored OTP for phone_number
- Check if OTP matches
- Check if OTP is still valid (not expired)
- Increment attempt counter
- Lock after 5 failed attempts

// 4. On success
- Delete/invalidate the OTP
- Generate JWT access token
- Generate JWT refresh token
- Mark phone as verified in users table

// 5. Response format (SUCCESS)
{
  success: true,
  access_token: string,
  refresh_token: string,
  user: {
    user_id: string,
    name: string,
    phone_number: string,
    email: string,
    membership_status: string
  }
}

// 6. Response format (FAILURE)
{
  success: false,
  message: string,
  attempts_remaining: number
}

// 7. Security
- Rate limit attempts
- Clear OTP after success
- Tokens are signed with secret key
```

**Report format:**
```
B.3 - Verify OTP:
  [✅ / ❌] Route exists
  [✅ / ❌] OTP validation
  [✅ / ❌] Expiry check
  [✅ / ❌] Attempt limiting
  [✅ / ❌] JWT token generation
  [✅ / ❌] Phone verification update
  [✅ / ❌] OTP cleanup
  [✅ / ❌] Response format
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

#### ✅ B.4 - Login

```
Endpoint:    POST /api/auth/login
Auth:        None (public)
Required:    CRITICAL - Returning users can't access app
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/auth/login

// 2. Request body
{
  phone_number: string (required),
  password: string (required)
}

// 3. Authentication logic
- Query users table by phone_number
- Verify password hash matches
- Check if account is active (not banned)

// 4. Response format (SUCCESS)
{
  success: true,
  access_token: string,
  refresh_token: string,
  user: {
    user_id: string,
    name: string,
    phone_number: string,
    email: string,
    membership: {
      member_id: string,
      status: string,
      activation_date: string,
      expiry_date: string,
      total_saved: number,
      auto_renew: boolean
    }
  }
}

// 5. Response format (FAILURE)
{
  success: false,
  message: string // Generic: "Invalid credentials" (don't reveal which field)
}

// 6. Security
- Password comparison using bcrypt.compare() or similar
- Rate limiting (5 attempts per 15 minutes)
- Account lockout after 10 failed attempts
- Generic error messages (don't reveal if phone exists)
```

**Report format:**
```
B.4 - Login:
  [✅ / ❌] Route exists
  [✅ / ❌] Password verification
  [✅ / ❌] Token generation
  [✅ / ❌] Membership data included
  [✅ / ❌] Rate limiting
  [✅ / ❌] Account lockout
  [✅ / ❌] Generic error messages
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

### **CATEGORY C: MOBILE APP - USER MANAGEMENT (4 endpoints)**

#### ✅ C.1 - Get User Profile

```
Endpoint:    GET /api/user/profile
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Profile screen won't load
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/user/profile

// 2. Authentication middleware
- Validates JWT token
- Extracts user_id from token
- Returns 401 if invalid

// 3. Database queries
- Query users table
- JOIN with memberships table
- Get user preferences

// 4. Response format
{
  user_id: string,
  name: string,
  phone_number: string,
  email: string,
  date_of_birth: string,
  city: string,
  membership: {
    member_id: string,
    status: string,
    activation_date: string,
    expiry_date: string,
    days_until_expiry: number,
    total_saved: number,
    total_purchases: number,
    auto_renew: boolean,
    payment_method: object
  },
  preferences: {
    notifications_enabled: boolean,
    dark_mode: boolean,
    language: string
  }
}

// 5. Security
- User can only access their own profile
- Token validation prevents unauthorized access
```

**Report format:**
```
C.1 - Get User Profile:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Database queries
  [✅ / ❌] Membership data included
  [✅ / ❌] Response format
  Security: [Can user access other profiles?]
  Location: [file path and line number]
```

---

#### ✅ C.2 - Update User Profile

```
Endpoint:    PATCH /api/user/profile
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Users can't edit their info
```

**What to verify:**

```javascript
// 1. Route definition
PATCH /api/user/profile

// 2. Authentication
- Same as C.1

// 3. Request body (all optional except what's being updated)
{
  name: string,
  email: string,
  date_of_birth: string,
  city: string
}

// 4. Validation
- Email format if provided
- Date of birth format
- Prevent updating phone_number (require separate verification flow)

// 5. Database operation
- UPDATE users table
- WHERE user_id = authenticated user

// 6. Response format
{
  success: boolean,
  message: string,
  user: { /* updated user object */ }
}

// 7. Security
- User can only update their own profile
- Sensitive fields (phone_number, password) cannot be updated via this endpoint
```

**Report format:**
```
C.2 - Update User Profile:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Input validation
  [✅ / ❌] Database UPDATE
  [✅ / ❌] Response format
  [✅ / ❌] Prevents updating sensitive fields
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

#### ✅ C.3 - Update FCM Token

```
Endpoint:    POST /api/user/fcm-token
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Push notifications won't work
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/user/fcm-token

// 2. Request body
{
  fcm_token: string (required),
  platform: string (required), // 'ios' or 'android'
  device_id: string (optional)
}

// 3. Database operation
- UPDATE users table
- SET fcm_token = provided token
- WHERE user_id = authenticated user

// 4. Handling multiple devices
- If user logs in on multiple devices, store latest token
- OR store in separate devices table (better approach)

// 5. Response format
{
  success: boolean,
  message: string
}
```

**Report format:**
```
C.3 - Update FCM Token:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Database UPDATE
  [✅ / ❌] Response format
  Note: [How are multiple devices handled?]
  Location: [file path and line number]
```

---

#### ✅ C.4 - Refresh Token

```
Endpoint:    POST /api/auth/refresh-token
Auth:        Refresh token
Required:    RECOMMENDED - Sessions will expire frequently without this
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/auth/refresh-token

// 2. Request body
{
  refresh_token: string (required)
}

// 3. Token validation
- Verify refresh token signature
- Check if token is expired
- Check if token is blacklisted/revoked

// 4. Response
{
  success: boolean,
  access_token: string, // New access token
  refresh_token: string // New refresh token (optional: rotate)
}

// 5. Security
- Refresh tokens should have longer expiry (7-30 days)
- Access tokens should have short expiry (15 min - 1 hour)
- Implement token rotation (issue new refresh token each time)
```

**Report format:**
```
C.4 - Refresh Token:
  [✅ / ❌] Route exists
  [✅ / ❌] Token validation
  [✅ / ❌] New token generation
  [✅ / ❌] Response format
  [✅ / ⚠️ / ❌] Token rotation implemented
  Location: [file path and line number]
```

---

### **CATEGORY D: MOBILE APP - MEMBERSHIP (3 endpoints)**

#### ✅ D.1 - Get Membership Card

```
Endpoint:    GET /api/membership/card
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Card screen won't display
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/membership/card

// 2. Database query
- Query memberships table
- WHERE user_id = authenticated user
- Include status, expiry_date, member_id

// 3. Response format
{
  member_id: string,
  member_name: string,
  status: string,
  activation_date: string,
  expiry_date: string,
  qr_code_data: string, // Just the member_id
  barcode_data: string,
  total_saved: number,
  card_design: {
    background_gradient: array,
    text_color: string,
    accent_color: string
  }
}

// 4. QR code data
- Should be just the member_id: "MUM-12345"
- NOT a URL or complex JSON
- CBS POS will scan this directly
```

**Report format:**
```
D.1 - Get Membership Card:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Database query
  [✅ / ❌] QR data is simple (member_id only)
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

#### ✅ D.2 - Purchase Membership

```
Endpoint:    POST /api/membership/purchase
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Users can't buy memberships
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/membership/purchase

// 2. Request body
{
  payment_method: string (required), // 'jazzcash', 'easypaisa', 'card'
  amount: number (required), // Should be 2000
  auto_renew: boolean,
  payment_token: string // From payment gateway
}

// 3. Validation
- Amount must be exactly 2000 (membership price)
- Payment method is valid

// 4. Payment gateway integration
- Call JazzCash/EasyPaisa API
- Create payment order
- Return redirect URL or payment token

// 5. Database operations (AFTER payment confirmed)
- INSERT into payments table (status: 'pending')
- Generate unique member_id (format: MUM-XXXXX)

// 6. Response format (PENDING)
{
  success: true,
  payment_status: 'pending',
  payment_id: string,
  redirect_url: string // For mobile wallet redirect
}

// 7. IMPORTANT: Membership activation happens in webhook
- This endpoint just initiates payment
- Actual activation happens when payment gateway calls your webhook
```

**Report format:**
```
D.2 - Purchase Membership:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Amount validation (must be 2000)
  [✅ / ❌] Payment gateway integration
  [✅ / ❌] Payment record created
  [✅ / ❌] Response format
  [⚠️] NOTE: Actual activation should be in webhook, not here
  Location: [file path and line number]
```

---

#### ✅ D.3 - Cancel Auto-Renewal

```
Endpoint:    POST /api/membership/cancel-auto-renew
Auth:        Bearer token (USER JWT)
Required:    IMPORTANT - Users should be able to cancel
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/membership/cancel-auto-renew

// 2. Database operation
- UPDATE memberships table
- SET auto_renew = false
- WHERE user_id = authenticated user

// 3. Payment gateway
- If auto_renew was set up with payment gateway subscription
- Call gateway API to cancel subscription

// 4. Response format
{
  success: boolean,
  message: string,
  membership: {
    auto_renew: false,
    expiry_date: string
  }
}
```

**Report format:**
```
D.3 - Cancel Auto-Renewal:
  [✅ / ❌] Route exists
  [✅ / ❌] Database UPDATE
  [✅ / ❌] Payment gateway cancellation
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

### **CATEGORY E: MOBILE APP - TRANSACTIONS (2 endpoints)**

#### ✅ E.1 - Get Transaction History

```
Endpoint:    GET /api/transactions?page=1&limit=20&filter=last_30_days
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - History screen won't load
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/transactions

// 2. Query parameters
- page: number (default 1)
- limit: number (default 20, max 100)
- filter: string ('all', 'last_30_days', 'last_3_months')
- store_id: string (optional)

// 3. Database query
- Query transactions table
- WHERE member_id = user's member_id
- ORDER BY timestamp DESC
- Apply pagination (LIMIT, OFFSET)
- Apply date filter

// 4. Response format
{
  transactions: [
    {
      transaction_id: string,
      store_name: string,
      store_id: string,
      timestamp: string,
      original_amount: number,
      discount_amount: number,
      final_amount: number,
      items_count: number,
      items: array (optional, can be excluded from list view)
    }
  ],
  pagination: {
    current_page: number,
    total_pages: number,
    total_count: number,
    has_next: boolean
  },
  summary: {
    total_spent: number,
    total_saved: number,
    total_visits: number
  }
}

// 5. Security
- User can only see THEIR OWN transactions
- Filter by membership_id from authenticated user
```

**Report format:**
```
E.1 - Get Transaction History:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Query parameters handled
  [✅ / ❌] Pagination implemented
  [✅ / ❌] Date filtering
  [✅ / ❌] Response format with summary
  Security: [Can user see other users' transactions?]
  Location: [file path and line number]
```

---

#### ✅ E.2 - Get Transaction Detail

```
Endpoint:    GET /api/transactions/{transaction_id}
Auth:        Bearer token (USER JWT)
Required:    CRITICAL - Detail screen won't load
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/transactions/:transaction_id

// 2. Database query
- Query transactions table by transaction_id
- Verify transaction belongs to authenticated user's membership

// 3. Response format
{
  transaction_id: string,
  store_name: string,
  store_address: string,
  timestamp: string,
  original_amount: number,
  discount_amount: number,
  tax_amount: number,
  final_amount: number,
  payment_method: string,
  items: [
    {
      sku: string,
      name: string,
      quantity: number,
      unit_price: number,
      subtotal: number
    }
  ],
  receipt_url: string // PDF receipt link (optional)
}

// 4. Security
- CRITICAL: Verify transaction belongs to user
- Return 403 if user tries to access another user's transaction
```

**Report format:**
```
E.2 - Get Transaction Detail:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Ownership verification (CRITICAL)
  [✅ / ❌] Database query
  [✅ / ❌] Response format with items
  Security: [Can user access other transactions?]
  Location: [file path and line number]
```

---

### **CATEGORY F: MOBILE APP - OTHER (2 endpoints)**

#### ✅ F.1 - Get Store Locations

```
Endpoint:    GET /api/stores?city=Karachi&latitude=24.8607&longitude=67.0011
Auth:        None (public) OR Bearer token
Required:    CRITICAL - Store locator won't work
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/stores

// 2. Query parameters (all optional)
- city: string
- latitude: number
- longitude: number
- radius: number (km, default 10)

// 3. Database query
- Query stores table
- Filter by city if provided
- Calculate distance if lat/long provided
- ORDER BY distance if lat/long provided

// 4. Response format
{
  stores: [
    {
      store_id: string,
      name: string,
      address: string,
      city: string,
      latitude: number,
      longitude: number,
      distance_km: number, // if lat/long provided
      phone: string,
      opening_hours: object,
      is_active: boolean
    }
  ],
  total_count: number
}

// 5. Filtering
- Only return is_active = true stores
- Sort by distance if coordinates provided
```

**Report format:**
```
F.1 - Get Store Locations:
  [✅ / ❌] Route exists
  [✅ / ❌] City filtering
  [✅ / ❌] Distance calculation (if lat/long)
  [✅ / ❌] Active stores only
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

#### ✅ F.2 - Get Notifications

```
Endpoint:    GET /api/notifications?page=1&unread_only=false
Auth:        Bearer token (USER JWT)
Required:    IMPORTANT - Notification screen
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/notifications

// 2. Query parameters
- page: number (default 1)
- limit: number (default 20)
- unread_only: boolean (default false)

// 3. Database query
- Query notifications table
- WHERE user_id = authenticated user
- Filter by read status if unread_only=true
- ORDER BY timestamp DESC
- Pagination

// 4. Response format
{
  notifications: [
    {
      notification_id: string,
      type: string, // 'transaction', 'membership', 'promo'
      title: string,
      body: string,
      data: object,
      read: boolean,
      timestamp: string
    }
  ],
  unread_count: number
}
```

**Report format:**
```
F.2 - Get Notifications:
  [✅ / ❌] Route exists
  [✅ / ❌] JWT authentication
  [✅ / ❌] Filtering (unread_only)
  [✅ / ❌] Pagination
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

### **CATEGORY G: ADMIN DASHBOARD (6 endpoints)**

#### ✅ G.1 - Admin Login

```
Endpoint:    POST /api/admin/login
Auth:        None (public)
Required:    CRITICAL - Admins can't access dashboard
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/admin/login

// 2. Request body
{
  email: string (required),
  password: string (required)
}

// 3. Authentication
- Query admins table by email
- Verify password hash
- Check if admin account is active

// 4. Response format
{
  success: boolean,
  access_token: string,
  admin: {
    admin_id: string,
    name: string,
    email: string,
    role: string, // 'super_admin', 'admin', 'viewer'
    permissions: array
  }
}

// 5. Security
- Rate limiting (5 attempts per 15 minutes)
- Strong password requirements for admin accounts
- Separate admins table from users table
```

**Report format:**
```
G.1 - Admin Login:
  [✅ / ❌] Route exists
  [✅ / ❌] Email/password validation
  [✅ / ❌] Password hashing verification
  [✅ / ❌] JWT token generation
  [✅ / ❌] Rate limiting
  [✅ / ❌] Separate admins table
  Security issues: [list any issues]
  Location: [file path and line number]
```

---

#### ✅ G.2 - Get Analytics Dashboard

```
Endpoint:    GET /api/admin/analytics?period=last_30_days
Auth:        Bearer token (ADMIN JWT)
Required:    CRITICAL - Dashboard won't load
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/admin/analytics

// 2. Admin authentication middleware
- Validates admin JWT
- Checks admin permissions

// 3. Query parameters
- period: string ('last_7_days', 'last_30_days', 'last_3_months', 'custom')
- start_date: string (if period='custom')
- end_date: string (if period='custom')

// 4. Database aggregations
- Count total members
- Count active/expired members
- Sum total revenue
- Sum total discounts
- Calculate average transaction value
- Group transactions by date (for charts)

// 5. Response format
{
  period: string,
  start_date: string,
  end_date: string,
  metrics: {
    total_members: number,
    active_members: number,
    expired_members: number,
    new_members_this_period: number,
    total_transactions: number,
    total_revenue_without_discount: number,
    total_discount_given: number,
    total_revenue_actual: number,
    average_transaction_value: number,
    average_savings_per_member: number,
    renewal_rate: number,
    top_stores: array
  },
  charts: {
    daily_transactions: array,
    member_growth: array
  }
}

// 6. Performance
- Use database indexes
- Cache results for 30-60 seconds
```

**Report format:**
```
G.2 - Get Analytics Dashboard:
  [✅ / ❌] Route exists
  [✅ / ❌] Admin authentication
  [✅ / ❌] Date range filtering
  [✅ / ❌] All required metrics calculated
  [✅ / ❌] Chart data included
  [✅ / ❌] Response format
  [✅ / ⚠️ / ❌] Caching implemented
  Location: [file path and line number]
```

---

#### ✅ G.3 - Get All Members (Admin)

```
Endpoint:    GET /api/admin/members?page=1&status=all&search=ahmed
Auth:        Bearer token (ADMIN JWT)
Required:    CRITICAL - Member management won't work
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/admin/members

// 2. Query parameters
- page: number
- limit: number (default 50, max 100)
- status: string ('all', 'active', 'expired')
- search: string (search by name, phone, member_id)

// 3. Database query
- Query memberships table
- JOIN with users table
- Apply filters
- Pagination

// 4. Response format
{
  members: [
    {
      member_id: string,
      name: string,
      phone_number: string,
      email: string,
      status: string,
      activation_date: string,
      expiry_date: string,
      total_saved: number,
      total_purchases: number,
      auto_renew: boolean
    }
  ],
  pagination: {
    current_page: number,
    total_pages: number,
    total_count: number
  }
}
```

**Report format:**
```
G.3 - Get All Members:
  [✅ / ❌] Route exists
  [✅ / ❌] Admin authentication
  [✅ / ❌] Filtering (status, search)
  [✅ / ❌] Pagination
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

#### ✅ G.4 - Get Member Detail (Admin)

```
Endpoint:    GET /api/admin/members/{member_id}
Auth:        Bearer token (ADMIN JWT)
Required:    CRITICAL - Admin can't view member details
```

**What to verify:**

```javascript
// 1. Route definition
GET /api/admin/members/:member_id

// 2. Database queries
- Query memberships table
- JOIN with users table
- Get payment history
- Get transaction statistics
- Get recent transactions

// 3. Response format
{
  member_id: string,
  user: {
    name: string,
    phone_number: string,
    email: string,
    city: string,
    date_of_birth: string
  },
  membership: {
    status: string,
    activation_date: string,
    expiry_date: string,
    auto_renew: boolean,
    payment_history: array
  },
  statistics: {
    total_saved: number,
    total_spent: number,
    total_purchases: number,
    average_purchase: number,
    favorite_store: string,
    last_purchase_date: string
  },
  recent_transactions: array
}
```

**Report format:**
```
G.4 - Get Member Detail:
  [✅ / ❌] Route exists
  [✅ / ❌] Admin authentication
  [✅ / ❌] Complete data retrieval
  [✅ / ❌] Statistics calculated
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

#### ✅ G.5 - Manually Extend Membership (Admin)

```
Endpoint:    POST /api/admin/members/{member_id}/extend
Auth:        Bearer token (ADMIN JWT)
Required:    IMPORTANT - Customer service tool
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/admin/members/:member_id/extend

// 2. Request body
{
  extend_days: number (required),
  reason: string (required),
  admin_notes: string (optional)
}

// 3. Database operations
- UPDATE memberships table
- SET expiry_date = expiry_date + extend_days
- Log admin action in audit_log table

// 4. Response format
{
  success: boolean,
  message: string,
  new_expiry_date: string
}

// 5. Audit trail
- MUST log who extended, when, why
- Store in separate audit_log table
```

**Report format:**
```
G.5 - Manually Extend Membership:
  [✅ / ❌] Route exists
  [✅ / ❌] Admin authentication
  [✅ / ❌] Input validation
  [✅ / ❌] Database UPDATE
  [✅ / ❌] Audit logging
  [✅ / ❌] Response format
  Location: [file path and line number]
```

---

#### ✅ G.6 - Manage Stores (Admin)

```
Endpoints:   GET /api/admin/stores
             POST /api/admin/stores
             PATCH /api/admin/stores/{store_id}
             DELETE /api/admin/stores/{store_id}
Auth:        Bearer token (ADMIN JWT)
Required:    IMPORTANT - Store management
```

**What to verify for each:**

```javascript
// GET /api/admin/stores - List all stores
Response: {
  stores: array,
  total_count: number
}

// POST /api/admin/stores - Create new store
Request: {
  name: string,
  address: string,
  city: string,
  latitude: number,
  longitude: number,
  phone: string,
  opening_hours: object
}
Response: { success: boolean, store: object }

// PATCH /api/admin/stores/:store_id - Update store
Request: { /* partial store object */ }
Response: { success: boolean, store: object }

// DELETE /api/admin/stores/:store_id - Deactivate store
// Should set is_active = false, not actually delete
Response: { success: boolean }
```

**Report format:**
```
G.6 - Manage Stores:
  [✅ / ❌] GET route exists
  [✅ / ❌] POST route exists
  [✅ / ❌] PATCH route exists
  [✅ / ❌] DELETE route exists (soft delete)
  [✅ / ❌] Admin authentication on all
  [✅ / ❌] Input validation
  Location: [file path and line number]
```

---

### **CATEGORY H: PAYMENT WEBHOOKS (2 endpoints)**

#### ✅ H.1 - JazzCash Payment Webhook

```
Endpoint:    POST /api/webhooks/jazzcash
Auth:        HMAC signature verification
Required:    CRITICAL - Membership won't activate after payment
```

**What to verify:**

```javascript
// 1. Route definition
POST /api/webhooks/jazzcash

// 2. Security validation
- Verify HMAC signature from JazzCash
- Reject if signature doesn't match

// 3. Request body (JazzCash format)
// Will be in application/x-www-form-urlencoded
{
  pp_Amount: string,
  pp_TxnRefNo: string,
  pp_ResponseCode: string,
  pp_ResponseMessage: string,
  pp_SecureHash: string,
  // ... other JazzCash fields
}

// 4. Payment processing
- Find pending payment by pp_TxnRefNo
- Check pp_ResponseCode == "000" (success)
- Update payment status to 'completed'
- ACTIVATE MEMBERSHIP (this is critical)
  - INSERT into memberships table
  - SET status = 'active'
  - SET activation_date = now
  - SET expiry_date = now + 1 year
  - Generate member_id

// 5. Side effects
- Send push notification: "Membership activated!"
- Send email confirmation
- Update analytics

// 6. Response
- JazzCash expects HTTP 200 OK
- Body doesn't matter, just status code

// 7. Idempotency
- If webhook called twice (network retry)
- Should not create duplicate membership
- Check if payment already processed
```

**Report format:**
```
H.1 - JazzCash Webhook:
  [✅ / ❌] Route exists
  [✅ / ❌] HMAC signature verification
  [✅ / ❌] Payment record update
  [✅ / ❌] Membership activation logic
  [✅ / ❌] Member ID generation
  [✅ / ❌] Push notification sent
  [✅ / ❌] Idempotency handling
  [⚠️] CRITICAL: This is where membership gets activated
  Location: [file path and line number]
```

---

#### ✅ H.2 - EasyPaisa Payment Webhook

```
Endpoint:    POST /api/webhooks/easypaisa
Auth:        Signature verification
Required:    CRITICAL - Membership won't activate
```

**What to verify:**

```javascript
// Same verification as H.1, but for EasyPaisa format

// Request body (JSON)
{
  orderId: string,
  transactionId: string,
  amount: number,
  status: string,
  signature: string
}

// Logic is identical to JazzCash webhook
// Just different field names and signature verification method
```

**Report format:**
```
H.2 - EasyPaisa Webhook:
  [✅ / ❌] Route exists
  [✅ / ❌] Signature verification
  [✅ / ❌] Payment record update
  [✅ / ❌] Membership activation logic
  [✅ / ❌] Idempotency handling
  Location: [file path and line number]
```

---

## STEP 4: VERIFY AUTHENTICATION MIDDLEWARE

Authentication middleware is critical. Check that it exists and is applied correctly.

**What to verify:**

```javascript
// 1. CBS API Key middleware
function cbsAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CBS_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Applied to: A.1, A.2, A.3

// 2. User JWT middleware
function userAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  // Verify JWT
  // Extract user_id
  // Attach to req.user
  next();
}

// Applied to: C.1, C.2, C.3, D.1, D.2, D.3, E.1, E.2, F.2

// 3. Admin JWT middleware
function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  // Verify admin JWT
  // Check admin permissions
  // Attach to req.admin
  next();
}

// Applied to: G.1, G.2, G.3, G.4, G.5, G.6
```

**Report format:**
```
AUTHENTICATION MIDDLEWARE:
  [✅ / ❌] CBS API Key middleware exists
  [✅ / ❌] User JWT middleware exists
  [✅ / ❌] Admin JWT middleware exists
  [✅ / ❌] Middlewares are applied to correct routes
  Location: [file paths]
```

---

## STEP 5: VERIFY DATABASE SCHEMA

Check that all required tables exist with correct columns.

**Tables to verify:**

```sql
-- Users table
users (
  user_id, phone_number (unique), name, email,
  password_hash, date_of_birth, city, gender,
  fcm_token, created_at, updated_at
)

-- Memberships table
memberships (
  membership_id, user_id (FK), member_id (unique),
  status, activation_date, expiry_date,
  auto_renew, total_saved, total_purchases,
  created_at, updated_at
)

-- Transactions table
transactions (
  transaction_id (unique), member_id,
  store_id, store_name, timestamp,
  original_amount, discount_amount, final_amount,
  tax_amount, payment_method, items (JSON),
  cashier_id, pos_terminal_id, created_at
)

-- Payments table
payments (
  payment_id, user_id (FK), amount,
  payment_method, gateway_transaction_id,
  status, created_at, updated_at
)

-- Stores table
stores (
  store_id, name, address, city,
  latitude, longitude, phone,
  opening_hours (JSON), is_active,
  created_at, updated_at
)

-- Admins table
admins (
  admin_id, user_id (FK), email,
  password_hash, role, permissions (JSON),
  created_at, updated_at
)

-- Notifications table
notifications (
  notification_id, user_id (FK),
  type, title, body, data (JSON),
  read, created_at
)

-- Audit log table (optional but recommended)
audit_log (
  log_id, admin_id, action,
  entity_type, entity_id, details (JSON),
  created_at
)
```

**Report format:**
```
DATABASE SCHEMA:
  [✅ / ❌] users table exists with all columns
  [✅ / ❌] memberships table exists
  [✅ / ❌] transactions table exists
  [✅ / ❌] payments table exists
  [✅ / ❌] stores table exists
  [✅ / ❌] admins table exists
  [✅ / ❌] notifications table exists
  [✅ / ⚠️ / ❌] audit_log table exists
  [✅ / ❌] Proper indexes on frequently queried columns
  Missing tables: [list]
  Missing columns: [list]
```

---

## STEP 6: VERIFY ENVIRONMENT VARIABLES

Check that all required environment variables are documented.

**Required variables:**

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...

# Authentication
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CBS_API_KEY=...

# Payment Gateways
JAZZCASH_MERCHANT_ID=...
JAZZCASH_PASSWORD=...
JAZZCASH_INTEGRITY_SALT=...
EASYPAISA_STORE_ID=...
EASYPAISA_SECRET=...

# SMS Gateway
SMS_GATEWAY_API_KEY=...
SMS_SENDER_ID=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Other
NODE_ENV=production
PORT=3000
```

**Report format:**
```
ENVIRONMENT VARIABLES:
  [✅ / ❌] .env.example file exists
  [✅ / ❌] All required variables documented
  Missing variables: [list]
```

---

## STEP 7: CHECK ERROR HANDLING

Verify that endpoints have proper error handling.

**What to check:**

```javascript
// 1. Try-catch blocks
try {
  // database operations
} catch (error) {
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}

// 2. Input validation errors
if (!phone_number) {
  return res.status(400).json({ error: 'Phone number is required' });
}

// 3. Database constraint errors
// Duplicate phone number, foreign key violations, etc.

// 4. Authentication errors
// 401 for invalid/missing tokens

// 5. Authorization errors
// 403 for accessing resources user doesn't own
```

**Report format:**
```
ERROR HANDLING:
  [✅ / ❌] Try-catch blocks in all endpoints
  [✅ / ❌] Input validation errors
  [✅ / ❌] Database errors handled
  [✅ / ❌] Authentication errors (401)
  [✅ / ❌] Authorization errors (403)
  Endpoints with poor error handling: [list]
```

---

## STEP 8: VERIFY SECURITY MEASURES

Check for common security issues.

**Security checklist:**

```
[✅ / ❌] Passwords are hashed (never stored plain text)
[✅ / ❌] Rate limiting on auth endpoints
[✅ / ❌] CORS configured properly
[✅ / ❌] Helmet.js or security headers configured
[✅ / ❌] SQL injection prevention (using parameterized queries)
[✅ / ❌] XSS prevention
[✅ / ❌] CSRF protection (if applicable)
[✅ / ❌] Sensitive data not logged
[✅ / ❌] Environment variables not committed to git
[✅ / ❌] HTTPS enforced (production)
[✅ / ❌] Input sanitization
[✅ / ❌] JWT tokens have expiry
[✅ / ❌] User can only access own data
```

---

## STEP 9: GENERATE FINAL AUDIT REPORT

After completing all checks, generate a comprehensive report.

**Report structure:**

```markdown
# MUMUSO LOYALTY APP - API AUDIT REPORT

**Date:** [Current date]
**Auditor:** [AI Assistant Name/Version]
**Codebase Version:** [Git commit hash or version]

---

## EXECUTIVE SUMMARY

Total endpoints required: 26
Total endpoints found: X
Total endpoints missing: Y
Critical issues: Z

**Overall Status:** [PASS / FAIL / NEEDS WORK]

---

## DETAILED FINDINGS

### Category A: CBS POS Integration (3 endpoints)

#### A.1 - Validate Membership
Status: [✅ IMPLEMENTED / ❌ MISSING / ⚠️ INCOMPLETE]
Location: [file:line]
Issues: [list issues]

#### A.2 - Record Transaction
...

[Continue for all endpoints]

---

## CRITICAL ISSUES (Must Fix Before Launch)

1. [Issue description]
   - Impact: [what breaks if not fixed]
   - Location: [file:line]
   - Recommendation: [how to fix]

---

## HIGH PRIORITY ISSUES (Should Fix Soon)

[List issues]

---

## MEDIUM PRIORITY ISSUES (Fix When Possible)

[List issues]

---

## LOW PRIORITY ISSUES (Nice to Have)

[List issues]

---

## MISSING ENDPOINTS

[List any endpoints that don't exist at all]

---

## SECURITY CONCERNS

[List security issues found]

---

## RECOMMENDATIONS

1. [Recommendation]
2. [Recommendation]
...

---

## CONCLUSION

[Overall assessment of the codebase]
[Is it ready for production?]
[What's the estimated time to fix critical issues?]
```

---

## STEP 10: OUTPUT FORMAT

Provide the audit report in the following formats:

1. **Markdown file** (detailed report as above)
2. **Summary table** (quick overview)
3. **JSON file** (machine-readable for tracking)

**Summary table example:**

```
┌──────────────────────────────────┬────────┬──────────────┐
│ Endpoint                         │ Status │ Critical?    │
├──────────────────────────────────┼────────┼──────────────┤
│ POST /api/pos/validate-membership│   ✅   │     YES      │
│ POST /api/pos/record-transaction │   ✅   │     YES      │
│ POST /api/auth/register          │   ⚠️   │     YES      │
│ POST /api/auth/send-otp          │   ✅   │     YES      │
│ ...                              │   ...  │     ...      │
└──────────────────────────────────┴────────┴──────────────┘

Legend:
  ✅ = Fully implemented and verified
  ⚠️ = Implemented but has issues
  ❌ = Missing or not found
```

---

## SPECIAL INSTRUCTIONS

### High Priority Verification

Pay extra attention to these endpoints (critical for system to work):

1. **POST /api/pos/validate-membership** - System breaks without this
2. **POST /api/pos/record-transaction** - Data loss without this
3. **POST /api/webhooks/jazzcash** - Memberships won't activate
4. **POST /api/webhooks/easypaisa** - Memberships won't activate
5. **POST /api/auth/register** - Users can't sign up
6. **POST /api/auth/verify-otp** - Users can't complete registration
7. **GET /api/membership/card** - Card screen won't work
8. **POST /api/membership/purchase** - Users can't buy memberships

### Security Critical Checks

Verify these security measures are in place:

1. **Password hashing** - NEVER store passwords in plain text
2. **JWT token validation** - Users can't access other users' data
3. **CBS API key validation** - Only CBS can call POS endpoints
4. **HMAC signature verification** - Payment webhooks are authentic
5. **Rate limiting** - Prevent brute force attacks
6. **Input validation** - Prevent SQL injection

### Performance Checks

Check for these performance optimizations:

1. **Database indexes** on frequently queried columns
2. **Pagination** on list endpoints
3. **Caching** on analytics endpoints (optional but recommended)
4. **Connection pooling** for database

---

## COMPLETION CHECKLIST

Before submitting the audit report, ensure you have:

- [ ] Checked all 26 required endpoints
- [ ] Verified authentication on protected routes
- [ ] Checked database schema
- [ ] Verified environment variables
- [ ] Reviewed error handling
- [ ] Assessed security measures
- [ ] Generated detailed report
- [ ] Created summary table
- [ ] Listed all critical issues
- [ ] Provided fix recommendations

---

## EXAMPLE USAGE

**Prompt to give to AI:**

```
Please audit the Mumuso Loyalty App backend codebase located at [repository URL or local path].

Follow the instructions in the file "API_AUDIT_INSTRUCTIONS.md" exactly.

Generate a comprehensive audit report covering:
1. All 26 required API endpoints
2. Authentication and security
3. Database schema
4. Error handling
5. Critical issues that must be fixed before launch

Provide the report in markdown format with a summary table.
```

---

**END OF AUDIT INSTRUCTIONS**
