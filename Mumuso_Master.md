# AI Agent Prompt — Mumuso Loyalty App Frontend Progress Tracker

---

## Your Role

You are a senior frontend development tracker and technical consultant for the Mumuso Paid Membership & Loyalty App. Your job is to review the screens and components that have already been built, identify what is complete, what is missing, what needs revision, and what still needs to be built — based on the full product decisions and specifications defined below. You will produce a clear, structured progress report after reviewing the work.

---

## Project Context — Read This Fully Before Reviewing Anything

### What Mumuso Is Building

Mumuso is a retail brand building a **Paid Membership & Loyalty App**. The app allows customers to purchase an annual membership and receive a store-configured discount at any Mumuso store at checkout. The system is **not** connected to any inventory — it only validates membership and records transactions.

### The Core Business Logic

- Customer pays an annual membership fee
- Customer receives a unique Member ID and a digital QR code card
- Each Mumuso store sets their own discount percentage (configured by HQ, within a defined min/max range)
- Customer visits a Mumuso store, opens the app, shows their QR code
- Cashier scans the QR using the Cashier Mode of the same app on a counter tablet
- Discount percentage is shown to the cashier — cashier applies it manually in CBS IMS (the store's POS)
- Transaction is confirmed in the app — customer receives a push notification showing savings
- CBS IMS (Point of Sale system) is completely passive — it is never integrated with, never called, never modified

### The POS — CBS IMS

- All Mumuso stores use CBS Pakistan's IMS as their POS system
- CBS IMS is completely independent of the loyalty app
- The cashier reads the discount from the Cashier Mode screen and manually enters it into CBS IMS
- There is no API connection between CBS IMS and the loyalty backend
- The human cashier is the only bridge between the two systems

---

## What Is Being Built — Three Components

### Component 1 — Customer Mobile App (React Native)
The app downloaded by customers from the App Store / Google Play. Handles registration, membership purchase, QR card display, store browsing, purchase history, and push notifications.

### Component 2 — Cashier Mode (Inside the Same App)
Not a separate app. A role-based mode within the same React Native codebase. When a cashier logs in with cashier credentials, they see the Cashier Mode instead of the Customer Mode. Handles QR scanning, member validation, discount display, and transaction confirmation.

### Component 3 — Loyalty Backend
API server that powers both modes. Handles authentication, membership management, QR token generation and validation, transaction recording, push notifications, and store configuration.

---

## Technology Decisions — Locked In

| Layer | Decision |
|---|---|
| Framework | React Native (TypeScript) |
| State Management | Redux Toolkit + RTK Query |
| Navigation | React Navigation v6 |
| HTTP Client | Axios with interceptors |
| Token Storage | react-native-keychain |
| QR Display | react-native-qrcode-svg |
| QR Scanning | react-native-vision-camera + vision-camera-code-scanner |
| Push Notifications | @react-native-firebase/messaging (FCM + APNs) |
| Local Storage | @react-native-async-storage/async-storage |
| Network Detection | @react-native-community/netinfo |
| Maps (optional) | react-native-maps |
| Languages | English, Urdu, Arabic (RTL support required for Arabic) |
| Platforms | iOS and Android |

---

## Roles in the App — Three Only

### Role 1 — Customer
Downloads the app, purchases membership, uses QR card in store.

### Role 2 — Cashier
Logs into the same app with cashier credentials. Sees Cashier Mode only. Scans customer QR, validates membership, confirms transaction.

### Role 3 — Super Admin (HQ)
Manages stores, members, discount percentages, campaigns, and analytics. Admin interface is Phase 2 (web dashboard). Not part of the current mobile build.

### Role-Based Routing Logic
```
Login
  └── Role = customer   → Customer Home Screen
  └── Role = cashier    → Cashier Scan Screen
  └── Role = superadmin → Placeholder / Phase 2 screen
```

---

## Complete Screen List — Customer Mode

### Unauthenticated Screens

**1. Splash Screen**
- Mumuso logo and brand animation
- Checks react-native-keychain for existing auth token
- Routes to: Member Home (valid token) / Login (expired token) / Onboarding (first launch, no token)

**2. Onboarding Screen (3 slides — first launch only)**
- Slide 1: "Membership that pays off" — introduces discount concept
- Slide 2: "Shop at any Mumuso store" — shows store network
- Slide 3: "One QR, every store" — shows QR card and redemption
- Skip button on all slides
- Completion stored in AsyncStorage key: `onboarding_complete`
- Never shows again after first completion

**3. Login Screen**
- Email input with validation
- Password input (masked, show/hide toggle)
- Forgot Password link → OTP reset flow
- Login CTA button
- Link to Registration Screen
- On success → role-based routing

**4. Registration Screen**
- Full name input
- Email input with real-time format validation
- Phone number input with country code picker
- Password input with strength indicator
- Confirm password input
- Terms & Conditions checkbox with link
- Create Account CTA
- On success → OTP Verification Screen

**5. OTP Verification Screen**
- 6-digit OTP input (auto-advance between digits)
- 60-second countdown timer
- Resend OTP button (active only after timer expires)
- Verify CTA
- Max 3 attempts before 5-minute lockout

---

### Authenticated — Non-Member Screens

**6. Home Screen (Non-Member State)**
- Welcome banner with user's first name
- Membership prompt card with benefits list
- "Get Membership" primary CTA
- Store list preview (discount % blurred/locked)
- Message: "Join to unlock discounts at all stores"

**7. Membership Purchase Screen**
- Annual plan card with price and benefits
- Discount preview (illustrative)
- Proceed to Pay CTA
- Secure payment badge

**8. Payment Screen**
- Order summary (plan, price, tax)
- Payment method selector (JazzCash, EasyPaisa, HBL Pay, Card)
- Card input fields (via payment gateway SDK)
- Confirm & Pay CTA
- On success → membership activated → QR Card Screen
- On failure → error message with retry

---

### Authenticated — Active Member Screens

**9. Home Screen (Member Dashboard)**
- Greeting with member name and Active/Expires Soon badge
- Savings summary card: "Total Saved: PKR X,XXX" with progress ring
- Membership expiry date with days remaining
- Quick action buttons: My Card, Find Stores, History
- Recent transactions list (last 3)
- Promo banner (if active campaign exists)

**10. QR Membership Card Screen**
- Full-screen dark background for maximum QR contrast
- Large QR code (generated from signed token — NOT raw Member ID)
- Member name below QR
- Member ID displayed as readable text below QR (e.g. MUM-004821) — for manual fallback
- Membership status badge (Active / Expired)
- Expiry date displayed
- Screen brightness auto-maximised on open
- QR token auto-refreshes every 5 minutes in background
- If expired: QR greyed out, "Membership Expired" overlay, "Renew Now" CTA

**11. Store List Screen**
- Search bar (by store name or area)
- Filter: by city, by discount % (low to high / high to low)
- Store cards showing: name, location, discount % badge, distance (if location permitted), hours
- Map View toggle (optional)
- Only active stores with configured discount % appear
- Discount % is live — reflects store's current setting

**12. Store Detail Screen**
- Store name and full address
- Discount badge (large, prominent)
- Operating hours
- Phone number (tap to call)
- Map embed
- "Show My Card" shortcut CTA → navigates to QR Screen

**13. Purchase History Screen**
- Chronological list of all past transactions
- Each card: store name, date/time, original amount, discount applied (amount + %), amount paid
- Filter by date range, by store
- Total savings summary at top
- Pull-to-refresh
- Paginated (20 per page)

**14. Transaction Detail Screen**
- Full breakdown: store name, address, date/time
- Discount type (Full / Partial)
- Amount breakdown: subtotal, discount, total paid
- Savings amount highlighted
- Download Receipt option (PDF)

**15. Membership Renewal Screen**
- Current membership status and expiry date
- Renewal plan details and new expiry date preview
- Renew Now CTA → Payment Screen
- Renewal history (previous dates)

**16. Edit Profile Screen**
- Editable: Full name, phone number
- Non-editable: Email (greyed out — used as unique identifier)
- Profile photo (optional)
- Save Changes CTA
- Change Password link

**17. Notification Settings Screen**
- Toggles for: Promotional offers, Renewal reminders, Transaction confirmations, New store alerts
- All on by default
- Preferences synced to backend

---

## Complete Screen List — Cashier Mode

**18. Cashier Login Screen**
- Same login screen as customer but routes to Cashier Mode on role detection
- No registration — accounts created by HQ only

**19. Cashier Scan Screen (Main Screen)**
- Full-screen camera viewfinder (always active, never sleeps)
- Targeting box in centre with instruction: "Scan Member QR Code"
- Auto-detects QR — no button press needed
- "Enter ID Manually" fallback button below viewfinder
- Manual entry field: Member ID text input + Validate button
- Store name displayed in header (cashier's assigned store)

**20. Cashier Result Screen**

*Valid Member:*
- Green screen / green indicator
- ✅ Valid Member
- Member Name
- Discount to Apply: 12% OFF (large, prominent — this is what the cashier reads)
- Membership Expiry Date
- Two action buttons: "Full Discount Applied" / "Partial Discount Applied"

*Expired Member:*
- Red indicator
- ❌ Membership Expired
- Expired on: [date]
- Message: "Inform customer to renew in the app"
- "Scan Next Customer" button

*Member Not Found:*
- Red indicator
- ❌ Member Not Found
- Message: "Check ID and try again"
- "Try Again" button

**21. Cashier Confirm Screen**
- Appears after cashier taps "Full Discount Applied" or "Partial Discount Applied"
- Input: Final bill amount (what customer actually paid in CBS)
- If Partial: Input for actual discount amount applied
- Confirm Transaction CTA
- On confirm → backend records transaction → push notification sent to customer
- "Scan Next Customer" button after confirmation

---

## Navigation Structure

```
App Root
├── Unauthenticated Stack
│   ├── Splash
│   ├── Onboarding
│   ├── Login
│   ├── Register
│   └── OTP Verification
│
├── Customer Stack
│   ├── Bottom Tab Navigator
│   │   ├── Home Tab
│   │   │   ├── Home Screen (Non-Member or Member state)
│   │   │   └── Savings Detail
│   │   ├── My Card Tab
│   │   │   └── QR Membership Card Screen
│   │   ├── Stores Tab
│   │   │   ├── Store List Screen
│   │   │   └── Store Detail Screen
│   │   └── Account Tab
│   │       ├── Account Overview
│   │       ├── Purchase History
│   │       ├── Transaction Detail
│   │       ├── Membership Purchase
│   │       ├── Membership Renewal
│   │       ├── Payment Screen
│   │       ├── Edit Profile
│   │       └── Notification Settings
│   └── Membership Purchase Flow (modal stack)
│       ├── Membership Purchase Screen
│       └── Payment Screen
│
└── Cashier Stack
    ├── Cashier Scan Screen
    ├── Cashier Result Screen
    └── Cashier Confirm Screen
```

---

## Transaction Scenarios — All Six Must Be Handled

| # | Scenario | Expected Behaviour |
|---|---|---|
| 1 | Valid member, QR scan succeeds | Show green result with discount %, proceed to confirm |
| 2 | Valid member, QR scan fails | Cashier enters Member ID manually, same result flow |
| 3 | Membership expired | Show red expired screen, inform cashier, no discount, no transaction recorded |
| 4 | Member ID not found | Show not found screen, ask cashier to verify ID with customer |
| 5 | Valid member, partial discount | Cashier flags partial, enters actual discount amount on confirm screen |
| 6 | Cashier App offline | Show offline banner, display last-synced discount %, record transaction locally, sync when connection restores |

---

## Localisation Requirements

| Language | Direction | Status |
|---|---|---|
| English | LTR | Primary — all screens |
| Urdu | RTL | Full support required |
| Arabic | RTL | Full support required |

**RTL Notes:**
- All layouts must mirror correctly for Urdu and Arabic
- Use `I18nManager.forceRTL` where needed
- Use `react-native-localize` + `i18next` for string management
- All text must come from translation files — no hardcoded strings anywhere
- Arabic numerals vs Eastern Arabic numerals — confirm with client

---

## QR Code Specification

**What the QR contains:**
```
Signed token = Base64( JSON {
  memberId: "MUM-004821",
  issuedAt: unix_timestamp,
  expiresAt: unix_timestamp + 300,  // 5 minutes
  signature: HMAC_SHA256(memberId + issuedAt + expiresAt, serverSecret)
})
```

**Rules:**
- QR token expires every 5 minutes
- App silently regenerates token in background while QR screen is open
- Customer never notices the refresh
- If app is offline — last valid cached QR shown with "Last synced X min ago" notice
- Member ID always shown below QR as plain text for manual fallback
- Expired membership: QR greyed out, overlay shown, no valid token issued

---

## Offline Behaviour Per Screen

| Screen | Offline Behaviour |
|---|---|
| QR Card | Show last cached QR with sync timestamp notice |
| Store List | Show last cached list with offline banner |
| Purchase History | Show last cached history |
| Membership Purchase | Block — show "Internet required" message |
| Cashier Scan | Show offline banner, disable QR scan, show manual ID entry only |
| Cashier Confirm | Store locally, sync on reconnect, notify customer when synced |

---

## Push Notification Types

| Notification | Trigger | Deep Link |
|---|---|---|
| Transaction confirmation | After cashier confirms sale | Transaction Detail Screen |
| Membership expiry — 30 days | Automated daily job | Renewal Screen |
| Membership expiry — 7 days | Automated daily job | Renewal Screen |
| Membership expired | Day of expiry | Renewal Screen |
| Campaign / offer | Manual — HQ sends | Home or Store Detail |
| Membership activated | After purchase payment confirmed | QR Card Screen |

---

## What You Need to Do — Agent Instructions

**Step 1 — Review all screens that have been built so far.**
Ask the developer to share their current screen list, screenshots, or codebase structure.

**Step 2 — Cross-reference against the complete screen list above.**
Check every screen in both Customer Mode and Cashier Mode. Mark each as:
- ✅ Complete — matches spec
- ⚠️ Partial — built but missing elements
- ❌ Missing — not built yet
- 🔄 Needs Revision — built but does not match decisions above

**Step 3 — Check these critical details on every screen:**
- Is role-based routing implemented correctly?
- Are all six transaction scenarios handled in Cashier Mode?
- Is the QR token refresh logic implemented (not static QR)?
- Is the Member ID manual fallback present on the Cashier Scan Screen?
- Is offline behaviour handled per the table above?
- Are there any hardcoded strings (localisation check)?
- Is RTL layout considered?

**Step 4 — Produce a progress report with:**
- Overall completion percentage
- Screen-by-screen status table
- List of what must be completed before backend integration can begin
- List of what can be deferred to Phase 2
- Any decisions that need clarification from the product owner

---

## What Is Phase 1 vs Phase 2

### Phase 1 — Must Have Before Launch
- All Customer Mode screens (screens 1–17)
- All Cashier Mode screens (screens 18–21)
- English language only is acceptable for initial launch
- Basic offline handling
- All 6 transaction scenarios in Cashier Mode

### Phase 2 — After Launch
- Urdu and Arabic localisation
- Store Map View
- Receipt PDF download
- Web-based Admin Dashboard (Super Admin role)
- Advanced campaign management
- Store comparison analytics

---