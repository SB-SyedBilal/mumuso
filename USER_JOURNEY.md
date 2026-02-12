# MUMUSO LOYALTY APP — DETAILED USER JOURNEY

**Last Updated**: February 12, 2026

This document maps out every path a user takes through the Mumuso Loyalty App, from first launch to long-term engagement. It covers the primary happy path, alternative flows, and edge cases.

---

## JOURNEY OVERVIEW (At a Glance)

```
FIRST-TIME USER                         RETURNING USER
─────────────                           ──────────────
Splash Screen (2.5s)                    Splash Screen (2.5s)
      │                                       │
Onboarding (3 slides)                   ┌─────┴─────┐
      │                                 │           │
Auth Choice                          Logged In   Logged Out
      │                                 │           │
 ┌────┴────┐                       Home Dashboard  Auth Choice
 │         │                            │           │
Register  Login ◄───────────────────────┘        Login
 │                                      │
OTP Verify                         [Main App Loop]
 │                                 Home ↔ Card ↔ History ↔ Profile
Membership Purchase                     │
 │                                 Sub-screens:
Payment Processing                 Notifications, Stores, Referral,
 │                                 Renewal, Help, Edit Profile,
Membership Success                 Change Password, QR Help,
 │                                 Transaction Detail
Home Dashboard
```

---

## PHASE 1: FIRST LAUNCH & ONBOARDING

### Step 1.1 — Splash Screen
- **What the user sees**: Mumuso logo centered on a branded background with a loading indicator and app version number at the bottom.
- **Duration**: ~2.5 seconds.
- **Behind the scenes**: The app checks AsyncStorage for existing auth state (`isLoggedIn`) and whether onboarding has been completed (`hasSeenOnboarding`).
- **Outcome**:
  - First-time user → Onboarding Screen
  - Returning user (logged out) → Auth Choice Screen
  - Returning user (logged in) → Home Dashboard

### Step 1.2 — Onboarding Carousel (First-Time Only)
The user swipes through **3 slides** explaining the app's value:

| Slide | Headline | Message |
|-------|----------|---------|
| 1 | Join Mumuso Membership | Pay once, save all year with 10% off on every purchase |
| 2 | Shop & Save Instantly | Show your QR code at checkout and get automatic discounts |
| 3 | Track Your Savings | View your purchase history and see how much you've saved |

- **User actions**: Swipe through slides, tap "Next", or tap "Skip" (top-right) to jump ahead.
- **Final slide CTA**: "Get Started" button.
- **Outcome**: Onboarding completion is persisted to AsyncStorage (never shown again). User lands on **Auth Choice Screen**.

---

## PHASE 2: AUTHENTICATION

### Step 2.1 — Auth Choice Screen
- **What the user sees**: Mumuso logo, tagline "Your Loyalty Rewards Await", and two buttons:
  - **"Create Account"** (primary, prominent)
  - **"I Already Have an Account"** (secondary, outlined)
- **Decision point**: New users → Register. Existing users → Login.

---

### PATH A: NEW USER REGISTRATION

#### Step 2.2a — Registration Screen
The user fills out a comprehensive form:

| Field | Type | Validation |
|-------|------|------------|
| Full Name | Text | Min 2 chars, letters only |
| Phone Number | Tel (+92 prefix) | Valid Pakistani number (11 digits) |
| Email | Email | Valid email format |
| Date of Birth | Date picker | Must be 13+ years old |
| Gender | Dropdown | Male / Female / Other / Prefer not to say (optional) |
| City | Dropdown | 20 Pakistani cities pre-populated |
| Password | Password (show/hide toggle) | 8+ chars, 1 uppercase, 1 lowercase, 1 number |
| Confirm Password | Password | Must match password |

- **Additional requirements**: User must check "I agree to Terms & Conditions and Privacy Policy".
- **Real-time feedback**: Password strength indicator (Weak → Fair → Good → Strong), inline error messages on invalid fields.
- **CTA**: "Create Account" button (enabled only when entire form is valid).
- **Error scenarios**:
  - Invalid fields highlighted in red with inline messages.
  - Duplicate phone/email: "This phone number is already registered. Please login."
- **Outcome**: On success → OTP Verification Screen.

#### Step 2.3a — OTP Verification
- **What the user sees**: "Verify Your Phone Number" title, description showing the masked phone number, and **6 individual digit input boxes**.
- **UX details**:
  - Auto-focus advances to next box after each digit.
  - Auto-submits when all 6 digits are entered.
  - 59-second countdown timer before "Resend Code" becomes available.
  - "Change number" link to go back.
- **Error handling**:
  - Invalid OTP: "Invalid code. Please try again."
  - After **3 failed attempts**: Input locked for 5 minutes.
- **Outcome**: On success → Membership Purchase Screen.

---

### PATH B: EXISTING USER LOGIN

#### Step 2.2b — Login Screen
- **Fields**: Phone number or email + Password (with show/hide toggle).
- **Additional links**: "Forgot Password?" and "Don't have an account? Sign Up".
- **Error handling**:
  - Wrong credentials: "Incorrect phone/email or password."
  - After **5 failed attempts**: Account locked for 15 minutes.
- **Outcome**: On success → Home Dashboard (skips membership purchase since already a member).

#### Step 2.3b — Forgot Password (if needed)
- **Flow**: User enters phone number or email → Receives reset link → Success confirmation displayed.
- **Outcome**: User returns to Login Screen to sign in with new password.

---

## PHASE 3: MEMBERSHIP PURCHASE (New Users)

### Step 3.1 — Membership Purchase Screen
After registration and OTP verification, the user is presented with the membership offer.

- **Hero section**: Gradient header with "Become a Mumuso Member" and "Unlock exclusive benefits".
- **Benefits displayed**:
  - 10% Discount on all eligible purchases
  - Save Money all year long
  - Exclusive member-only offers
  - Track all purchases in one place
  - Priority customer support
- **Pricing**:
  - **Rs. 2,000/year** (prominently displayed)
  - Monthly breakdown: "That's just Rs. 167 per month!"
  - Break-even: "Break-even after just Rs. 20,000 in purchases"
- **Payment method selection** (radio buttons with logos):
  - JazzCash
  - EasyPaisa
  - Credit/Debit Card
  - Bank Transfer
- **Promo code**: Expandable field — currently validates "WELCOME10" for a discount.
- **Terms checkbox**: Required before proceeding.
- **CTA**: "Pay Rs. 2,000 & Activate Membership".

### Step 3.2 — Payment Processing Screen
- **What the user sees**: Secure lock icon, "Secure Payment" title, loading animation, "Processing your payment..." text.
- **States**:
  - **Processing**: Animated loader.
  - **Success**: Checkmark animation → auto-navigates to Success Screen.
  - **Failed**: Error message with two options — "Retry Payment" or "Change Payment Method" (returns to purchase screen).

### Step 3.3 — Membership Success Screen
- **What the user sees**: Celebration animation, "Welcome to Mumuso Membership!" title.
- **Key information displayed**:
  - Member ID (e.g., `MUM-48291`)
  - Member Since date
  - Valid Until date (1 year from purchase)
  - Membership Status: Active
- **Next steps guidance**: "Start shopping and show this QR code at checkout."
- **CTAs**: "View My Membership Card" or "Start Shopping".
- **Auto-navigation**: Redirects to Home Dashboard after 10 seconds if no action taken.

---

## PHASE 4: MAIN APP EXPERIENCE (Post-Login)

Once authenticated and membership is active, the user enters the main app with a **Bottom Tab Navigator** containing 4 tabs:

```
┌──────────┬──────────┬──────────┬──────────┐
│   Home   │ My Card  │ History  │ Profile  │
│   🏠     │   💳     │   📋     │   👤     │
└──────────┴──────────┴──────────┴──────────┘
```

---

### TAB 1: HOME DASHBOARD

The central hub of the app. Here's what the user sees top-to-bottom:

1. **Header**: Greeting ("Hello, Ayesha!"), "Welcome back" subtitle, notification bell with unread count badge.

2. **Renewal Banner** (conditional): If membership expires within 30 days, a yellow warning banner appears: "Membership expires in X days. Renew now!" — tapping navigates to Renewal Screen.

3. **Membership Card Preview**: A gradient card showing:
   - Brand name "MUMUSO"
   - Member name
   - Member ID (e.g., MUM-48291)
   - Status (Active/Expired)
   - Expiry date
   - Tapping navigates to **My Card** tab.

4. **Quick Stats** (two cards side by side):
   - **Total Saved**: e.g., Rs. 4,850
   - **Purchases**: e.g., 23

5. **Quick Actions** (4 buttons in a row):
   | Action | Navigates To |
   |--------|-------------|
   | History | History Tab |
   | Stores | Store Locator Screen |
   | Refer | Referral Screen |
   | Support | Help & Support Screen |

6. **Recent Purchases**: Last 3 transactions showing store name, date, total amount, and discount saved (highlighted in green). "View All" link navigates to History tab.

---

### TAB 2: MY CARD (Digital Membership Card)

The screen the user shows at checkout.

- **Card Front** (default view):
  - Mumuso branding
  - Member name & Member ID
  - **Large QR code** (generated from member ID via `react-native-qrcode-svg`)
  - Validity date & Active/Expired status badge
  - "Tap to enlarge QR" — opens full-screen QR overlay

- **Card Back** (toggle flip):
  - Membership benefits summary
  - Terms & conditions link
  - Customer service number
  - Emergency contact: "Card not working? Call XXX-XXXXXXX"

- **If membership is expired**:
  - QR code is grayed out with "EXPIRED" overlay
  - "Renew Membership" button appears, linking to Renewal Screen

- **QR Help link**: Navigates to QR Help Screen for troubleshooting.

**In-Store Usage Flow**:
```
User opens My Card tab
        │
Shows QR code to cashier
        │
Cashier scans QR with CBS POS system
        │
System validates active membership
        │
10% discount auto-applied to eligible items
        │
Transaction logged & synced to app
        │
User receives notification: "You saved Rs. XXX!"
```

---

### TAB 3: HISTORY (Purchase History)

- **Summary cards at top**: Total Spent and Total Saved this year.
- **Filter options**: By period (7 days, 30 days, 3 months, All time) and sort (Newest, Oldest, Amount).
- **Transaction list**: Each card shows:
  - Date & time
  - Store name
  - Number of items
  - Original amount (struck through)
  - Discount applied (green)
  - Final amount paid (bold)
  - Payment method icon
- **Tap any transaction** → **Transaction Detail Screen** (full receipt view):
  - Store info & address
  - Transaction ID
  - Itemized list (name, qty × unit price, line total)
  - Calculation breakdown (subtotal, member discount 10%, tax, total)
  - Savings highlight: "You saved Rs. XXX with your membership!"
  - Payment method & Member ID used
- **Empty state**: Illustration + "No purchases yet" + "Find Nearest Store" CTA.
- **Pull-to-refresh**: Refreshes transaction list.

---

### TAB 4: PROFILE & SETTINGS

Organized in sections:

1. **Profile header**: Avatar, name, Member ID, "Member since" date.

2. **Membership Status Card**: Visual indicator (green = active, yellow = expiring, red = expired), status text, expiry date, "Renew Now" button if expiring within 30 days.

3. **Personal Information**: Email, phone, DOB, gender, city — each with edit icon.

4. **Membership Settings**:
   - Auto-Renew toggle
   - Renewal Reminders toggle

5. **App Settings**:
   - Notification Settings
   - Language (English / Urdu — not yet supported)
   - Dark Mode toggle (not yet supported)

6. **Support & Legal**:
   - Privacy Policy
   - Terms & Conditions
   - Help & Support → Help Screen
   - About App

7. **Account Actions**:
   - Change Password → Change Password Screen
   - Delete Account (red, with confirmation dialog)
   - **Logout** (red outlined button, with confirmation: "Are you sure you want to logout?")

---

## PHASE 5: SUB-SCREENS & SECONDARY FLOWS

### 5.1 — Edit Profile
- Pre-filled form with current user data (name, email, DOB, gender, city).
- "Save" button enabled only when changes are detected.
- Email change triggers re-verification warning.
- Navigates back to Profile on save.

### 5.2 — Change Password
- Fields: Current Password, New Password, Confirm New Password.
- Same password validation rules as registration (8+ chars, uppercase, lowercase, number).
- Password strength indicator included.

### 5.3 — Notifications Center
- List of all notifications with **read/unread indicators** (blue dot for unread).
- **Filter by category**: All, Membership, Transactions, Offers, System.
- **Actions**:
  - Tap → marks as read + navigates to relevant screen (e.g., transaction notification → Transaction Detail).
  - Long press → delete notification.
  - "Mark All as Read" button in header.
- **Notification types**:
  - Membership: Welcome, renewal reminders, auto-renewal confirmations.
  - Transaction: Purchase confirmations with savings amount.
  - Promotional: Weekend sales, birthday offers, new store openings.
  - System: App updates, maintenance notices.

### 5.4 — Store Locator
- **Search bar**: Filter by area, store name, or city.
- **Store list** (sorted by distance): Each store shows:
  - Name & full address
  - Distance (e.g., "2.3 km away")
  - Opening hours with live Open/Closed status
  - **"Get Directions"** button → opens Google Maps
  - **"Call"** button → opens phone dialer
- **Current stores**: Packages Mall (Lahore), Dolmen Mall (Karachi), Centaurus Mall (Islamabad), Emporium Mall (Lahore).

### 5.5 — Referral Program
- **How it works**:
  1. Share your unique referral code
  2. Friend signs up using your code
  3. Friend gets Rs. 200 discount on membership
  4. You get 1 month free extension
- **Referral code**: Displayed prominently (e.g., `AYESHA2025`).
- **Share options**: WhatsApp, SMS, Email, Copy Link.
- **Referral stats**: Friends referred, months earned, pending referrals.
- **Referral history**: List of referred friends with status (Completed / Pending) and reward earned.

### 5.6 — Help & Support
- **Contact options**: Phone (tap to call), Email (tap to compose).
- **FAQ accordion** (7 common questions):
  - How do I use my membership card?
  - What if my QR code doesn't scan?
  - How do I renew my membership?
  - What products are excluded from discount?
  - Can I share my membership?
  - How do I change my payment method?
  - What if I don't receive my discount?
- **Report a Problem**: Form with issue type dropdown + description text area + submit.
- **App info**: Version number, "Rate Us" link, "Share App" link.

### 5.7 — QR Help Screen
- **Troubleshooting steps**:
  1. Increase screen brightness
  2. Make sure screen is clean
  3. Hold steady while cashier scans
  4. If problem persists, show Member ID manually
- **Manual Member ID**: Large, readable display for cashier to enter manually.
- **Cashier instructions**: Button to show manual entry guide.
- **Call Support**: Direct link to customer service.

---

## PHASE 6: MEMBERSHIP RENEWAL

### Trigger Points
| Condition | What Happens |
|-----------|-------------|
| 30 days before expiry | Yellow banner on Home Dashboard |
| 7 days before expiry | More urgent renewal prompts |
| Membership expired | QR code grayed out, "EXPIRED" overlay on card |

### Renewal Screen
- **If expiring soon**: "Your Membership Expires Soon" + countdown (X days remaining) + "Don't lose your benefits!"
- **If expired**: "Your Membership Has Expired" + expiry date + "Renew now to continue saving 10%"
- **"What you'll miss" section**:
  - ✗ 10% discount on all purchases
  - ✗ Purchase history tracking
  - ✗ Member-only offers
- **Savings summary**: "You've saved Rs. 4,850 this year — that's 242% of your membership cost!"
- **CTAs**:
  - "Renew Membership — Rs. 2,000" (primary)
  - "Remind Me Later" (only if not yet expired)
- **On renewal**: Routes to Payment Processing → extends membership by 1 year from current expiry.

---

## PHASE 7: EDGE CASES & ERROR STATES

### 7.1 — Expired Membership
- QR code on My Card is **grayed out** with "EXPIRED" overlay.
- User **cannot** use discounts in-store.
- User **can still**: View profile, view past purchase history, contact support, renew membership.

### 7.2 — Payment Failure
- Error message displayed on Payment Processing Screen.
- Two recovery options: "Retry Payment" or "Change Payment Method".
- User is never charged if payment fails.

### 7.3 — OTP Issues
- Resend available after 59-second countdown.
- "Change number" link to correct phone number.
- Lockout after 3 failed attempts (5-minute cooldown).

### 7.4 — Login Lockout
- After 5 failed login attempts, account is locked for 15 minutes.
- User can use "Forgot Password" to reset.

### 7.5 — QR Code Not Scanning
- User navigates to QR Help Screen from My Card.
- Follows troubleshooting steps.
- Falls back to showing Member ID for manual entry by cashier.
- Can call support directly from the screen.

---

## COMPLETE USER LIFECYCLE SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AWARENESS        Download app from Play Store / App Store      │
│       │                                                         │
│  ONBOARDING       Splash → 3-slide carousel → Understand       │
│       │           value proposition (10% off, QR, tracking)     │
│       │                                                         │
│  REGISTRATION     Create account → Verify phone via OTP        │
│       │                                                         │
│  CONVERSION       Purchase Rs. 2,000 annual membership         │
│       │           Choose payment: JazzCash/EasyPaisa/Card      │
│       │                                                         │
│  ACTIVATION       Receive Member ID + QR code                  │
│       │           Land on Home Dashboard                        │
│       │                                                         │
│  ENGAGEMENT       ┌─ Shop in-store → Show QR → Get 10% off    │
│       │           ├─ Track savings on Home Dashboard            │
│       │           ├─ View purchase history & receipts           │
│       │           ├─ Find nearby stores                         │
│       │           ├─ Refer friends → Earn free months           │
│       │           └─ Receive notifications (offers, updates)    │
│       │                                                         │
│  RETENTION        ┌─ Renewal reminders at 30 days before       │
│       │           ├─ Savings summary motivates renewal          │
│       │           ├─ "What you'll miss" creates urgency         │
│       │           └─ Auto-renew option available                │
│       │                                                         │
│  RENEWAL          Pay Rs. 2,000 → Extend 1 year                │
│       │           (Cycle repeats from ENGAGEMENT)               │
│       │                                                         │
│  ADVOCACY         Refer friends via WhatsApp/SMS/Email          │
│                   Earn free months for successful referrals     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## KEY METRICS TO TRACK (Future Analytics)

| Metric | Where in Journey | Purpose |
|--------|-----------------|---------|
| Onboarding completion rate | Phase 1 | Are users understanding the value? |
| Registration drop-off | Phase 2 | Which form field causes abandonment? |
| OTP verification success rate | Phase 2 | Is SMS delivery reliable? |
| Membership purchase conversion | Phase 3 | Are registered users paying? |
| Payment method preference | Phase 3 | JazzCash vs EasyPaisa vs Card split |
| Promo code usage rate | Phase 3 | Are promos driving conversions? |
| QR scans per member per month | Phase 4 | How often are members shopping? |
| Average discount per transaction | Phase 4 | Member value realization |
| Notification open rate | Phase 5 | Are push notifications effective? |
| Referral conversion rate | Phase 5 | Is word-of-mouth working? |
| Renewal rate | Phase 6 | Are members finding enough value? |
| Days-to-renewal | Phase 6 | Do users renew early or at last minute? |
| Support ticket volume | Phase 5 | QR issues, payment problems, etc. |

---

## SCREEN COUNT & NAVIGATION MAP

**Total Screens**: 23

```
AUTH FLOW (6 screens)                 MAIN APP (4 tabs + 9 sub-screens)
├── SplashScreen                      ├── [Tab] HomeScreen
├── OnboardingScreen                  ├── [Tab] MyCardScreen
├── AuthChoiceScreen                  ├── [Tab] HistoryScreen
├── RegisterScreen                    ├── [Tab] ProfileScreen
├── OTPVerificationScreen             ├── TransactionDetailScreen
├── LoginScreen                       ├── EditProfileScreen
├── ForgotPasswordScreen              ├── ChangePasswordScreen
                                      ├── NotificationsScreen
MEMBERSHIP FLOW (3 screens)           ├── StoreLocatorScreen
├── MembershipPurchaseScreen          ├── HelpSupportScreen
├── PaymentProcessingScreen           ├── ReferralScreen
├── MembershipSuccessScreen           ├── RenewalScreen
                                      └── QRHelpScreen
```

---

*This document reflects the current frontend implementation. All screens are built and navigable. Backend integration, real payment processing, and native features (wallet, camera, GPS) are documented in `FEATURE_STATUS.md` and `BACKEND_SETUP_GUIDE.md`.*
