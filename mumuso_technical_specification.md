# Mumuso Paid Membership & Loyalty App
## Full Technical Specification

> **Version:** 1.1 — Updated mobile framework to React Native  
> **Classification:** Internal — Confidential  
> **Scope:** Mobile Application (iOS & Android) · Web-Based Admin Dashboard · Backend Architecture

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Mobile Application — Frontend](#3-mobile-application--frontend)
   - 3.1 [Tech Stack](#31-tech-stack)
   - 3.2 [App Structure & Navigation](#32-app-structure--navigation)
   - 3.3 [Screens — Unauthenticated](#33-screens--unauthenticated)
   - 3.4 [Screens — Authenticated (Non-Member)](#34-screens--authenticated-non-member)
   - 3.5 [Screens — Authenticated (Active Member)](#35-screens--authenticated-active-member)
   - 3.6 [Authentication & Session Handling](#36-authentication--session-handling)
   - 3.7 [State Management](#37-state-management)
   - 3.8 [Push Notifications (Client Side)](#38-push-notifications-client-side)
   - 3.9 [QR Code Handling](#39-qr-code-handling)
   - 3.10 [Offline Behaviour](#310-offline-behaviour)
4. [Web-Based Admin Dashboard — Frontend](#4-web-based-admin-dashboard--frontend)
   - 4.1 [Tech Stack](#41-tech-stack)
   - 4.2 [Dashboard Structure & Navigation](#42-dashboard-structure--navigation)
   - 4.3 [Pages — Super Admin](#43-pages--super-admin)
   - 4.4 [Pages — Store Admin](#44-pages--store-admin)
   - 4.5 [Pages — Marketing Manager](#45-pages--marketing-manager)
   - 4.6 [Shared Pages (All Roles)](#46-shared-pages-all-roles)
   - 4.7 [Role-Based Access Control (Frontend)](#47-role-based-access-control-frontend)
   - 4.8 [Authentication & Session Handling](#48-authentication--session-handling)
5. [Backend Architecture](#5-backend-architecture)
   - 5.1 [Tech Stack](#51-tech-stack)
   - 5.2 [Service Architecture](#52-service-architecture)
   - 5.3 [Database Schema](#53-database-schema)
   - 5.4 [API Endpoints — Mobile App](#54-api-endpoints--mobile-app)
   - 5.5 [API Endpoints — Admin Dashboard](#55-api-endpoints--admin-dashboard)
   - 5.6 [API Endpoints — POS Integration](#56-api-endpoints--pos-integration)
   - 5.7 [POS Integration Flow](#57-pos-integration-flow)
   - 5.8 [Payment Gateway Integration](#58-payment-gateway-integration)
   - 5.9 [Push Notification Service](#59-push-notification-service)
   - 5.10 [Security Architecture](#510-security-architecture)
   - 5.11 [Audit Logging](#511-audit-logging)
6. [Third-Party Integrations](#6-third-party-integrations)
7. [KPIs & Analytics](#7-kpis--analytics)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)

---

## 1. Project Overview

Mumuso's Paid Membership & Loyalty App is a **POS-driven customer intelligence platform** built to generate recurring membership revenue, increase customer retention, and capture real transaction-level data across all participating stores.

### Core Value Exchange

| Actor | Gives | Gets |
|---|---|---|
| Customer | Annual membership fee | Discount at participating stores, savings tracking |
| Store | Configures discount % | More member footfall, customer data, campaign reach |
| Mumuso HQ | Platform & infrastructure | Recurring revenue, network-wide analytics |

### Key Design Principles

- **Zero inventory integration** — the system never needs to know what items a store sells
- **Store autonomy within HQ boundaries** — each store sets its own discount percentage within a range HQ defines
- **Frictionless redemption** — QR scan primary, Member ID manual entry as fallback
- **Customer transparency** — members always know the discount rate before entering a store

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────────┐          ┌──────────────────────────┐   │
│   │   Mobile App     │          │   Web Admin Dashboard    │   │
│   │  (iOS & Android) │          │   (Browser-based)        │   │
│   │  React Native    │          │   React.js               │   │
│   │  (JavaScript /   │          │                          │   │
│   └────────┬─────────┘          └────────────┬─────────────┘   │
└────────────│────────────────────────────────│─────────────────┘
             │  HTTPS / REST API              │  HTTPS / REST API
             │                               │
┌────────────▼───────────────────────────────▼─────────────────┐
│                      API GATEWAY (AWS API Gateway)            │
│              Rate limiting · Auth token validation            │
│              Route to correct microservice                    │
└───┬──────────────┬────────────────┬───────────────┬──────────┘
    │              │                │               │
┌───▼──┐     ┌─────▼────┐    ┌─────▼────┐    ┌────▼──────┐
│ Auth │     │Membership│    │   POS    │    │ Campaign  │
│Service│    │ Service  │    │Integration│   │ Service   │
└───┬──┘     └─────┬────┘    └─────┬────┘   └────┬──────┘
    │              │               │              │
┌───▼──────────────▼───────────────▼──────────────▼──────────┐
│                   Database Layer                             │
│         PostgreSQL (relational)  +  Redis (cache)           │
└─────────────────────────────────────────────────────────────┘
             │                           │
    ┌────────▼──────┐           ┌────────▼────────┐
    │ Payment       │           │ Push Notification│
    │ Gateway       │           │ Service (FCM/APNs│
    │ (Stripe etc.) │           │ via Firebase)   │
    └───────────────┘           └─────────────────┘
```

---

## 3. Mobile Application — Frontend

### 3.1 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native (JavaScript / TypeScript) | Single codebase for iOS & Android, large ecosystem, shared logic with web dashboard |
| Language | TypeScript | Type safety, better IDE support, fewer runtime errors |
| State Management | Redux Toolkit + RTK Query | Predictable state, built-in API caching and request deduplication |
| Navigation | React Navigation v6 | De-facto standard, supports stack, tab, and drawer navigators with deep linking |
| HTTP Client | Axios | Interceptors for auth token injection and refresh logic |
| Local Storage | react-native-keychain | Encrypted keychain/keystore storage for tokens and sensitive session data |
| QR Display | react-native-qrcode-svg | Generates QR code as SVG from Member ID token string |
| Push Notifications | Firebase Messaging (`@react-native-firebase/messaging`) | FCM for Android, APNs bridged via Firebase for iOS |
| Payment UI | Payment gateway React Native SDK (Stripe RN / local gateway) | In-app checkout sheet with native card input |
| Analytics | `@react-native-firebase/analytics` | Screen tracking, custom event logging |
| Maps / Location | `react-native-maps` + `react-native-geolocation-service` (optional) | Store discovery with location proximity |
| Async Storage | `@react-native-async-storage/async-storage` | Non-sensitive persisted preferences (onboarding seen, notification settings) |
| Environment Config | `react-native-config` | Manage API base URLs and keys per environment (dev / staging / prod) |

---

### 3.1.1 React Native Project Structure

```
mumuso-app/
├── android/                        # Android native project
├── ios/                            # iOS native project
├── src/
│   ├── api/                        # Axios instance + all API call functions
│   │   ├── axiosInstance.ts        # Base URL, interceptors, token refresh logic
│   │   ├── authApi.ts
│   │   ├── memberApi.ts
│   │   ├── storesApi.ts
│   │   └── posApi.ts
│   ├── components/                 # Reusable UI components
│   │   ├── QRCard/
│   │   ├── StoreCard/
│   │   ├── TransactionItem/
│   │   ├── MembershipBadge/
│   │   └── OfflineBanner/
│   ├── navigation/                 # React Navigation stacks & tab navigators
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MemberTabNavigator.tsx
│   │   └── linking.ts              # Deep link configuration
│   ├── screens/                    # One folder per screen
│   │   ├── Splash/
│   │   ├── Onboarding/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── OTPVerification/
│   │   ├── Home/
│   │   ├── QRCard/
│   │   ├── StoreList/
│   │   ├── StoreDetail/
│   │   ├── PurchaseHistory/
│   │   ├── TransactionDetail/
│   │   ├── MembershipPurchase/
│   │   ├── MembershipRenewal/
│   │   ├── EditProfile/
│   │   └── NotificationSettings/
│   ├── store/                      # Redux Toolkit store
│   │   ├── index.ts                # configureStore
│   │   ├── authSlice.ts
│   │   ├── membershipSlice.ts
│   │   ├── notificationSlice.ts
│   │   └── services/               # RTK Query service definitions
│   │       ├── storesService.ts
│   │       ├── transactionsService.ts
│   │       └── dashboardService.ts
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useQRToken.ts
│   ├── utils/                      # Helpers and constants
│   │   ├── tokenStorage.ts         # Keychain read/write helpers
│   │   ├── formatCurrency.ts
│   │   └── dateHelpers.ts
│   ├── theme/                      # Colours, typography, spacing
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── types/                      # TypeScript interfaces and enums
│       ├── auth.types.ts
│       ├── member.types.ts
│       ├── store.types.ts
│       └── transaction.types.ts
├── .env.development
├── .env.staging
├── .env.production
├── app.json
└── package.json
```



```
App
├── Unauthenticated Stack
│   ├── Splash Screen
│   ├── Onboarding (3 slides)
│   ├── Login Screen
│   ├── Registration Screen
│   └── OTP Verification Screen
│
└── Authenticated Stack
    ├── Non-Member Flow
    │   ├── Home (membership prompt)
    │   ├── Membership Purchase Screen
    │   └── Payment Screen
    │
    └── Member Flow
        ├── Bottom Nav Bar
        │   ├── Home (Dashboard)
        │   ├── My Card (QR Screen)
        │   ├── Stores
        │   └── Account
        │
        ├── Home Stack
        │   ├── Home Screen
        │   └── Savings Detail Screen
        │
        ├── Card Stack
        │   └── QR Membership Card Screen
        │
        ├── Stores Stack
        │   ├── Store List Screen
        │   ├── Store Detail Screen
        │   └── Store Map View (optional)
        │
        └── Account Stack
            ├── Account Overview Screen
            ├── Purchase History Screen
            ├── Transaction Detail Screen
            ├── Membership Renewal Screen
            ├── Edit Profile Screen
            └── Notification Settings Screen
```

---

### 3.3 Screens — Unauthenticated

#### Splash Screen
- Displays Mumuso logo and brand animation
- Checks `react-native-keychain` for existing auth token
- If token valid → navigate to Member Home
- If token expired → navigate to Login
- If no token → navigate to Onboarding (first launch) or Login

#### Onboarding Screen (3 slides — first launch only)
- **Slide 1:** "Membership that pays off" — introduces the 10% discount concept
- **Slide 2:** "Shop anywhere" — shows the store network
- **Slide 3:** "One QR, all stores" — shows the QR card and how redemption works
- Skip button available on all slides
- Stored in `AsyncStorage` under key `onboarding_complete` — only shows once

#### Login Screen

**UI Components:**
- Email input field with validation
- Password input field (masked, show/hide toggle)
- "Forgot Password" link → triggers OTP reset flow
- "Login" primary CTA button
- "Don't have an account? Register" secondary link

**Logic:**
- On submit → `POST /auth/login`
- On success → store access token + refresh token in `react-native-keychain` → navigate based on membership status in response
- On failure → inline error message (invalid credentials / account not found)

#### Registration Screen

**UI Components:**
- Full name input
- Email input with real-time format validation
- Phone number input with country code picker
- Password input with strength indicator
- Confirm password input
- Terms & Conditions checkbox with link
- "Create Account" CTA button

**Logic:**
- On submit → `POST /auth/register`
- On success → navigate to OTP Verification Screen
- Phone number stored for SMS OTP or email OTP depending on config

#### OTP Verification Screen

**UI Components:**
- 6-digit OTP input (auto-advance between digits)
- 60-second countdown timer
- "Resend OTP" button (active only after timer expires)
- "Verify" CTA button

**Logic:**
- On submit → `POST /auth/verify-otp`
- On success → token issued, navigate to Non-Member Home
- Max 3 attempts before account temporarily locked (5 minutes)

---

### 3.4 Screens — Authenticated (Non-Member)

#### Home Screen (Non-Member State)

**UI Components:**
- Welcome banner with user's first name
- Membership prompt card with benefit highlights
- "Get Membership" primary CTA button
- Store preview list (read-only, blurred discount %)
- Footer messaging: "Join to unlock discounts at all stores"

**Logic:**
- Membership status checked on app load via `/member/status`
- If status changes to active (after purchase) → re-render to Member Home

#### Membership Purchase Screen

**UI Components:**
- Membership plan card showing annual price, benefits list
- Discount preview (illustrative — actual % varies by store)
- "Proceed to Pay" CTA button
- Secure payment badge

**Logic:**
- On CTA tap → navigate to Payment Screen
- Plan details fetched from `GET /membership/plans`

#### Payment Screen

**UI Components:**
- Order summary (membership plan, price, tax breakdown)
- Payment method selector (card, wallet, etc.)
- Card input fields (if card selected) — handled by payment gateway SDK
- "Confirm & Pay" CTA
- Security disclaimer

**Logic:**
- On confirm → payment gateway SDK initiates transaction
- On payment success → `POST /membership/activate` called with payment reference
- On activation success → Member ID + QR generated on backend → navigate to Member Home with success modal
- On payment failure → error message with retry option

---

### 3.5 Screens — Authenticated (Active Member)

#### Home Screen (Member Dashboard)

**UI Components:**
- Greeting header with member name and status badge (Active / Expires Soon)
- Savings summary card: "Total Saved: PKR X,XXX" with progress ring
- Membership expiry date with days remaining indicator
- Quick action buttons: "My Card", "Find Stores", "History"
- Recent transactions list (last 3)
- Promo banner (if active campaign exists)

**Data Sources:**
- `GET /member/dashboard` — savings total, expiry, recent transactions
- `GET /campaigns/active` — active promo banners

#### QR Membership Card Screen

**UI Components:**
- Full-screen dark background for maximum QR contrast
- Large QR code (generated from Member ID string)
- Member name displayed below QR
- Member ID shown as readable text (e.g. MUM-004821) below QR — for manual entry fallback
- Membership status badge (Active / Expired)
- Expiry date displayed
- Screen brightness auto-maximised when screen opens
- "Tap to refresh QR" option (re-fetches token if needed)

**Logic:**
- QR encodes a signed, time-limited token (not the raw Member ID) — regenerated every 5 minutes to prevent screenshot abuse
- Token format: `{memberID}.{timestamp}.{signature}`
- If membership expired — QR is greyed out with "Membership Expired" overlay and "Renew Now" CTA

#### Store List Screen

**UI Components:**
- Search bar (search by store name or area)
- Filter options: by city, by discount % (low to high / high to low)
- Store cards showing:
  - Store name
  - Location / area
  - Discount percentage badge (e.g. "12% OFF")
  - Distance (if location permission granted)
  - Operating hours
- Map View toggle button

**Logic:**
- `GET /stores` — fetches all active stores with their current discount %
- Discount % is live — if a store admin changes it, it reflects immediately on next fetch
- Location permission requested on first open — optional, app works without it

#### Store Detail Screen

**UI Components:**
- Store name and full address
- Discount badge (large, prominent)
- Operating hours
- Phone number (click to call)
- Map embed showing store location
- "Show My Card" CTA button (shortcut to QR screen)

**Logic:**
- `GET /stores/{storeId}` — individual store details
- "Show My Card" navigates directly to QR Screen

#### Purchase History Screen

**UI Components:**
- Chronological list of all past transactions
- Each transaction card shows:
  - Store name
  - Date and time
  - Original total amount
  - Discount applied (amount and %)
  - Amount paid
- Filter by date range, by store
- Total savings summary at top of list

**Logic:**
- `GET /member/transactions` — paginated, 20 per page
- Pull-to-refresh

#### Transaction Detail Screen

**UI Components:**
- Full transaction breakdown
- Store name, address, cashier reference
- Items count (if available)
- Discount type (Full / Partial — as flagged by cashier)
- Amount breakdown: subtotal, discount, total paid
- Date and time stamp
- "Download Receipt" option (PDF)

#### Membership Renewal Screen

**UI Components:**
- Current membership status (active / expired)
- Renewal plan details (same as original plan)
- New expiry date (12 months from today if renewing while active, or 12 months from today if renewing after expiry)
- "Renew Now" CTA → Payment Screen
- Renewal history (previous renewal dates)

**Logic:**
- `GET /membership/renewal-info`
- On renewal payment success → `POST /membership/renew`
- Expiry date updates in real time, QR card remains valid

#### Edit Profile Screen

**UI Components:**
- Editable fields: Full name, phone number
- Non-editable: Email (shown greyed out)
- Profile photo upload (optional)
- "Save Changes" CTA
- "Change Password" link → separate flow

**Logic:**
- `PUT /member/profile`
- Email cannot be changed after registration (used as unique identifier)

#### Notification Settings Screen

**UI Components:**
- Toggle for: Promotional offers, Renewal reminders, Transaction confirmations, New store alerts
- All toggles on by default

**Logic:**
- Preferences stored locally and synced to backend `PUT /member/notification-preferences`

---

### 3.6 Authentication & Session Handling

```
Login
  └── POST /auth/login
        ├── Returns: accessToken (15 min expiry) + refreshToken (30 days expiry)
        ├── Both stored in react-native-keychain (encrypted iOS Keychain / Android Keystore)
        └── accessToken injected into every API request via Axios request interceptor

Token Refresh Flow
  └── On 401 response from any API call:
        ├── Axios response interceptor catches 401
        ├── Calls POST /auth/refresh with refreshToken retrieved from keychain
        ├── If success → stores new accessToken in keychain → retries original request
        └── If refresh also fails → clears keychain, dispatches authSlice logout action → navigates to Login

Logout
  └── POST /auth/logout (invalidates refreshToken on server)
  └── Clears all tokens from react-native-keychain
  └── Resets Redux store to initial state
  └── Navigates to Login Screen via React Navigation
```

---

### 3.7 State Management

Using **Redux Toolkit + RTK Query**:

| Slice / Service | Manages |
|---|---|
| `authSlice` | Auth state, tokens, user session, login/logout actions |
| `membershipSlice` | Membership status, expiry, Member ID, renewal state |
| `storesApi` (RTK Query) | Store list fetching, caching, filtering — auto-refetch on focus |
| `transactionsApi` (RTK Query) | Purchase history, pagination, single transaction detail |
| `dashboardApi` (RTK Query) | Savings summary, recent transactions, home screen data |
| `campaignsApi` (RTK Query) | Active banners and promotional notifications |
| `notificationSlice` | Push notification preferences and local notification inbox |

---

### 3.8 Push Notifications (Client Side)

| Notification Type | Trigger | Deep Link Destination |
|---|---|---|
| Membership expiry (30 days out) | Automated — backend scheduler | Renewal Screen |
| Membership expiry (7 days out) | Automated — backend scheduler | Renewal Screen |
| Membership expired | Day of expiry | Renewal Screen |
| Transaction confirmation | After each in-store redemption | Transaction Detail Screen |
| Campaign / offer | Manual — Marketing Manager sends | Store Detail or Home Screen |
| New store added near user | Automated — on store activation | Store Detail Screen |

**Implementation:**
- Firebase Cloud Messaging (FCM) for Android via `@react-native-firebase/messaging`
- Apple Push Notification Service (APNs) for iOS bridged through the same Firebase package
- Requires `NSUserNotificationUsageDescription` in iOS `Info.plist` and notification permission request on first launch
- Device token registered on login via `POST /member/device-token`
- Token auto-refreshed by Firebase SDK — `onTokenRefresh` listener updates backend automatically
- Foreground notifications handled via `onMessage` listener — displayed as in-app banner
- Background / killed state notifications handled natively by FCM / APNs and displayed in system tray
- Notification tap handling via `getInitialNotification()` (killed state) and `onNotificationOpenedApp()` (background state) — both deep link to correct screen via React Navigation

---

### 3.9 QR Code Handling

**QR Token Structure:**

```
Payload: {
  memberId: "MUM-004821",
  issuedAt: 1739452800,        // Unix timestamp
  expiresAt: 1739453100,       // 5 minutes from issuedAt
  signature: "hmac_sha256..."  // HMAC signed with server secret
}

Encoded as: Base64(JSON payload)
```

**Security Rules:**
- QR token expires every 5 minutes — prevents static screenshot abuse
- App auto-refreshes token in background while QR screen is open
- POS validates signature before trusting Member ID
- If token expired at scan time → POS requests fresh validation with Member ID only

---

### 3.10 Offline Behaviour

| Feature | Offline Behaviour |
|---|---|
| QR Card | Last-valid QR token cached in `AsyncStorage` — displayed with "Last synced X minutes ago" notice |
| Store List | Last cached list stored via RTK Query's `keepUnusedDataFor` policy — shown with "You're offline" banner using `@react-native-community/netinfo` |
| Purchase History | Last cached history shown from RTK Query cache |
| Membership Purchase | Blocked — `netinfo` check fires before payment screen loads |
| Push Notifications | Queued by OS (FCM/APNs), delivered when connection restored |
| Network Detection | `NetInfo.addEventListener` monitors connectivity — global offline banner shown at top of all screens when disconnected |

---

## 4. Web-Based Admin Dashboard — Frontend

### 4.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js (with TypeScript) |
| UI Component Library | Ant Design or Material UI |
| State Management | Redux Toolkit or Zustand |
| HTTP Client | Axios (with interceptors for auth) |
| Charts & Analytics | Recharts or Chart.js |
| Tables | TanStack Table (React Table v8) |
| Authentication | JWT tokens, stored in httpOnly cookies |
| Routing | React Router v6 |
| Hosting | AWS Amplify or Vercel |

---

### 4.2 Dashboard Structure & Navigation

```
Dashboard
├── Auth
│   ├── Login Page
│   └── Forgot Password Page
│
├── Super Admin Layout
│   ├── Overview (Global KPIs)
│   ├── Store Management
│   │   ├── All Stores List
│   │   ├── Store Detail & Edit
│   │   └── Onboard New Store
│   ├── Member Management
│   │   ├── All Members List
│   │   └── Member Detail
│   ├── Analytics
│   │   ├── Global Sales Report
│   │   ├── Membership Revenue Report
│   │   └── Store Comparison Report
│   ├── Campaigns
│   │   ├── Campaign List
│   │   ├── Create Campaign
│   │   └── Campaign Performance
│   ├── Role & User Management
│   └── Audit Logs
│
├── Store Admin Layout
│   ├── Store Overview (KPIs)
│   ├── Discount Configuration
│   ├── Member Transactions (own store)
│   ├── Renewal Tracker
│   ├── Cashier Management
│   └── Store Campaigns
│
└── Marketing Manager Layout
    ├── Analytics (read-only)
    ├── Campaigns
    │   ├── Campaign List
    │   ├── Create Campaign
    │   └── Campaign Performance
    └── Renewal Tracker (read-only)
```

---

### 4.3 Pages — Super Admin

#### Global Overview Page

**Components:**
- KPI cards row: Total Active Members, Total Membership Revenue, Network-wide Renewal Rate, Average Basket Uplift
- Line chart: New member signups over time (daily / weekly / monthly toggle)
- Bar chart: Revenue by store
- Table: Top 10 performing stores by member footfall
- Map view: Store locations with activity heatmap (optional)

**Data Source:** `GET /admin/overview`

---

#### Store Management — All Stores List

**Components:**
- Searchable, filterable data table
- Columns: Store Name, City, Status (Active/Inactive), Discount %, Total Members Served, Date Onboarded, Actions
- Filters: By city, by status, by discount range
- "Onboard New Store" button → opens modal or navigates to form
- Bulk actions: Activate / Deactivate selected stores

**Data Source:** `GET /admin/stores`

---

#### Store Management — Onboard New Store

**Form Fields:**
- Store name (required)
- Store owner name
- Store owner email (used to send admin credentials)
- Phone number
- Full address (street, city, country)
- Google Maps PIN (coordinate picker)
- Operating hours (per day, open/close times)
- Initial discount percentage (within allowed range)
- Assign store admin role → sends invite email automatically

**Logic:**
- `POST /admin/stores`
- On submit → store created, store admin invited via email with temporary password

---

#### Store Detail & Edit Page

**Components:**
- All store info editable by Super Admin
- Discount % override (Super Admin can force-change regardless of store's setting)
- Store status toggle (Active / Inactive — if inactive, store does not appear in customer app)
- Transaction history for this store (read-only table)
- Assigned cashier accounts list

---

#### Member Management — All Members List

**Components:**
- Searchable data table
- Columns: Member ID, Full Name, Email, Phone, Membership Status, Expiry Date, Total Spent, Joined Date
- Filters: By status (Active / Expired / Suspended), by join date, by expiry window
- Click row → Member Detail Page
- Export button → CSV export of filtered list

**Data Source:** `GET /admin/members`

---

#### Member Detail Page

**Components:**
- Member profile card (name, email, phone, Member ID, join date)
- Membership status with expiry date
- Complete transaction history table (all stores)
- Total savings amount
- Admin actions: Suspend Account, Force Renew (manual extension), Add Note
- Activity log for this member

**Data Source:** `GET /admin/members/{memberId}`

---

#### Global Analytics Page

**Sub-pages:**

**Sales Report:**
- Date range picker
- Store filter (all or specific)
- Metrics: Total transactions by members, Total discount amount given, Member vs. non-member sales split
- Line chart: Daily member transactions
- Export to CSV / PDF

**Membership Revenue Report:**
- Total memberships sold (by period)
- Revenue breakdown (new vs. renewals)
- Average membership lifetime value
- Churn rate trend

**Store Comparison Report:**
- Side-by-side comparison of up to 5 stores
- Metrics: Member visit frequency, Average basket size (member vs non-member), Discount % vs basket uplift correlation

---

#### Role & User Management Page

**Components:**
- Table of all admin users (Super Admin, Store Admins, Marketing Managers)
- Columns: Name, Email, Role, Assigned Store (if applicable), Last Login, Status
- "Invite User" button → form with name, email, role selector, store assignment
- Edit / Revoke Access actions per row

**Data Source:** `GET /admin/users`

---

#### Audit Logs Page

**Components:**
- Chronological log table
- Columns: Timestamp, Actor (who), Action, Target (what was changed), Old Value, New Value, IP Address
- Filters: By actor, by action type, by date range
- Non-editable — read-only
- Export to CSV

**Data Source:** `GET /admin/audit-logs`

---

### 4.4 Pages — Store Admin

#### Store Overview Page

**Components:**
- KPI cards: Active Members Who Visited This Store, Total Discount Given (this month), Member Sales Ratio, Average Basket Uplift vs. Non-Members
- Bar chart: Member visits per day (last 30 days)
- Renewal alert banner: "X members expiring in next 30 days"

**Data Source:** `GET /store/overview` (scoped to authenticated store)

---

#### Discount Configuration Page

**Components:**
- Current discount % displayed prominently
- Slider or numeric input to adjust % (within HQ-defined min/max range)
- Live preview: "Members will see: 12% OFF at [Store Name]"
- "Save Changes" CTA
- Change history log (who changed it and when)
- Note: Changes reflect in customer app immediately upon save

**Logic:**
- `PUT /store/discount`
- Change logged to audit trail automatically

---

#### Member Transactions Page (Store-Scoped)

**Components:**
- Table of all transactions processed at this store
- Columns: Date/Time, Member ID, Member Name, Original Amount, Discount Applied, Amount Paid, Discount Type (Full/Partial), Cashier
- Filters: Date range, discount type
- Search by Member ID or name
- Export to CSV

**Data Source:** `GET /store/transactions`

---

#### Renewal Tracker Page

**Components:**
- Three tabs: Expiring in 7 Days, Expiring in 30 Days, Already Expired (recent)
- Table for each: Member Name, Email, Phone, Last Visit Date, Last Spent Amount
- "Send Renewal Nudge" button per row → sends push notification to that member
- "Send Bulk Nudge" → sends to entire filtered list
- Conversion tracking: did they renew after the nudge?

**Data Source:** `GET /store/renewals`

---

#### Cashier Management Page

**Components:**
- List of cashier accounts for this store
- Columns: Name, Email, Status, Last Login, Transactions Count
- "Add Cashier" button → form with name and email → sends invite
- Edit / Deactivate per cashier

---

### 4.5 Pages — Marketing Manager

#### Analytics Page (Read-Only)

Same as Super Admin analytics but:
- Cannot export member PII (names, emails hidden in exports)
- Can view aggregated data only

#### Campaigns — Create Campaign

**Form Fields:**
- Campaign name (internal)
- Notification title (what member sees as notification headline)
- Notification body (message text — max 120 characters)
- Target audience segment builder:
  - All members
  - Members expiring in X days
  - Members who visited a specific store
  - Members who haven't visited in X days
  - Members in a specific city
- Estimated audience count (live count updates as filters are applied)
- Schedule: Send now or schedule for a specific date and time
- Deep link destination: Home, Store Detail, Renewal Screen

**Logic:**
- `POST /campaigns`
- Audience count fetched live via `POST /campaigns/estimate-audience`

---

#### Campaign Performance Page

**Components:**
- Table of all past campaigns
- Columns: Campaign Name, Sent Date, Audience Size, Delivered, Opened (open rate %), Renewals Triggered, Store Visits After Campaign
- Click row → Campaign Detail with day-by-day performance chart

---

### 4.6 Shared Pages (All Roles)

#### Login Page
- Email and password fields
- "Forgot Password" → email reset flow
- Role-based redirect after login (Super Admin → Global Overview, Store Admin → Store Overview, etc.)

#### Profile / Account Settings
- View own name, email, role
- Change password
- Two-factor authentication toggle (optional for Super Admin)

---

### 4.7 Role-Based Access Control (Frontend)

| Page / Module | Super Admin | Store Admin | Marketing Manager | Cashier |
|---|---|---|---|---|
| Global Overview | ✅ | ❌ | ❌ | ❌ |
| Store Management | ✅ | Own store only | ❌ | ❌ |
| All Members | ✅ | Own store transactions | ❌ | ❌ |
| Discount Configuration | ✅ (override) | ✅ (own store) | ❌ | ❌ |
| Global Analytics | ✅ | ❌ | ✅ (read-only) | ❌ |
| Campaigns (create) | ✅ | ✅ (own store) | ✅ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ |
| Role Management | ✅ | Cashiers only | ❌ | ❌ |
| Renewal Tracker | ✅ | ✅ | ✅ (read-only) | ❌ |
| Cashier Management | ✅ | ✅ | ❌ | ❌ |

**Implementation:**
- On login, backend returns `role` and `storeId` (if applicable) in JWT payload
- React Router guards check role before rendering protected routes
- API also enforces these restrictions server-side (frontend guards are UI-only convenience, not security)

---

### 4.8 Authentication & Session Handling

- JWT stored in **httpOnly cookies** (not localStorage — prevents XSS attacks)
- accessToken: 15-minute expiry
- refreshToken: 7-day expiry stored in httpOnly cookie
- Axios interceptor handles automatic token refresh on 401
- On logout → `POST /auth/logout` → cookies cleared server-side

---

## 5. Backend Architecture

### 5.1 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (Express) or Python (FastAPI) |
| Database (Primary) | PostgreSQL — relational, ACID compliant |
| Database (Cache) | Redis — session cache, QR token store, rate limiting |
| Cloud Provider | AWS |
| Hosting | AWS ECS (Docker containers) or Lambda (serverless) |
| File Storage | AWS S3 (receipts, exports, profile photos) |
| API Gateway | AWS API Gateway |
| Auth | JWT (access + refresh token pattern) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Email | AWS SES or SendGrid |
| SMS / OTP | Twilio or local SMS gateway |
| Logging | AWS CloudWatch |
| CI/CD | GitHub Actions → AWS CodePipeline |

---

### 5.2 Service Architecture

```
Services:
├── Auth Service          — Registration, login, OTP, token management
├── Member Service        — Profiles, membership status, QR token generation
├── Store Service         — Store CRUD, discount configuration
├── Transaction Service   — POS validation, discount application, sync
├── Campaign Service      — Audience segmentation, push notification delivery
├── Analytics Service     — KPI aggregation, report generation
├── Payment Service       — Gateway integration, membership activation
└── Notification Service  — Push notification scheduling and delivery
```

---

### 5.3 Database Schema

#### `users` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name       VARCHAR(100) NOT NULL
email           VARCHAR(150) UNIQUE NOT NULL
phone           VARCHAR(20)
password_hash   VARCHAR(255) NOT NULL
role            ENUM('super_admin', 'store_admin', 'cashier', 'customer', 'marketing_manager')
store_id        UUID REFERENCES stores(id)  -- NULL for customer and super_admin
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `memberships` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) NOT NULL
member_id       VARCHAR(20) UNIQUE NOT NULL  -- e.g. MUM-004821
status          ENUM('active', 'expired', 'suspended') DEFAULT 'active'
start_date      DATE NOT NULL
expiry_date     DATE NOT NULL
plan_id         UUID REFERENCES membership_plans(id)
payment_ref     VARCHAR(100)  -- gateway transaction reference
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `membership_plans` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(100) NOT NULL       -- e.g. "Annual Membership"
price           DECIMAL(10,2) NOT NULL
currency        VARCHAR(10) DEFAULT 'PKR'
duration_months INTEGER DEFAULT 12
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT NOW()
```

#### `stores` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(150) NOT NULL
address         TEXT NOT NULL
city            VARCHAR(100)
country         VARCHAR(100) DEFAULT 'Pakistan'
latitude        DECIMAL(10,8)
longitude       DECIMAL(11,8)
phone           VARCHAR(20)
operating_hours JSONB  -- { "monday": {"open": "09:00", "close": "22:00"}, ... }
discount_pct    DECIMAL(5,2) NOT NULL  -- store-specific discount percentage
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `store_discount_config` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
store_id        UUID REFERENCES stores(id) NOT NULL
discount_pct    DECIMAL(5,2) NOT NULL
min_allowed     DECIMAL(5,2) NOT NULL  -- HQ-defined floor
max_allowed     DECIMAL(5,2) NOT NULL  -- HQ-defined ceiling
changed_by      UUID REFERENCES users(id)
changed_at      TIMESTAMP DEFAULT NOW()
```

#### `transactions` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
member_id       VARCHAR(20) REFERENCES memberships(member_id)
store_id        UUID REFERENCES stores(id) NOT NULL
cashier_id      UUID REFERENCES users(id)
original_amount DECIMAL(10,2) NOT NULL
discount_pct    DECIMAL(5,2) NOT NULL   -- captured at time of transaction
discount_amount DECIMAL(10,2) NOT NULL
final_amount    DECIMAL(10,2) NOT NULL
discount_type   ENUM('full', 'partial') DEFAULT 'full'
pos_ref         VARCHAR(100)            -- POS system's own transaction ID
created_at      TIMESTAMP DEFAULT NOW()
```

#### `device_tokens` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) NOT NULL
token           TEXT NOT NULL
platform        ENUM('ios', 'android')
is_active       BOOLEAN DEFAULT true
updated_at      TIMESTAMP DEFAULT NOW()
```

#### `campaigns` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(150) NOT NULL
title           VARCHAR(100) NOT NULL
body            VARCHAR(300) NOT NULL
deep_link       VARCHAR(255)
audience_filter JSONB   -- stored segment criteria
audience_count  INTEGER
status          ENUM('draft', 'scheduled', 'sent', 'cancelled')
scheduled_at    TIMESTAMP
sent_at         TIMESTAMP
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMP DEFAULT NOW()
```

#### `audit_logs` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
actor_id        UUID REFERENCES users(id)
action          VARCHAR(100) NOT NULL    -- e.g. 'UPDATE_DISCOUNT', 'SUSPEND_MEMBER'
target_type     VARCHAR(50)             -- e.g. 'store', 'member'
target_id       UUID
old_value       JSONB
new_value       JSONB
ip_address      INET
created_at      TIMESTAMP DEFAULT NOW()
```

#### `otp_tokens` table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id)
code            VARCHAR(10) NOT NULL
type            ENUM('registration', 'password_reset')
expires_at      TIMESTAMP NOT NULL
used            BOOLEAN DEFAULT false
created_at      TIMESTAMP DEFAULT NOW()
```

---

### 5.4 API Endpoints — Mobile App

#### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new customer account | No |
| POST | `/auth/login` | Login, returns access + refresh tokens | No |
| POST | `/auth/verify-otp` | Verify OTP for registration or reset | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| POST | `/auth/refresh` | Refresh access token using refresh token | No |
| POST | `/auth/logout` | Invalidate refresh token | Yes |
| POST | `/auth/forgot-password` | Trigger password reset OTP | No |
| POST | `/auth/reset-password` | Set new password with OTP | No |

#### Member

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/member/status` | Check membership status (active/expired/none) | Yes |
| GET | `/member/dashboard` | Home screen data (savings, expiry, recent txns) | Yes |
| GET | `/member/qr-token` | Get fresh signed QR token (5 min expiry) | Yes |
| GET | `/member/transactions` | Paginated purchase history | Yes |
| GET | `/member/transactions/{id}` | Single transaction detail | Yes |
| PUT | `/member/profile` | Update name, phone | Yes |
| POST | `/member/device-token` | Register push notification device token | Yes |
| PUT | `/member/notification-preferences` | Update notification settings | Yes |

#### Membership

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/membership/plans` | Get active membership plans | Yes |
| POST | `/membership/activate` | Activate membership after payment | Yes |
| GET | `/membership/renewal-info` | Get renewal details and pricing | Yes |
| POST | `/membership/renew` | Process renewal after payment | Yes |

#### Stores

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/stores` | List all active stores with discount % | Yes |
| GET | `/stores/{storeId}` | Single store details | Yes |

#### Campaigns

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/campaigns/active` | Get active promo banners for home screen | Yes |

---

### 5.5 API Endpoints — Admin Dashboard

#### Admin Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/auth/login` | Admin login |
| POST | `/admin/auth/logout` | Admin logout |
| POST | `/admin/auth/forgot-password` | Trigger reset email |

#### Super Admin — Stores

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stores` | List all stores (paginated, filterable) |
| POST | `/admin/stores` | Onboard new store |
| GET | `/admin/stores/{id}` | Store detail |
| PUT | `/admin/stores/{id}` | Update store info |
| DELETE | `/admin/stores/{id}` | Deactivate store |
| PUT | `/admin/stores/{id}/discount` | Override store discount % |

#### Super Admin — Members

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/members` | All members (paginated, filterable) |
| GET | `/admin/members/{memberId}` | Member detail + full history |
| PUT | `/admin/members/{memberId}/suspend` | Suspend member account |
| PUT | `/admin/members/{memberId}/reactivate` | Reactivate member |
| POST | `/admin/members/{memberId}/extend` | Manually extend membership |

#### Super Admin — Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/analytics/overview` | Global KPIs |
| GET | `/admin/analytics/sales` | Sales report (date range, store filter) |
| GET | `/admin/analytics/revenue` | Membership revenue report |
| GET | `/admin/analytics/store-comparison` | Multi-store comparison |
| GET | `/admin/analytics/export` | Export report as CSV |

#### Super Admin — Users & Roles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | All admin users |
| POST | `/admin/users/invite` | Invite new admin user |
| PUT | `/admin/users/{id}/role` | Update user role |
| DELETE | `/admin/users/{id}` | Revoke access |

#### Super Admin — Audit Logs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/audit-logs` | Paginated audit logs (filterable) |
| GET | `/admin/audit-logs/export` | Export audit log as CSV |

#### Store Admin — Store Scoped

| Method | Endpoint | Description |
|---|---|---|
| GET | `/store/overview` | Store KPIs dashboard |
| GET | `/store/transactions` | Transactions at this store |
| PUT | `/store/discount` | Update store discount % |
| GET | `/store/renewals` | Members expiring (7/30 days) |
| GET | `/store/cashiers` | Cashier list for this store |
| POST | `/store/cashiers` | Add cashier |
| DELETE | `/store/cashiers/{id}` | Deactivate cashier |

#### Campaigns

| Method | Endpoint | Description |
|---|---|---|
| GET | `/campaigns` | List all campaigns (scoped by role) |
| POST | `/campaigns` | Create campaign |
| POST | `/campaigns/estimate-audience` | Live audience count for segment |
| GET | `/campaigns/{id}` | Campaign detail + performance |
| DELETE | `/campaigns/{id}` | Cancel draft/scheduled campaign |

---

### 5.6 API Endpoints — POS Integration

These endpoints are called by the store's POS system, not by the mobile app or dashboard. They use an API key issued per store (not JWT).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/pos/validate` | Validate QR token or Member ID |
| POST | `/pos/transaction` | Record completed transaction |
| GET | `/pos/store-config` | Get store's current discount % |

#### `POST /pos/validate` — Request

```json
{
  "storeId": "uuid-of-store",
  "qrToken": "base64-encoded-token",   // preferred
  "memberId": "MUM-004821"              // fallback if qrToken absent
}
```

#### `POST /pos/validate` — Response

```json
{
  "valid": true,
  "memberName": "Ayesha Khan",
  "memberId": "MUM-004821",
  "discountPct": 12.0,
  "membershipExpiry": "2027-02-13",
  "message": "Active member. Apply 12% discount."
}
```

```json
{
  "valid": false,
  "reason": "expired",                  // or "not_found", "suspended", "invalid_token"
  "message": "Membership expired on 2026-01-01. Inform customer to renew.",
  "renewalPrompt": true
}
```

#### `POST /pos/transaction` — Request

```json
{
  "storeId": "uuid-of-store",
  "memberId": "MUM-004821",
  "cashierId": "uuid-of-cashier",
  "originalAmount": 3500.00,
  "discountPct": 12.0,
  "discountAmount": 420.00,
  "finalAmount": 3080.00,
  "discountType": "full",               // or "partial"
  "posRef": "POS-TXN-00192"
}
```

---

### 5.7 POS Integration Flow

```
Customer presents QR / Member ID at cashier
              │
              ▼
     POS calls POST /pos/validate
     (using store API key in header)
              │
              ▼
    Backend receives request
    ├── If qrToken present:
    │     └── Verify HMAC signature
    │     └── Check token not expired (< 5 min old)
    │     └── Extract memberId from token
    ├── If memberId only:
    │     └── Look up directly in memberships table
    │
    └── Check membership status in DB
          ├── Active → return valid=true, discountPct from stores table
          ├── Expired → return valid=false, reason=expired
          └── Suspended → return valid=false, reason=suspended
              │
              ▼
    POS receives response
    ├── valid=true  → auto-applies discountPct to transaction total
    └── valid=false → shows cashier the reason message
              │
              ▼
    Transaction completed
              │
              ▼
    POS calls POST /pos/transaction
    (records the completed sale)
              │
              ▼
    Backend saves to transactions table
    Backend queues push notification to member
    Backend updates member's savings total
```

---

### 5.8 Payment Gateway Integration

**Membership Purchase Flow:**

```
Customer taps "Confirm & Pay" in app
          │
          ▼
Payment Gateway SDK initialised client-side
(`@stripe/stripe-react-native` or local gateway e.g. JazzCash / EasyPaisa RN SDK)
          │
          ▼
App calls backend: POST /membership/create-payment-intent
          │
          ▼
Backend creates payment session with gateway
Returns: { clientSecret, sessionId }
          │
          ▼
App SDK completes payment using clientSecret
Gateway processes card / wallet
          │
     ┌────┴────┐
     │         │
  Success    Failure
     │         │
     ▼         ▼
App calls   App shows
POST        error, user
/membership/ retries
activate
{paymentRef}
     │
     ▼
Backend verifies payment with gateway API
(webhook or direct check)
     │
     ▼
Membership activated in DB
Member ID generated
Push notification sent: "Welcome, your membership is active!"
     │
     ▼
App navigates to QR Card Screen
```

**Renewal uses identical flow via `POST /membership/renew`**

---

### 5.9 Push Notification Service

**Architecture:**

```
Trigger (scheduled job or API event)
          │
          ▼
Campaign / Notification Service
queries audience from DB
          │
          ▼
Fetches device tokens from device_tokens table
          │
          ▼
Sends to Firebase Admin SDK
          │
     ┌────┴─────────┐
     │              │
  Android (FCM)  iOS (APNs)
  via Firebase   via Firebase
```

**Scheduled Jobs (Cron):**

| Job | Schedule | Action |
|---|---|---|
| Expiry reminder (30 days) | Daily 09:00 | Query members expiring in 30 days, send notification |
| Expiry reminder (7 days) | Daily 09:00 | Query members expiring in 7 days, send notification |
| Expiry reminder (day of) | Daily 08:00 | Query members expiring today, send notification |
| Post-transaction notification | On event | Triggered immediately after transaction recorded |

---

### 5.10 Security Architecture

#### Authentication & Authorisation
- All app endpoints require `Authorization: Bearer {accessToken}` header
- POS endpoints use `X-Store-API-Key: {apiKey}` header — key issued per store
- Backend validates role from JWT on every admin endpoint
- Store-scoped endpoints cross-check `storeId` in JWT against the requested resource

#### Data Encryption
- Passwords: bcrypt hashed (cost factor 12) — never stored in plaintext
- Tokens: stored in `react-native-keychain` (iOS Keychain / Android Keystore) on mobile / httpOnly cookies (dashboard)
- Database: encrypted at rest (AWS RDS encryption enabled)
- Transit: TLS 1.2+ enforced on all endpoints
- QR tokens: HMAC-SHA256 signed with a rotating server secret

#### Rate Limiting
- Login endpoint: 5 attempts per IP per 15 minutes → temporary block
- OTP endpoint: 3 attempts per user per 10 minutes
- POS validate endpoint: 60 requests per store per minute
- General API: 100 requests per user per minute

#### Input Validation
- All inputs validated and sanitised server-side
- SQL injection prevented via parameterised queries (ORM-enforced)
- XSS prevention via output encoding in dashboard

---

### 5.11 Audit Logging

Every sensitive action writes a record to `audit_logs`:

| Action | Logged When |
|---|---|
| `UPDATE_DISCOUNT` | Store Admin or Super Admin changes discount % |
| `SUSPEND_MEMBER` | Super Admin suspends a member account |
| `REACTIVATE_MEMBER` | Reactivation of suspended account |
| `ONBOARD_STORE` | New store added |
| `DEACTIVATE_STORE` | Store set inactive |
| `INVITE_USER` | New admin user invited |
| `REVOKE_ACCESS` | Admin user access revoked |
| `FORCE_RENEW` | Manual membership extension |
| `CAMPAIGN_SENT` | Campaign dispatched |
| `EXPORT_DATA` | Any CSV or report export |

---

## 6. Third-Party Integrations

| Service | Purpose | Provider Options |
|---|---|---|
| Payment Gateway | Membership purchase and renewal | Stripe, JazzCash, EasyPaisa, HBL Pay |
| Push Notifications | Member alerts and campaigns | Firebase Cloud Messaging + APNs |
| SMS / OTP | Registration and password reset | Twilio, Telenor WhatsApp API, local SMS gateway |
| Email | Admin invites, receipts, renewal reminders | AWS SES, SendGrid |
| Maps | Store location display in app | Google Maps SDK |
| Analytics (internal) | App usage and event tracking | Firebase Analytics |
| Cloud Infrastructure | Hosting, DB, storage, gateway | AWS (ECS, RDS, S3, API Gateway, SES, CloudWatch) |

---

## 7. KPIs & Analytics

These metrics are tracked in real-time and surfaced in the admin dashboard:

| KPI | Definition | Where Tracked |
|---|---|---|
| Active Members | Count of memberships with status = active | Global Overview, Store Overview |
| Renewal Rate | (Renewed this period / Expired this period) × 100 | Global Overview |
| Member Sales Ratio | Member transactions / Total transactions × 100 | Store Overview |
| Revenue from Memberships | Sum of all membership payments in period | Global Analytics |
| Average Basket Uplift | Avg member spend − Avg non-member spend | Store Comparison |
| Discount Given | Total discount amount applied across all stores | Global & Store Analytics |
| Campaign Open Rate | Notifications opened / Notifications delivered × 100 | Campaign Performance |
| Renewals Triggered | Renewals completed within 7 days of a campaign | Campaign Performance |
| Churn Rate | Members not renewing within 30 days of expiry | Membership Revenue Report |

---

## 8. Error Handling & Edge Cases

| Scenario | System Behaviour |
|---|---|
| QR scanned but token expired | POS falls back to Member ID validation automatically |
| Member ID not found | POS shows "Member not found — verify ID with customer" |
| Membership expired at scan | POS shows expiry date and renewal prompt message |
| Member account suspended | POS shows "Account suspended — direct customer to support" |
| POS offline during scan | POS uses last-cached store discount % and allows transaction; flags for reconciliation on reconnect |
| Payment gateway timeout | App shows retry prompt; no membership activated until payment confirmed |
| Duplicate transaction submitted | Backend checks `posRef` uniqueness — duplicate silently ignored |
| Store admin sets discount outside HQ range | API rejects request with validation error: "Discount must be between X% and Y%" |
| Push notification delivery failure | Firebase retries up to 3 times; undelivered logged in notification service |
| Member uninstalls app | Device token marked inactive after first failed delivery attempt |
| OTP not received | User can request resend after 60 seconds; max 3 resends before support escalation |

---

*Mumuso Paid Membership & Loyalty App — Technical Specification v1.0*  
*Confidential — Internal Use Only*
