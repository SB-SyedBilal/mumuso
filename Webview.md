# MUMUSO LOYALTY APP - ADMIN DASHBOARD SPECIFICATION

You are designing and implementing a responsive web-based Admin Dashboard for the Mumuso Loyalty App backend.

---

## 0. CONTEXT & BRAND IDENTITY

### Business Context
- **Brand:** Mumuso Pakistan - Premium retail loyalty program
- **Membership Model:** Paid membership (Rs. 2,000/year) with 10% discount at all stores
- **Audience:** Mumuso HQ staff, store managers, customer support team
- **Devices:** Desktop-first (1920×1080 primary), tablet fallback (1024×768 minimum)
- **Region:** Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad)

### Design Philosophy: "Quiet Luxury Admin"

**Reference Document:** Use the Mumuso UI Design Specification (v3.0) as the foundation.

**Color Palette:**
- Canvas: `#F5F3F0` (warm off-white background)
- Surface: `#FFFFFF` (card backgrounds)
- Surface Dark: `#1C1C1E` (navigation sidebar, headers)
- Text Primary: `#1A1A1A` (main text)
- Text Secondary: `#6B6B6B` (supporting text)
- **Accent Gold:** `#C8A96E` (primary accent - use sparingly)
- Success: `#4A9B7F` (active members, positive metrics)
- Error: `#C0544A` (expired, suspended, alerts)
- Warning: `#C08040` (expiring soon, needs attention)

**Typography:**
- Display: Cormorant Garamond (for large numbers, hero metrics)
- UI: DM Sans (all interface text, tables, forms)
- Data: JetBrains Mono (member IDs, transaction IDs, amounts)

**DO NOT use:**
- Generic purple/blue admin themes
- Bright gradients or neon colors
- Comic Sans or unprofessional fonts
- Material UI default theme colors

**DO use:**
- Subtle shadows (0 2px 8px rgba(0,0,0,0.06))
- 20px border-radius on cards
- 8pt spacing grid (4, 8, 16, 24, 32, 48px)
- Warm neutral backgrounds, not cold grays

---

## 1. TECH STACK

### Frontend Framework
- **Primary:** Next.js 14+ (App Router, TypeScript, React Server Components where applicable)
- **Alternative:** Vite + React 18 + TypeScript (if Next.js is overkill)

### Required Libraries
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "axios": "^1.6.0",
    "react-query": "^5.0.0",
    "socket.io-client": "^4.6.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "sonner": "^1.2.0",
    "lucide-react": "^0.294.0"
  }
}
```

### State Management
- **Auth State:** Zustand (global auth store)
- **Server State:** React Query (API caching, refetching)
- **Form State:** React Hook Form + Zod validation
- **UI State:** React useState/useReducer (modals, drawers, filters)

### Styling
- **Primary:** TailwindCSS 3+ with custom Mumuso theme
- **Components:** Headless UI or Radix UI (accessible primitives)
- **Icons:** Lucide React (outlined style, consistent with mobile app)

---

## 2. BACKEND API SPECIFICATION

**IMPORTANT:** These are the ACTUAL endpoints you must integrate with.

### Base URLs
```
Authentication:  /api/auth/*
Admin APIs:      /api/admin/*
Public APIs:     /api/stores (no auth for guest store locator)
```

### Authentication Flow

#### 2.1. Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

Request:
{
  "email": "admin@mumuso.com",
  "password": "hashed_password"
}

Response (Success):
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "admin_id": "adm_001",
    "name": "Admin User",
    "email": "admin@mumuso.com",
    "role": "super_admin",
    "permissions": ["view_analytics", "manage_users", "manage_stores", "export_data"]
  }
}

Response (Failure):
{
  "success": false,
  "message": "Invalid email or password"
}
```

**UI Requirements:**
- Clean login page with Mumuso branding
- Email + password fields
- "Remember me" checkbox (stores refresh token)
- Forgot password link (opens modal to request reset email)
- Show password toggle (eye icon)
- Loading state on submit
- Error message display (red banner above form)

---

#### 2.2. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

Request:
{
  "refresh_token": "stored_refresh_token"
}

Response:
{
  "success": true,
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

**Implementation:**
- Axios interceptor checks for 401 responses
- Automatically calls refresh endpoint
- Retries original request with new token
- Redirects to login if refresh fails

---

### Dashboard APIs

#### 2.3. Get Dashboard Metrics
```http
GET /api/admin/analytics?period={today|week|month|year|all}
Authorization: Bearer {access_token}

Response:
{
  "period": "last_30_days",
  "start_date": "2026-02-03",
  "end_date": "2026-03-05",
  "metrics": {
    "total_members": 5234,
    "active_members": 4892,
    "expired_members": 342,
    "suspended_members": 12,
    "expiring_in_30_days": 287,
    "expiring_in_7_days": 45,
    "new_members_this_period": 287,
    "renewal_rate": 78.5,
    "auto_renew_enabled": 3456,
    
    "total_transactions": 12450,
    "total_transactions_this_period": 3421,
    "total_revenue_without_discount": 3125000.00,
    "total_discount_given": 312500.00,
    "total_revenue_actual": 2812500.00,
    "average_transaction_value": 250.80,
    "average_savings_per_member": 638.42,
    
    "total_stores": 52,
    "active_stores": 50,
    "stores_with_recent_activity": 48,
    
    "top_stores": [
      {
        "store_id": "STORE-003",
        "store_name": "Dolmen Mall Clifton",
        "city": "Karachi",
        "transaction_count": 1234,
        "total_discount_given": 123400.00,
        "revenue": 308500.00,
        "last_transaction": "2026-03-05T14:30:00Z"
      }
    ]
  },
  "charts": {
    "daily_transactions": [
      { "date": "2026-02-03", "count": 156, "revenue": 39000.00, "discount": 3900.00 },
      { "date": "2026-02-04", "count": 178, "revenue": 44500.00, "discount": 4450.00 }
    ],
    "member_growth": [
      { "month": "2025-03", "new": 120, "churned": 8, "net": 112 },
      { "month": "2025-04", "new": 145, "churned": 12, "net": 133 }
    ]
  },
  "recent_transactions": [
    {
      "transaction_id": "TXN-20260305-001234",
      "member_id": "MUM-12345",
      "member_name": "Ahmed Khan",
      "store_name": "Dolmen Mall Clifton",
      "store_id": "STORE-003",
      "discount_amount": 250.00,
      "final_amount": 2250.00,
      "timestamp": "2026-03-05T14:35:22Z"
    }
  ],
  "system_health": {
    "pos_integration": "operational",
    "payment_gateway": "operational",
    "database": "operational",
    "last_transaction": "2026-03-05T14:35:22Z"
  }
}
```

**UI Requirements:**

**Top KPI Cards (4 cards in a row):**
1. **Total Members**
   - Large number: 5,234 (Cormorant Garamond 48px)
   - Label: "Total Members"
   - Sub-text: "+12% this month" (green if positive, red if negative)
   - Icon: Users (lucide-react)

2. **Active Members**
   - Number: 4,892
   - Label: "Active Memberships"
   - Sub-text: "93.5% active rate"
   - Badge: 287 expiring soon (warning color)

3. **Total Revenue**
   - Number: Rs. 2,812,500 (formatted with commas)
   - Label: "Revenue (This Month)"
   - Sub-text: "+15% vs last month"

4. **Total Discounts**
   - Number: Rs. 312,500
   - Label: "Member Savings"
   - Sub-text: "10% avg discount"

**Period Selector:**
- Chip buttons: Today | This Week | This Month | This Year | All Time
- Active chip: gold background (#C8A96E)
- Inactive: transparent with border
- On click: refetch analytics with new period

**Charts Section (2 columns):**

**Left Column - Revenue Trend:**
- Line chart (Recharts)
- X-axis: dates
- Y-axis: revenue
- 2 lines: Revenue (without discount) vs Actual Revenue
- Tooltip shows date, both values, discount amount

**Right Column - Member Growth:**
- Bar chart
- X-axis: months
- Y-axis: member count
- Stacked bars: New (green), Churned (red)
- Net growth line overlay

**Recent Transactions Table:**
- Last 10 transactions
- Columns: Member Name | Store | Discount | Amount | Time
- Row hover: slight background change
- Click row: opens transaction detail modal

**System Health Banner:**
- Green banner if all systems operational
- Yellow if any degraded
- Red if any down
- Shows: "All systems operational" or "Payment gateway degraded"

---

#### 2.4. Get All Members
```http
GET /api/admin/members?page=1&limit=50&status=all&search=ahmed&sort_by=created_at&sort_order=desc
Authorization: Bearer {access_token}

Query Parameters:
- page: number (default 1)
- limit: number (default 50, max 100)
- status: 'all' | 'active' | 'expired' | 'suspended'
- search: string (searches name, phone, email, member_id)
- sort_by: 'name' | 'created_at' | 'expiry_date' | 'total_saved'
- sort_order: 'asc' | 'desc'

Response:
{
  "members": [
    {
      "member_id": "MUM-12345",
      "user_id": "usr_abc123",
      "name": "Ahmed Khan",
      "phone_number": "+923001234567",
      "email": "ahmed@example.com",
      "status": "active",
      "plan": "Annual",
      "activation_date": "2025-03-01",
      "expiry_date": "2026-03-01",
      "days_remaining": 362,
      "auto_renew": true,
      "total_saved": 1250.00,
      "total_spent": 12500.00,
      "transaction_count": 15,
      "last_transaction_date": "2026-03-04",
      "city": "Karachi",
      "joined_at": "2025-02-28T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 105,
    "total_count": 5234,
    "per_page": 50,
    "has_next": true,
    "has_previous": false
  }
}
```

**UI Requirements:**

**Filter Panel (collapsible sidebar or top bar):**
- Search input (debounced, searches as you type)
- Status dropdown: All | Active | Expired | Suspended
- Sort dropdown: Name | Join Date | Expiry Date | Total Saved
- Order toggle: Ascending / Descending
- Clear filters button

**Members Table:**
- Sticky header
- Columns:
  1. Member ID (JetBrains Mono)
  2. Name + Email (stacked, name bold)
  3. Phone
  4. Status (pill badge: green=active, red=expired, gray=suspended)
  5. Expiry Date
  6. Days Left (progress ring if <30 days)
  7. Transactions (count)
  8. Total Saved (Rs. formatted)
  9. Actions (eye icon = View Detail)
- Zebra striping (alternating row colors)
- Row hover: slight gold tint
- Empty state: "No members found" with illustration

**Pagination:**
- Page size selector: 20 | 50 | 100
- Previous / Next buttons
- Page number input (jump to page)
- Total count display: "Showing 1-50 of 5,234"

**Skeleton Loading:**
- Show 10 skeleton rows while fetching
- Shimmer animation

---

#### 2.5. Get Member Detail
```http
GET /api/admin/members/{member_id}
Authorization: Bearer {access_token}

Response:
{
  "member_id": "MUM-12345",
  "user": {
    "user_id": "usr_abc123",
    "name": "Ahmed Khan",
    "phone_number": "+923001234567",
    "email": "ahmed@example.com",
    "city": "Karachi",
    "date_of_birth": "1995-06-15",
    "gender": "male",
    "joined_at": "2025-02-28T10:30:00Z"
  },
  "membership": {
    "status": "active",
    "plan": "Annual",
    "activation_date": "2025-03-01",
    "expiry_date": "2026-03-01",
    "days_remaining": 362,
    "auto_renew": true,
    "payment_history": [
      {
        "payment_id": "pay_xyz789",
        "amount": 2000.00,
        "payment_method": "jazzcash",
        "status": "completed",
        "date": "2025-03-01T09:15:00Z"
      }
    ]
  },
  "statistics": {
    "total_saved": 1250.00,
    "total_spent": 12500.00,
    "total_purchases": 15,
    "average_purchase": 833.33,
    "favorite_store": "Dolmen Mall Clifton",
    "last_purchase_date": "2026-03-04"
  },
  "recent_transactions": [
    {
      "transaction_id": "TXN-20260304-001234",
      "store_name": "Dolmen Mall Clifton",
      "store_id": "STORE-003",
      "city": "Karachi",
      "timestamp": "2026-03-04T14:35:22Z",
      "original_amount": 2500.00,
      "discount_amount": 250.00,
      "final_amount": 2250.00,
      "discount_type": "membership",
      "items_count": 3
    }
  ],
  "active_devices": [
    {
      "device_id": "device_abc123",
      "platform": "android",
      "last_active": "2026-03-05T08:30:00Z",
      "registered_at": "2025-03-01T10:00:00Z"
    }
  ]
}
```

**UI Requirements:**

**Modal or Side Drawer** (slide from right, 60% screen width)

**Header:**
- Member name (H2)
- Member ID (mono font, muted)
- Status badge (large)
- Close button (X icon)

**Tab Navigation:**
- Overview | Transactions | Payments | Devices

**Overview Tab:**

**Profile Card:**
- Avatar (initials or photo)
- Name, Email, Phone (stacked)
- City, Date of Birth
- Joined date

**Membership Timeline Card:**
- Activation date → Expiry date (visual timeline)
- Days remaining (circular progress, gold if <30 days)
- Auto-renew toggle indicator
- Plan: "Annual (Rs. 2,000)"

**Quick Stats:**
- Total Saved: Rs. 1,250
- Total Spent: Rs. 12,500
- Transactions: 15
- Avg Purchase: Rs. 833
- Favorite Store: Dolmen Mall Clifton

**Status Actions:**
- If active: [Suspend Member] button (red, opens confirmation modal)
- If suspended: [Reactivate Member] button (green, opens modal)
- If expired: [Extend Membership] button (gold, opens form modal)

**Transactions Tab:**
- Mini table (last 50 transactions)
- Date range filter
- Store filter dropdown
- Export button (CSV download scoped to this member)

**Payments Tab:**
- List of payment records
- Date | Amount | Method | Status | Gateway Ref

**Devices Tab:**
- List of registered devices
- Platform icon (iOS/Android)
- Last active timestamp
- Registered date
- [Revoke] button (future feature, disabled for now)

---

#### 2.6. Update Member Status
```http
PUT /api/admin/members/{member_id}/status
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "status": "suspended",
  "reason": "Fraudulent activity detected",
  "admin_notes": "Multiple chargebacks on different cards"
}

Response:
{
  "success": true,
  "message": "Member status updated to suspended",
  "member": {
    "member_id": "MUM-12345",
    "status": "suspended",
    "updated_at": "2026-03-05T15:00:00Z"
  }
}
```

**UI Requirements:**

**Confirmation Modal:**
- Title: "Suspend Member?"
- Body: "This will immediately disable MUM-12345's membership benefits. They will not be able to use their discount at checkout."
- Reason dropdown: Fraud | Policy Violation | Payment Issue | Other
- Notes textarea (if "Other" selected or optional)
- [Cancel] [Suspend Member] buttons
- On success: Toast "Member suspended successfully"
- Refetch member detail

---

#### 2.7. Get All Transactions
```http
GET /api/admin/transactions?page=1&limit=50&store_id=STORE-003&member_id=MUM-12345&from_date=2026-02-01&to_date=2026-03-05&discount_type=membership&min_amount=100&max_amount=5000&sort_by=timestamp&sort_order=desc
Authorization: Bearer {access_token}

Query Parameters:
- page, limit (pagination)
- store_id (filter by store)
- member_id (filter by member)
- from_date, to_date (ISO 8601 format)
- discount_type: 'membership' | 'promo' | 'all'
- min_amount, max_amount (filter by transaction amount)
- sort_by: 'timestamp' | 'amount' | 'discount'
- sort_order: 'asc' | 'desc'

Response:
{
  "transactions": [
    {
      "transaction_id": "TXN-20260304-001234",
      "member_id": "MUM-12345",
      "member_name": "Ahmed Khan",
      "store_id": "STORE-003",
      "store_name": "Dolmen Mall Clifton",
      "city": "Karachi",
      "timestamp": "2026-03-04T14:35:22Z",
      "original_amount": 2500.00,
      "discount_percentage": 10,
      "discount_amount": 250.00,
      "final_amount": 2250.00,
      "tax_amount": 337.50,
      "discount_type": "membership",
      "source": "offline",
      "items_count": 3,
      "cashier_id": "CASHIER-042"
    }
  ],
  "summary": {
    "total_transactions": 12450,
    "total_discount": 312500.00,
    "total_revenue": 2812500.00,
    "average_transaction": 250.80
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 249,
    "total_count": 12450,
    "per_page": 50
  }
}
```

**UI Requirements:**

**Filter Drawer** (slide from left, 300px width):
- Date Range Picker (from/to, presets: Today, Yesterday, Last 7 days, Last 30 days, This Month, Last Month, Custom)
- Store Selector (dropdown, all stores loaded from /api/admin/stores)
- Member Search (typeahead input, searches as you type)
- Discount Type Toggle (All | Membership | Promo)
- Amount Range Slider (min/max, step 100, range 0-50,000)
- [Clear All Filters] [Apply Filters] buttons

**Summary Chips (top of table):**
- Total Transactions: 12,450
- Total Discounts: Rs. 312,500
- Total Revenue: Rs. 2,812,500
- Avg Transaction: Rs. 250

**Transactions Table:**
- Columns: Txn ID | Date/Time | Member | Store | City | Discount % | Discount (Rs.) | Amount (Rs.) | Type | Source
- Sortable columns (click header to sort)
- Virtualized scrolling if >100 rows (react-window)
- Export button (CSV, all filtered results)

**Empty State:**
- "No transactions found" + filter icon illustration
- [Clear Filters] button

---

#### 2.8. Get All Stores
```http
GET /api/admin/stores
Authorization: Bearer {access_token}

Response:
{
  "stores": [
    {
      "store_id": "STORE-003",
      "name": "Dolmen Mall Clifton",
      "address": "HC 3, Rahat Commercial Area, Clifton Block 5",
      "city": "Karachi",
      "country": "Pakistan",
      "phone": "+92 21 XXXXXXX",
      "latitude": 24.8102,
      "longitude": 67.0287,
      "discount_percentage": 10,
      "is_active": true,
      "opening_hours": {
        "monday": "10:00-22:00",
        "tuesday": "10:00-22:00",
        "wednesday": "10:00-22:00",
        "thursday": "10:00-22:00",
        "friday": "10:00-22:00",
        "saturday": "10:00-22:00",
        "sunday": "11:00-21:00"
      },
      "transaction_count": 1234,
      "total_discount_given": 123400.00,
      "last_transaction": "2026-03-05T14:30:00Z",
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "total_count": 52
}
```

**UI Requirements:**

**View Toggle:** Grid View | List View | Map View

**Grid View:**
- Cards (3 per row on desktop, 2 on tablet)
- Each card shows:
  - Store name (H3)
  - City + badge (Active/Inactive)
  - Discount %: 10%
  - Transaction count: 1,234
  - Total discounts: Rs. 123,400
  - Last transaction: 2 hours ago
  - [Edit] button

**List View:**
- Table with columns: Name | City | Discount % | Active | Transactions | Discounts | Last Txn | Actions

**Map View:**
- Google Maps embed with markers for each store
- Marker color: green (active), gray (inactive)
- Click marker: show store info popup with [View Details] button

**Add Store Button:**
- Floating at top-right
- Gold background
- Opens slide-over form

---

#### 2.9. Create/Update Store
```http
POST /api/admin/stores
PUT /api/admin/stores/{store_id}
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "Lucky One Mall",
  "address": "Main Rashid Minhas Road",
  "city": "Karachi",
  "country": "Pakistan",
  "phone": "+92 21 1234567",
  "latitude": 24.9056,
  "longitude": 67.1024,
  "discount_percentage": 10,
  "is_active": true,
  "opening_hours": {
    "monday": "10:00-22:00",
    "tuesday": "10:00-22:00",
    "wednesday": "10:00-22:00",
    "thursday": "10:00-22:00",
    "friday": "14:00-22:00",
    "saturday": "10:00-22:00",
    "sunday": "11:00-21:00"
  }
}

Response:
{
  "success": true,
  "message": "Store created successfully",
  "store": { /* full store object */ }
}
```

**UI Requirements:**

**Slide-Over Form** (from right, 500px width):

**Fields (2-column layout):**
- Store Name (text, required)
- Address (text, required)
- City (dropdown: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad)
- Country (readonly: "Pakistan")
- Phone (text, format: +92 XX XXXXXXX)
- Latitude (number, step 0.0001, required)
- Longitude (number, step 0.0001, required)
- Discount % (number, min 0, max 100, step 1, default 10)
- Active (toggle switch)

**Opening Hours (7 day grid):**
- Each day: checkbox (open/closed) + time range (HH:MM - HH:MM)
- Template button: "Same for all days"

**Validation:**
- All required fields
- Phone format validation
- Lat/long decimal validation
- Discount range 0-100

**Buttons:**
- [Cancel] [Save Store]
- Loading spinner on save
- Success toast on completion
- Form resets on success

---

#### 2.10. Export Reports
```http
GET /api/admin/reports/export?report_type=members&format=csv&from_date=2026-02-01&to_date=2026-03-05&store_id=STORE-003
Authorization: Bearer {access_token}

Query Parameters:
- report_type: 'members' | 'transactions' | 'revenue' | 'stores'
- format: 'csv' | 'json' | 'pdf'
- from_date, to_date (ISO 8601)
- store_id (optional, filter by store)

Response:
- Content-Type: text/csv or application/json or application/pdf
- Content-Disposition: attachment; filename="mumuso-members-2026-03-05.csv"
- File download triggered
```

**UI Requirements:**

**Reports Page:**

**4 Report Cards:**

1. **Members Report**
   - Icon: Users
   - Description: "Export all member data with stats"
   - [Generate Report] button

2. **Transactions Report**
   - Icon: Receipt
   - Description: "Export transaction history with filters"
   - [Generate Report] button

3. **Revenue Report**
   - Icon: TrendingUp
   - Description: "Revenue and discount summary"
   - [Generate Report] button

4. **Stores Report**
   - Icon: MapPin
   - Description: "Store performance and stats"
   - [Generate Report] button

**Modal on Click:**
- Title: "Generate Members Report"
- Format selector: CSV | JSON | PDF (radio buttons)
- Date range picker
- Store filter (optional, only for transactions/revenue)
- [Cancel] [Download Report] buttons
- Loading spinner while generating
- Success: file downloads automatically
- Error: toast "Report generation failed. Please try again."

**Download History (local state):**
- List of recent downloads (client-side only, not persisted)
- Timestamp | Report Type | Format | Status
- Max 10 entries

---

## 3. REAL-TIME FEATURES (WEBSOCKET)

### 3.1. WebSocket Connection

```javascript
// Connect to WebSocket server on login
const socket = io('https://api.mumuso.com', {
  auth: { token: accessToken }
});

// Subscribe to admin channels
socket.emit('subscribe', ['transactions', 'analytics', 'system']);

// Listen for events
socket.on('new_transaction', (transaction) => {
  // Add to live feed
  // Update metrics
  // Show toast notification
});

socket.on('metrics_updated', (metrics) => {
  // Update dashboard KPI cards
});

socket.on('system_alert', (alert) => {
  // Show alert banner
});
```

**Events to Handle:**

1. **new_transaction**
   - Payload: transaction object
   - Action: Prepend to recent transactions table, play subtle sound, show toast

2. **metrics_updated**
   - Payload: partial metrics update
   - Action: Update KPI cards (smooth number animation)

3. **member_joined**
   - Payload: new member object
   - Action: Update member count, show toast "New member: Ahmed Khan"

4. **system_alert**
   - Payload: { type: 'error'|'warning', message: string, component: string }
   - Action: Show banner at top of screen

**UI Indicators:**
- "Live" badge (pulsing red dot) on Recent Transactions table
- Connection status indicator in top bar (green dot = connected, red = disconnected)

---

## 4. PAKISTANI LOCALIZATION

### Currency Formatting
```javascript
// Always use PKR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Result: "Rs. 2,500" or "Rs 2,500.50"
```

### Phone Number Formatting
```javascript
// Format: +92 3XX XXXXXXX
const formatPhone = (phone: string) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 92, format as +92 XXX XXXXXXX
  if (cleaned.startsWith('92')) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  // If starts with 0, convert to +92
  if (cleaned.startsWith('0')) {
    return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`;
  }
  
  return phone;
};
```

### Date Formatting
```javascript
// Use DD/MM/YYYY (not MM/DD/YYYY)
import { format } from 'date-fns';

const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

const formatDateTime = (date: Date | string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};
```

### City Dropdown
```javascript
const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala'
];
```

---

## 5. USER ROLES & PERMISSIONS

### Role Definitions

```typescript
type AdminRole = 'super_admin' | 'manager' | 'support' | 'viewer';

interface AdminPermissions {
  view_analytics: boolean;
  manage_members: boolean;
  suspend_members: boolean;
  manage_stores: boolean;
  export_data: boolean;
  view_transactions: boolean;
  access_settings: boolean;
}

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    view_analytics: true,
    manage_members: true,
    suspend_members: true,
    manage_stores: true,
    export_data: true,
    view_transactions: true,
    access_settings: true
  },
  manager: {
    view_analytics: true,
    manage_members: true,
    suspend_members: false, // Can't suspend
    manage_stores: false,   // Can't add/edit stores
    export_data: true,
    view_transactions: true,
    access_settings: false
  },
  support: {
    view_analytics: false,  // No analytics access
    manage_members: true,   // Can view, extend memberships
    suspend_members: false,
    manage_stores: false,
    export_data: false,
    view_transactions: true,
    access_settings: false
  },
  viewer: {
    view_analytics: true,
    manage_members: false,  // Read-only on members
    suspend_members: false,
    manage_stores: false,
    export_data: false,
    view_transactions: true,
    access_settings: false
  }
};
```

**UI Implementation:**
- Check permissions before showing buttons/actions
- Disable buttons if user lacks permission
- Show tooltip: "You don't have permission to perform this action"
- Hide entire nav items if no permission (e.g., hide "Stores" for support role)

---

## 6. ERROR HANDLING & OFFLINE STATES

### API Error States

```typescript
interface APIError {
  success: false;
  message: string;
  code?: string;
  details?: any;
}
```

**Error Codes to Handle:**

- `401` - Unauthorized → Try refresh token → Redirect to login
- `403` - Forbidden → Show "You don't have permission" toast
- `404` - Not Found → Show "Resource not found" message
- `429` - Rate Limited → Show "Too many requests, please wait"
- `500` - Server Error → Show "Something went wrong. Please try again."
- `503` - Service Unavailable → Show "System is down for maintenance"

**Network Offline:**
- Show banner: "You're offline. Some features may not work."
- Disable action buttons
- Show cached data with "(Cached)" label

**Slow Network (>3 seconds):**
- Show loading skeleton immediately
- If >3 seconds, show "Taking longer than usual..." message
- Option to cancel request

**CBS POS Integration Down:**
- Dashboard banner: "⚠️ POS integration offline. Recent transactions may be delayed."
- Yellow warning color
- Show last successful sync timestamp

**Payment Gateway Down:**
- Dashboard banner: "⚠️ Payment gateway offline. New memberships cannot be processed."
- Disable "Extend Membership" actions

---

## 7. FOLDER STRUCTURE

```
/
├── public/
│   ├── fonts/
│   │   ├── Cormorant-Garamond/
│   │   ├── DM-Sans/
│   │   └── JetBrains-Mono/
│   └── sounds/
│       └── notification.mp3
├── src/
│   ├── app/ (Next.js App Router)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx (sidebar + top bar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── members/
│   │   │   │   ├── page.tsx (list)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx (detail)
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx
│   │   │   ├── stores/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   ├── components/
│   │   ├── ui/ (primitives)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── Toast.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── DonutChart.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── SystemBanner.tsx
│   │   └── features/
│   │       ├── MemberDetailModal.tsx
│   │       ├── StoreForm.tsx
│   │       ├── ReportGenerator.tsx
│   │       └── LiveTransactionFeed.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts (axios instance)
│   │   │   ├── auth.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── members.ts
│   │   │   ├── transactions.ts
│   │   │   ├── stores.ts
│   │   │   └── reports.ts
│   │   ├── utils/
│   │   │   ├── format.ts (currency, phone, date)
│   │   │   ├── validation.ts
│   │   │   └── permissions.ts
│   │   └── websocket/
│   │       └── socket.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   ├── useMembers.ts
│   │   ├── useTransactions.ts
│   │   ├── useStores.ts
│   │   └── useWebSocket.ts
│   ├── store/
│   │   ├── authStore.ts (Zustand)
│   │   └── uiStore.ts
│   └── types/
│       ├── api.ts (all API response types)
│       ├── models.ts (Member, Transaction, Store, etc.)
│       └── permissions.ts
├── .env.example
├── .env.local
├── tailwind.config.ts (custom Mumuso theme)
├── package.json
└── README.md
```

---

## 8. TAILWIND THEME (Mumuso Colors)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F3F0',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FAFAF8',
          dark: '#1C1C1E',
          darker: '#141416'
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B6B6B',
          tertiary: '#9E9E9E',
          inverted: '#F0EDE8'
        },
        accent: {
          DEFAULT: '#C8A96E',
          light: '#F0E4C8',
          dark: '#A07840',
          text: '#8B6430'
        },
        success: {
          DEFAULT: '#4A9B7F',
          bg: '#EBF5F1'
        },
        error: {
          DEFAULT: '#C0544A',
          bg: '#F7EDEC'
        },
        warning: {
          DEFAULT: '#C08040',
          bg: '#F7F0E8'
        },
        border: {
          subtle: '#E8E5E0',
          DEFAULT: '#D4D0C8',
          strong: '#B0AA9E'
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace']
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px'
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.10)'
      }
    }
  },
  plugins: []
};

export default config;
```

---

## 9. QUALITY REQUIREMENTS

### Performance
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Focus visible on tab
- Screen reader friendly (ARIA labels)
- Minimum tap target: 44×44px

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsiveness
- Desktop: 1920×1080 (optimal)
- Laptop: 1366×768
- Tablet: 1024×768 (minimum)
- Mobile: Not required (admin dashboard is desktop-only)

### Code Quality
- ESLint + Prettier configured
- TypeScript strict mode
- No console errors/warnings
- Documented complex functions
- Reusable components

---

## 10. DELIVERABLES CHECKLIST

When you deliver this project, ensure:

- [ ] Full Next.js project with TypeScript
- [ ] All 10 screens implemented (Login, Dashboard, Members, Member Detail, Transactions, Stores, Reports, Settings)
- [ ] All API integrations working (with mock data fallback if API unavailable)
- [ ] WebSocket real-time updates implemented
- [ ] Mumuso color theme applied throughout
- [ ] Role-based permissions enforced
- [ ] Pakistani localization (currency, phone, date, cities)
- [ ] Responsive down to 1024px
- [ ] Loading states, error states, empty states
- [ ] README with setup instructions
- [ ] .env.example file
- [ ] ESLint + Prettier configured
- [ ] No console errors
- [ ] Clean, documented code

---

## 11. SAMPLE .ENV FILE

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.mumuso.com
NEXT_PUBLIC_WS_URL=wss://api.mumuso.com

# Environment
NODE_ENV=development

# Optional: Analytics
NEXT_PUBLIC_GA_ID=

# Optional: Sentry for error tracking
SENTRY_DSN=
```

---

## 12. README TEMPLATE

```markdown
# Mumuso Admin Dashboard

Premium admin dashboard for managing Mumuso Pakistan loyalty program.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** Zustand + React Query
- **Charts:** Recharts
- **Icons:** Lucide React

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Update `NEXT_PUBLIC_API_BASE_URL` with your backend URL
5. Run development server: `npm run dev`
6. Open http://localhost:3000

## Default Admin Credentials

Email: admin@mumuso.com
Password: (request from backend team)

## Features

- Real-time dashboard with WebSocket updates
- Member management (view, suspend, extend)
- Transaction monitoring with advanced filters
- Store management with map view
- Export reports (CSV, JSON, PDF)
- Role-based access control
- Pakistani localization (PKR, phone format, DD/MM/YYYY)

## Project Structure

- `/src/app` - Next.js pages (App Router)
- `/src/components` - Reusable UI components
- `/src/lib` - API clients, utilities, WebSocket
- `/src/hooks` - Custom React hooks
- `/src/store` - Zustand state stores
- `/src/types` - TypeScript type definitions

## Build

```bash
npm run build
npm run start
```

## License

Proprietary - Mumuso Pakistan
```

---

**BUILD THE ENTIRE ADMIN DASHBOARD ACCORDING TO THIS SPECIFICATION.**

Ensure every screen, interaction, API call, and visual detail matches this document exactly. Use the Mumuso brand colors, typography, and "Quiet Luxury" design philosophy throughout.