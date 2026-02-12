# MUMUSO LOYALTY APP — BACKEND SETUP GUIDE

**Purpose**: This document lists everything the project owner (you) must set up, configure, or provide so that the development team can integrate the backend, payments, POS, and notifications into the mobile app.

**Last Updated**: February 12, 2026

---

## TABLE OF CONTENTS

1. [Backend Platform Decision](#1-backend-platform-decision)
2. [Firebase Setup (If Chosen)](#2-firebase-setup-if-chosen)
3. [Custom Server Setup (If Chosen)](#3-custom-server-setup-if-chosen)
4. [Payment Gateway Accounts](#4-payment-gateway-accounts)
5. [SMS / OTP Provider](#5-sms--otp-provider)
6. [CBS Pakistan IMS POS Integration](#6-cbs-pakistan-ims-pos-integration)
7. [Push Notifications (FCM)](#7-push-notifications-fcm)
8. [Brand Assets](#8-brand-assets)
9. [Store Data](#9-store-data)
10. [Business Decisions](#10-business-decisions)
11. [Domain & Hosting](#11-domain--hosting)
12. [App Store Accounts](#12-app-store-accounts)
13. [Checklist Summary](#13-checklist-summary)

---

## 1. BACKEND PLATFORM DECISION

You need to choose **one** of the two backend approaches. This decision affects everything else.

### Option A: Firebase (Recommended for Faster Launch)

| Aspect | Detail |
|--------|--------|
| **Database** | Cloud Firestore (NoSQL) |
| **Authentication** | Firebase Auth (built-in phone OTP, email/password) |
| **Hosting** | Firebase Cloud Functions (serverless) |
| **Storage** | Firebase Storage (profile photos, receipts) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) — built-in |
| **Cost** | Free tier covers early stage; pay-as-you-go after |
| **Pros** | Faster development, built-in auth & OTP, no server management |
| **Cons** | Vendor lock-in, NoSQL may be less ideal for relational data |

### Option B: Custom Server (More Control)

| Aspect | Detail |
|--------|--------|
| **Database** | PostgreSQL (relational) |
| **Cache** | Redis (for fast membership validation) |
| **Server** | Node.js (Express) or Python (FastAPI/Django) |
| **Authentication** | Custom JWT implementation |
| **Hosting** | AWS / DigitalOcean / any VPS |
| **Push Notifications** | Firebase Cloud Messaging (still needed) |
| **Cost** | Server costs from day one (~$20-50/month minimum) |
| **Pros** | Full control, relational data model, no vendor lock-in |
| **Cons** | More setup time, you manage infrastructure |

### ACTION REQUIRED:
- [ ] **Decide**: Firebase or Custom Server?
- [ ] Communicate decision to development team

---

## 2. FIREBASE SETUP (If Chosen)

If you choose Firebase, you need to create and configure a Firebase project.

### Step-by-Step:

#### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Project name: `mumuso-loyalty` (or similar)
4. Enable Google Analytics (recommended)
5. Click **Create Project**

#### 2.2 Add Android App
1. In Firebase Console → Project Settings → **Add App** → Android
2. Android package name: `com.mumuso.loyalty` (confirm with dev team)
3. App nickname: `Mumuso Loyalty`
4. Download `google-services.json`
5. **Provide this file to the development team**

#### 2.3 Add iOS App (When Ready)
1. In Firebase Console → Project Settings → **Add App** → iOS
2. iOS bundle ID: `com.mumuso.loyalty` (confirm with dev team)
3. Download `GoogleService-Info.plist`
4. **Provide this file to the development team**

#### 2.4 Enable Firebase Services
In Firebase Console, enable the following:

| Service | Location in Console | Notes |
|---------|-------------------|-------|
| **Authentication** | Build → Authentication → Sign-in method | Enable **Phone** and **Email/Password** |
| **Cloud Firestore** | Build → Firestore Database | Create database in **production mode** |
| **Cloud Functions** | Build → Functions | Requires Blaze (pay-as-you-go) plan |
| **Cloud Storage** | Build → Storage | For profile photos |
| **Cloud Messaging** | Engage → Cloud Messaging | For push notifications |

#### 2.5 Upgrade to Blaze Plan
- Cloud Functions requires the **Blaze (pay-as-you-go)** plan
- You won't be charged until you exceed the free tier limits
- Go to: Project Settings → Usage and billing → Modify plan → Blaze

#### 2.6 Enable Phone Authentication
1. Go to Authentication → Sign-in method → Phone
2. Click **Enable**
3. Add test phone numbers for development (optional):
   - e.g., `+923001234567` with verification code `123456`
   - This avoids SMS charges during development

#### 2.7 Files to Provide to Dev Team
- [ ] `google-services.json` (Android)
- [ ] `GoogleService-Info.plist` (iOS)
- [ ] Firebase project ID
- [ ] Firebase Web API Key (found in Project Settings → General)

---

## 3. CUSTOM SERVER SETUP (If Chosen)

If you choose a custom backend, you need to provision infrastructure.

### 3.1 Server / Hosting

Choose a hosting provider and provision:

| Provider | Recommended Plan | Estimated Cost |
|----------|-----------------|----------------|
| **AWS** (EC2 + RDS) | t3.small EC2 + db.t3.micro RDS | ~$40-60/month |
| **DigitalOcean** | Droplet + Managed DB | ~$30-50/month |
| **Railway** | Starter plan | ~$20-40/month |
| **Render** | Starter plan | ~$25-45/month |

**Minimum Server Specs**:
- 2 vCPU, 2 GB RAM (for Node.js/Python server)
- 20 GB SSD storage
- Ubuntu 22.04 LTS

#### ACTION REQUIRED:
- [ ] Choose hosting provider
- [ ] Provision server
- [ ] Provide SSH access or deployment credentials to dev team

### 3.2 PostgreSQL Database

| Detail | Value |
|--------|-------|
| **Version** | PostgreSQL 15+ |
| **Storage** | 10 GB minimum (will grow with transactions) |
| **Backups** | Enable automated daily backups |

**Provide to dev team**:
- [ ] Database host/endpoint
- [ ] Database port (default: 5432)
- [ ] Database name (e.g., `mumuso_loyalty`)
- [ ] Database username
- [ ] Database password
- [ ] SSL certificate (if applicable)

### 3.3 Redis Cache

| Detail | Value |
|--------|-------|
| **Purpose** | Fast membership validation at POS checkout |
| **Version** | Redis 7+ |
| **Memory** | 256 MB minimum |

Options:
- **AWS ElastiCache** — managed Redis
- **Redis Cloud** — free tier available (30 MB)
- **Self-hosted** — install on same server

**Provide to dev team**:
- [ ] Redis host/endpoint
- [ ] Redis port (default: 6379)
- [ ] Redis password (if set)

### 3.4 File Storage (for profile photos, receipts)

Options:
- **AWS S3** — create a bucket named `mumuso-loyalty-assets`
- **DigitalOcean Spaces** — S3-compatible
- **Cloudinary** — free tier available (good for images)

**Provide to dev team**:
- [ ] Storage provider credentials (access key, secret key)
- [ ] Bucket/container name
- [ ] Region

---

## 4. PAYMENT GATEWAY ACCOUNTS

You need **merchant accounts** with Pakistani payment providers. This is the most time-consuming step — **start this immediately**.

### 4.1 JazzCash (Mobile Wallet)

| Detail | Info |
|--------|------|
| **Website** | [JazzCash Business](https://www.jazzcash.com.pk/business) |
| **What to apply for** | JazzCash Online Payment Gateway (Merchant Account) |
| **Documents needed** | Business registration (NTN), CNIC, bank account details |
| **Approval time** | 1-3 weeks |
| **Integration type** | REST API |

**Steps**:
1. Visit JazzCash Business portal
2. Apply for **Online Payment Integration**
3. Submit required business documents
4. Once approved, you'll receive:
   - Merchant ID
   - Password
   - Integrity Salt (hash key)
   - Sandbox credentials (for testing)

**Provide to dev team**:
- [ ] Merchant ID
- [ ] Password / Secret Key
- [ ] Integrity Salt
- [ ] Sandbox/Test credentials
- [ ] API documentation link (provided by JazzCash)

### 4.2 EasyPaisa (Mobile Wallet)

| Detail | Info |
|--------|------|
| **Website** | [EasyPaisa Business](https://www.easypaisa.com.pk/business) |
| **What to apply for** | EasyPaisa Online Payment Gateway |
| **Documents needed** | Business registration, CNIC, bank details |
| **Approval time** | 1-3 weeks |
| **Integration type** | REST API |

**Steps**:
1. Contact EasyPaisa business team
2. Apply for merchant integration
3. Once approved, you'll receive:
   - Store ID
   - Store Password / Hash Key
   - Sandbox credentials

**Provide to dev team**:
- [ ] Store ID
- [ ] Store Password / Hash Key
- [ ] Sandbox/Test credentials
- [ ] API documentation link

### 4.3 Credit/Debit Card Payments

Choose **one** of these options:

#### Option A: Stripe (International, easiest integration)
| Detail | Info |
|--------|------|
| **Website** | [stripe.com](https://stripe.com) |
| **Pakistan support** | Stripe Atlas or via a registered entity |
| **Approval time** | 1-2 days (if eligible) |

- [ ] Create Stripe account
- [ ] Provide **Publishable Key** and **Secret Key** (test + live)

#### Option B: HBL Pay (Local Pakistani gateway)
| Detail | Info |
|--------|------|
| **Provider** | Habib Bank Limited |
| **Website** | Contact HBL directly |
| **Approval time** | 2-4 weeks |

#### Option C: Keenu / PayFast (Local alternatives)
| Detail | Info |
|--------|------|
| **Keenu** | [keenu.pk](https://keenu.pk) |
| **PayFast** | [payfast.com.pk](https://payfast.com.pk) |

**ACTION REQUIRED**:
- [ ] Apply for JazzCash merchant account **NOW** (takes weeks)
- [ ] Apply for EasyPaisa merchant account **NOW**
- [ ] Decide on card payment provider and apply
- [ ] Provide all sandbox/test credentials to dev team first
- [ ] Provide production credentials before launch

---

## 5. SMS / OTP PROVIDER

The app needs to send OTP codes via SMS for phone verification.

> **Note**: If you chose Firebase, Firebase Auth handles OTP automatically (no separate SMS provider needed). Skip to Section 6.

### If Using Custom Backend:

Choose **one** SMS provider:

| Provider | Cost per SMS (Pakistan) | Website |
|----------|------------------------|---------|
| **Twilio** | ~$0.04/SMS | [twilio.com](https://twilio.com) |
| **MessageBird** | ~$0.03/SMS | [messagebird.com](https://messagebird.com) |
| **Local: Jazzcash SMS** | Varies | Contact JazzCash |
| **Local: Telenor SMS API** | Varies | Contact Telenor |
| **Local: CMPAK (Zong)** | Varies | Contact Zong |

**Recommended**: Twilio (reliable, good documentation, works globally)

**Steps for Twilio**:
1. Create account at [twilio.com](https://twilio.com)
2. Get a phone number (or use Twilio Verify for OTP)
3. Note your credentials

**Provide to dev team**:
- [ ] Account SID
- [ ] Auth Token
- [ ] Phone number or Verify Service SID
- [ ] Test credentials (Twilio provides free test credentials)

---

## 6. CBS PAKISTAN IMS POS INTEGRATION

**This is the MOST CRITICAL external dependency.** Without CBS cooperation, the core discount-at-checkout feature cannot work.

### What You Need From CBS Pakistan

You need to **contact CBS Pakistan** and request the following:

#### 6.1 API Documentation
- [ ] Complete REST API documentation for their IMS Retail ERP
- [ ] List of available endpoints
- [ ] Request/response formats (JSON)
- [ ] Authentication method (API key, OAuth, etc.)
- [ ] Rate limits and constraints

#### 6.2 Specific API Endpoints Needed

Ask CBS to provide or develop these endpoints:

| # | Endpoint Purpose | Direction | Description |
|---|-----------------|-----------|-------------|
| 1 | **Validate Membership** | App Backend → CBS POS | When QR is scanned, validate member and return discount info |
| 2 | **Apply Discount** | CBS POS internal | CBS applies the 10% discount to the transaction |
| 3 | **Sync Transaction** | CBS POS → App Backend | After payment, CBS sends transaction details to our backend |
| 4 | **Get Store List** | App Backend → CBS | Fetch list of active Mumuso stores |

#### 6.3 Integration Architecture Decision

Discuss with CBS which approach they support:

**Approach A: CBS calls OUR API** (Recommended)
```
QR Scanned → CBS POS calls our API → We validate → CBS applies discount
Transaction Complete → CBS calls our webhook → We store transaction
```

**Approach B: WE call CBS API**
```
QR Scanned → CBS POS sends member_id to their server → Their server calls our API
Transaction Complete → We poll CBS for new transactions
```

#### 6.4 Test Environment
- [ ] CBS sandbox/test POS environment
- [ ] Test store ID for development
- [ ] Test API credentials
- [ ] Contact person at CBS for technical questions

#### 6.5 QR Code Format Agreement
Agree with CBS on what data the QR code contains:
- **Recommended format**: Simple member ID string, e.g., `MUM-12345`
- CBS scanner must be able to read this format
- Test with CBS's actual barcode/QR scanners

#### 6.6 CBS Contact Checklist
- [ ] Schedule initial meeting with CBS technical team
- [ ] Get CBS technical contact (name, email, phone)
- [ ] Get API documentation
- [ ] Get test/sandbox environment access
- [ ] Agree on QR code format
- [ ] Agree on API contract (request/response formats)
- [ ] Test end-to-end flow in sandbox
- [ ] Schedule production integration testing at a pilot store

### Timeline Warning
> CBS integration typically takes **4-8 weeks** from first contact to working integration. **Start this process immediately.** This is on the critical path — the app cannot launch without it.

---

## 7. PUSH NOTIFICATIONS (FCM)

Firebase Cloud Messaging is needed regardless of your backend choice.

### If You Already Created a Firebase Project (Section 2):
- FCM is automatically available — no extra setup needed.

### If You Did NOT Create a Firebase Project:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (just for FCM, minimal setup)
3. Add Android and iOS apps
4. Download config files

### For iOS Push Notifications (Additional Step):
You need an **Apple Push Notification Service (APNs)** key:
1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to: Certificates, Identifiers & Profiles → Keys
3. Create a new key with **Apple Push Notifications service (APNs)** enabled
4. Download the `.p8` key file
5. Note the **Key ID** and **Team ID**
6. Upload this key to Firebase Console → Project Settings → Cloud Messaging → iOS

**Provide to dev team**:
- [ ] `google-services.json` (Android)
- [ ] `GoogleService-Info.plist` (iOS)
- [ ] APNs key file (`.p8`) — for iOS notifications
- [ ] APNs Key ID and Team ID

---

## 8. BRAND ASSETS

The development team needs official Mumuso brand assets to build the UI.

### Required Assets:

| # | Asset | Format | Notes |
|---|-------|--------|-------|
| 1 | **Mumuso Logo** (full) | SVG + PNG (1x, 2x, 3x) | Transparent background |
| 2 | **Mumuso Logo** (icon only) | SVG + PNG (1024x1024) | For app icon |
| 3 | **Brand Primary Color** | HEX code | e.g., `#E91E63` |
| 4 | **Brand Secondary Color** | HEX code | |
| 5 | **Brand Accent Color** | HEX code | For buttons, CTAs |
| 6 | **Brand Font** | Font file or name | If Mumuso uses a specific font |
| 7 | **App Icon** | PNG 1024x1024 | For App Store / Play Store |
| 8 | **Splash Screen Background** | PNG or design file | Optional — can be created |
| 9 | **Membership Card Design** | Figma / PSD / reference image | How should the digital card look? |
| 10 | **Onboarding Illustrations** | SVG or PNG | 3 illustrations for onboarding slides |

### Optional But Helpful:
- [ ] Store photos (for store locator)
- [ ] Sample product images
- [ ] Marketing taglines / copy
- [ ] Existing brand guidelines document (if any)

**ACTION REQUIRED**:
- [ ] Collect all brand assets from Mumuso marketing team
- [ ] Provide to development team in a shared folder

---

## 9. STORE DATA

The app needs a list of all Mumuso stores for the Store Locator feature.

### Required Data Per Store:

| Field | Example | Required |
|-------|---------|----------|
| **Store Name** | Mumuso - Dolmen Mall Clifton | Yes |
| **Full Address** | HC 3, Rahat Commercial Area, Clifton, Karachi | Yes |
| **City** | Karachi | Yes |
| **Phone Number** | +92-21-XXXXXXX | Yes |
| **Latitude** | 24.8125 | Yes |
| **Longitude** | 67.0307 | Yes |
| **Opening Hours** (Mon-Sun) | 10:00 AM - 10:00 PM | Yes |
| **Store ID in CBS** | (from CBS system) | Yes |

### How to Get Coordinates:
1. Go to [Google Maps](https://maps.google.com)
2. Search for the store
3. Right-click on the pin → Copy coordinates
4. Format: `latitude, longitude` (e.g., `24.8125, 67.0307`)

**ACTION REQUIRED**:
- [ ] Create a spreadsheet (Excel/Google Sheets) with all store data
- [ ] Include CBS store IDs (needed for POS integration)
- [ ] Provide to development team

---

## 10. BUSINESS DECISIONS

The following business decisions need to be made before development can finalize certain features:

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| 1 | **Annual Membership Fee** | Rs. 1,000 / 1,500 / 2,000 / Custom | Displayed on purchase screen |
| 2 | **Discount Percentage** | 10% / 5% / Variable | Applied at checkout |
| 3 | **Minimum Purchase for Discount** | None / Rs. 500 / Rs. 1,000 | Validation logic |
| 4 | **Excluded Products** | Any categories excluded from discount? | POS validation logic |
| 5 | **Auto-Renewal** | Allow auto-renewal? | Payment flow |
| 6 | **Referral Program** | Enable referral feature? | Additional screens |
| 7 | **Referral Reward** | Rs. 200 off / 1 month free / Custom | Referral logic |
| 8 | **Promo Codes** | Allow promo codes on membership? | Payment flow |
| 9 | **Membership Start Date** | From purchase date / From first use | Expiry calculation |
| 10 | **Grace Period** | Days after expiry before blocking | Renewal flow |
| 11 | **Terms & Conditions** | Need legal text for T&C | Registration screen |
| 12 | **Privacy Policy** | Need legal text for privacy policy | Registration screen |
| 13 | **Support Phone Number** | Actual customer support number | Help screen |
| 14 | **Support Email** | Actual support email address | Help screen |
| 15 | **Support Hours** | e.g., 9 AM - 9 PM | Help screen |

**ACTION REQUIRED**:
- [ ] Make all business decisions above
- [ ] Provide finalized Terms & Conditions text
- [ ] Provide finalized Privacy Policy text
- [ ] Communicate all decisions to development team

---

## 11. DOMAIN & HOSTING

### API Domain
You need a domain for the backend API:

| Item | Example | Notes |
|------|---------|-------|
| **API Domain** | `api.mumuso.com.pk` | Subdomain of your main website |
| **Alternative** | `mumuso-loyalty-api.com` | If no existing domain |
| **SSL Certificate** | Required (HTTPS) | Free via Let's Encrypt or Cloudflare |

**Steps**:
1. Purchase or use existing domain
2. Create a subdomain for the API (e.g., `api.mumuso.com.pk`)
3. Point DNS to your server
4. Install SSL certificate

**ACTION REQUIRED**:
- [ ] Decide on API domain name
- [ ] Set up DNS records (dev team will guide)
- [ ] Ensure SSL/HTTPS is configured

### Deep Linking Domain (Optional)
For app deep links (e.g., referral links that open the app):
- [ ] Set up `app.mumuso.com.pk` or similar
- [ ] Configure `.well-known/assetlinks.json` (Android) and `apple-app-site-association` (iOS)

---

## 12. APP STORE ACCOUNTS

### Google Play Store (Android)
| Item | Detail |
|------|--------|
| **Account type** | Organization |
| **One-time fee** | $25 USD |
| **URL** | [play.google.com/console](https://play.google.com/console) |
| **Documents needed** | D-U-N-S number (for organization account) |

**Steps**:
1. Create Google Play Developer account
2. Pay $25 registration fee
3. Complete organization verification
4. Add development team as users (for uploading builds)

### Apple App Store (iOS)
| Item | Detail |
|------|--------|
| **Account type** | Organization |
| **Annual fee** | $99 USD/year |
| **URL** | [developer.apple.com](https://developer.apple.com) |
| **Documents needed** | D-U-N-S number, legal entity info |

**Steps**:
1. Enroll in Apple Developer Program
2. Pay $99/year
3. Complete organization verification (can take 1-2 weeks)
4. Add development team members

**ACTION REQUIRED**:
- [ ] Create Google Play Developer account
- [ ] Create Apple Developer account
- [ ] Provide access to development team

---

## 13. CHECKLIST SUMMARY

### Priority: CRITICAL (Start Immediately)
- [ ] **Decide**: Firebase or Custom Backend
- [ ] **Contact CBS Pakistan** — request API documentation and test environment
- [ ] **Apply for JazzCash** merchant account
- [ ] **Apply for EasyPaisa** merchant account

### Priority: HIGH (Within 1 Week)
- [ ] Set up Firebase project (if chosen) and provide config files
- [ ] OR provision server + database (if custom backend chosen)
- [ ] Choose and set up card payment provider (Stripe / HBL Pay / etc.)
- [ ] Set up SMS/OTP provider (if not using Firebase Auth)
- [ ] Collect all brand assets from Mumuso
- [ ] Create store data spreadsheet

### Priority: MEDIUM (Within 2 Weeks)
- [ ] Make all business decisions (Section 10)
- [ ] Draft Terms & Conditions
- [ ] Draft Privacy Policy
- [ ] Set up API domain and SSL
- [ ] Create Google Play Developer account
- [ ] Create Apple Developer account

### Priority: LOW (Before Launch)
- [ ] Provide production payment gateway credentials
- [ ] Complete CBS POS integration testing at pilot store
- [ ] Finalize support contact details
- [ ] Prepare marketing materials for launch

---

## COMMUNICATION

Once you have any of the above items ready, share them with the development team via:
- **Credentials**: Use a secure method (password manager, encrypted message) — **NEVER share API keys via email or chat in plain text**
- **Files**: Shared Google Drive / OneDrive folder
- **Brand Assets**: Shared folder with organized subfolders

---

## ESTIMATED TIMELINE

| Phase | Duration | Dependency |
|-------|----------|------------|
| Backend setup (Firebase/Server) | 1-2 days after you provide access | Your decision + credentials |
| Payment gateway integration | 1-2 weeks after sandbox credentials received | JazzCash/EasyPaisa approval |
| CBS POS integration | 4-8 weeks | CBS cooperation |
| App Store submission | 1-2 weeks review time | Developer accounts |
| **Total to MVP launch** | **8-12 weeks** | All dependencies resolved |

> **The biggest risk to timeline is CBS POS integration.** Everything else can proceed in parallel, but the core value proposition (10% discount at checkout) depends entirely on CBS providing their API.

---

*This document is your action plan. Work through the checklist systematically, starting with the CRITICAL items. The development team can build the entire frontend and mock the backend while you set these up — but real integration testing cannot begin until these items are provided.*
