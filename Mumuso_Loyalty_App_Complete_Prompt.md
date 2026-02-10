# MUMUSO LOYALTY APP - COMPLETE DEVELOPMENT PROMPT

## PROJECT OVERVIEW

You are tasked with designing and developing a **Paid Membership & Loyalty Mobile Application** for Mumuso, a retail store chain. This is NOT just a marketing app - it's a **revenue-generating customer intelligence platform** that integrates deeply with their CBS Pakistan IMS POS system.

### Core Purpose
- Generate annual recurring revenue through paid memberships
- Provide 10% discount to paying members on eligible purchases
- Capture real transaction-level customer data
- Enable targeted marketing and customer analytics
- Increase customer retention and lifetime value

---

## TECHNICAL STACK REQUIREMENTS

### Mobile App
- **Platform**: Cross-platform (iOS & Android)
- **Framework**: Flutter or React Native (recommended: Flutter for better performance)
- **Minimum Versions**: 
  - iOS 13.0+
  - Android 8.0+ (API Level 26+)

### Backend
- **Cloud Platform**: AWS or Firebase (recommended: Firebase for faster development)
- **Database**: 
  - Primary: PostgreSQL or Firebase Firestore
  - Caching: Redis (for membership validation speed)
- **API Architecture**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)

### Payment Integration
- **Payment Gateways**: 
  - JazzCash
  - EasyPaisa
  - Credit/Debit Cards (Stripe or local Pakistani gateway)
- **Payment Flow**: In-app purchase with receipt generation

### Push Notifications
- **Service**: Firebase Cloud Messaging (FCM)
- **Use Cases**: Membership activation, renewal reminders, promotional offers

### POS Integration
- **System**: CBS Pakistan IMS Retail ERP
- **Integration Method**: REST API (custom endpoints to be provided by CBS)
- **Real-time Sync**: Required for discount validation and transaction logging

---

## APP ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (Flutter)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Registration │  │ Membership   │  │   Purchase   │  │
│  │   & Login    │  │     Card     │  │   History    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕ (REST API / HTTPS)
┌─────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js/Python)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth API   │  │ Membership   │  │   Payment    │  │
│  │              │  │  Validation  │  │   Gateway    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                    │
│  - Users Table                                           │
│  - Memberships Table                                     │
│  - Transactions Table                                    │
│  - Stores Table                                          │
└─────────────────────────────────────────────────────────┘
                            ↕ (Custom API)
┌─────────────────────────────────────────────────────────┐
│           CBS PAKISTAN IMS POS SYSTEM                    │
│  - QR Scanner Integration                                │
│  - Discount Application                                  │
│  - Transaction Logging                                   │
└─────────────────────────────────────────────────────────┘
```

---

## USER FLOWS & SCREENS

### 1. ONBOARDING & REGISTRATION FLOW

#### Screen 1.1: Splash Screen
**Purpose**: Brand introduction, initial loading

**UI Elements**:
- Mumuso logo (centered)
- App name/tagline
- Loading indicator
- Version number (bottom)

**Duration**: 2-3 seconds

**Actions**:
- Check if user is logged in
- If logged in → Navigate to Home Screen
- If not logged in → Navigate to Onboarding

---

#### Screen 1.2: Onboarding Carousel (3 slides)
**Purpose**: Explain app value proposition

**Slide 1**:
- **Headline**: "Join Mumuso Membership"
- **Description**: "Pay once, save all year with 10% off on every purchase"
- **Visual**: Illustration of shopping cart with discount tag
- **CTA**: "Next" button

**Slide 2**:
- **Headline**: "Shop & Save Instantly"
- **Description**: "Just show your QR code at checkout and get automatic discounts"
- **Visual**: QR code scanning illustration
- **CTA**: "Next" button

**Slide 3**:
- **Headline**: "Track Your Savings"
- **Description**: "View your purchase history and see how much you've saved"
- **Visual**: Mobile phone showing savings dashboard
- **CTA**: "Get Started" button

**UI Requirements**:
- Swipeable carousel
- Page indicators (dots)
- "Skip" option on top-right
- Smooth transitions

---

#### Screen 1.3: Login/Registration Choice
**Purpose**: Allow user to choose sign-up or login

**UI Elements**:
- Mumuso logo (top)
- Tagline: "Your Loyalty Rewards Await"
- **Primary Button**: "Create Account" (prominent, brand color)
- **Secondary Button**: "I Already Have an Account" (outlined)
- Social proof text: "Join 10,000+ members already saving" (optional)

**Actions**:
- "Create Account" → Navigate to Registration Screen
- "I Already Have an Account" → Navigate to Login Screen

---

#### Screen 1.4: Registration Screen
**Purpose**: Collect user information for account creation

**Form Fields** (in order):
1. **Full Name**
   - Input type: Text
   - Validation: Min 2 characters, letters only
   - Placeholder: "Enter your full name"
   - Required: Yes

2. **Phone Number**
   - Input type: Tel (with country code picker)
   - Default country: Pakistan (+92)
   - Validation: Valid Pakistani phone number (11 digits)
   - Placeholder: "3XX XXXXXXX"
   - Required: Yes
   - Note: This will be the username

3. **Email Address**
   - Input type: Email
   - Validation: Valid email format
   - Placeholder: "yourname@example.com"
   - Required: Yes

4. **Date of Birth**
   - Input type: Date picker
   - Validation: User must be 13+ years old
   - Placeholder: "DD/MM/YYYY"
   - Required: Yes (for birthday offers)

5. **Gender** (Optional)
   - Input type: Dropdown/Radio buttons
   - Options: Male, Female, Other, Prefer not to say
   - Required: No

6. **City**
   - Input type: Dropdown (prepopulated with Pakistani cities)
   - Placeholder: "Select your city"
   - Required: Yes

7. **Password**
   - Input type: Password (with show/hide toggle)
   - Validation: Min 8 characters, 1 uppercase, 1 lowercase, 1 number
   - Placeholder: "Create a strong password"
   - Required: Yes
   - Show password strength indicator

8. **Confirm Password**
   - Input type: Password
   - Validation: Must match password field
   - Required: Yes

**Additional Elements**:
- Checkbox: "I agree to Terms & Conditions and Privacy Policy" (required)
- Links to Terms & Privacy Policy (tappable)
- **CTA Button**: "Create Account" (enabled only when form is valid)
- Already have account? "Login" link at bottom

**Actions**:
- On "Create Account":
  - Validate all fields
  - Show loading indicator
  - Call backend API to create account
  - Send OTP to phone number
  - Navigate to OTP Verification Screen

**Error Handling**:
- Show inline error messages for invalid fields
- Highlight invalid fields in red
- If phone/email already exists: "This phone number is already registered. Please login."

---

#### Screen 1.5: OTP Verification Screen
**Purpose**: Verify phone number ownership

**UI Elements**:
- Back button (top-left)
- Illustration of phone with message icon
- Title: "Verify Your Phone Number"
- Description: "We've sent a 6-digit code to +92 XXX XXXXXXX"
- "Change number" link

**OTP Input**:
- 6 individual boxes for each digit
- Auto-focus on next box after entering digit
- Auto-submit when all 6 digits entered
- Large, easy-to-tap boxes

**Additional Elements**:
- Countdown timer: "Resend code in 0:59"
- "Resend Code" button (enabled after countdown)
- "Didn't receive code?" help text

**Actions**:
- On OTP submission:
  - Show loading indicator
  - Validate OTP with backend
  - If correct → Navigate to Membership Purchase Screen
  - If incorrect → Show error: "Invalid code. Please try again."
  - After 3 failed attempts → Disable for 5 minutes

---

#### Screen 1.6: Login Screen
**Purpose**: Allow existing users to access their account

**Form Fields**:
1. **Phone Number or Email**
   - Input type: Text
   - Placeholder: "Phone number or email"
   - Required: Yes

2. **Password**
   - Input type: Password (with show/hide toggle)
   - Placeholder: "Enter your password"
   - Required: Yes

**Additional Elements**:
- "Forgot Password?" link (top-right of password field)
- **CTA Button**: "Login"
- "Don't have an account? Sign Up" link at bottom

**Actions**:
- On "Login":
  - Validate credentials
  - Show loading indicator
  - If successful → Navigate to Home Screen
  - If failed → Show error: "Incorrect phone/email or password"
  - After 5 failed attempts → Lock account for 15 minutes

---

### 2. MEMBERSHIP PURCHASE FLOW

#### Screen 2.1: Membership Purchase Screen
**Purpose**: Sell annual membership

**Header Section**:
- Gradient background (brand colors)
- Icon/illustration of membership card
- Title: "Become a Mumuso Member"
- Subtitle: "Unlock exclusive benefits"

**Benefits Section** (visually appealing cards):
1. ✓ **10% Discount** on all eligible purchases
2. ✓ **Save Money** all year long
3. ✓ **Exclusive** member-only offers
4. ✓ **Track** all your purchases in one place
5. ✓ **Priority** customer support

**Pricing Section**:
- Large, prominent price display
- "Only Rs. 2,000/year" (example amount - will be dynamic)
- Breakdown text: "That's just Rs. 167 per month!"
- Savings calculator: "Break-even after just Rs. 20,000 in purchases"

**Payment Methods Section**:
- Title: "Choose Payment Method"
- Radio buttons with logos:
  - JazzCash
  - EasyPaisa
  - Credit/Debit Card
  - Bank Transfer (if applicable)

**Additional Elements**:
- "Have a promo code?" expandable field
- Terms checkbox: "I agree to membership terms"
- **CTA Button**: "Pay Rs. 2,000 & Activate Membership" (large, prominent)

**Bottom Sheet Info**:
- "What's included?" tappable link
- Shows detailed benefits modal when tapped

**Actions**:
- On "Pay" button:
  - Validate payment method selected
  - Validate terms checkbox
  - Navigate to respective payment gateway
  - After successful payment → Navigate to Membership Success Screen

---

#### Screen 2.2: Payment Processing Screen
**Purpose**: Handle payment gateway integration

**UI Elements**:
- Secure lock icon (top)
- Title: "Secure Payment"
- Payment gateway iframe/WebView
- Loading indicator while processing
- "Processing your payment..." text

**Payment Gateway Specific**:
- **JazzCash**: Redirect to JazzCash app or web interface
- **EasyPaisa**: Redirect to EasyPaisa app or OTP flow
- **Card**: Display card input form (Stripe or local gateway)

**Security Indicators**:
- SSL/TLS padlock icon
- "Your payment is secure" text
- PCI compliance badge (if applicable)

**Actions**:
- On successful payment:
  - Store transaction in database
  - Activate membership
  - Generate unique Member ID and QR code
  - Send confirmation SMS and email
  - Navigate to Success Screen
  
- On failed payment:
  - Show error message
  - Offer to retry
  - Option to change payment method

---

#### Screen 2.3: Membership Success Screen
**Purpose**: Confirm successful membership activation

**UI Elements**:
- Success animation (checkmark or celebration confetti)
- Title: "Welcome to Mumuso Membership! 🎉"
- Member ID display: "Your Member ID: MUM-12345"
- QR Code (large, scannable)
- "Save to Photos" button (to save QR code)

**Membership Details Card**:
- **Member Since**: [Date]
- **Valid Until**: [Expiry Date - 1 year from now]
- **Membership Status**: Active ✓

**Next Steps Section**:
- "Start shopping and show this QR code at checkout"
- "You'll automatically get 10% off on eligible items"

**CTA Buttons**:
- **Primary**: "View My Membership Card"
- **Secondary**: "Start Shopping" (if catalog feature exists)

**Actions**:
- Auto-navigate to Home Screen after 5 seconds
- Or user taps any CTA button

---

### 3. HOME SCREEN (MAIN DASHBOARD)

#### Screen 3.1: Home Dashboard
**Purpose**: Central hub for all member features

**Top Bar**:
- Mumuso logo (left)
- Notification icon with badge (right)
- Profile icon (right)

**Membership Card Section** (swipeable card):
- Premium card design with gradient background
- Member Name
- Member ID: MUM-XXXXX
- QR Code (tap to enlarge)
- "Valid Until: DD/MM/YYYY"
- "Active" status badge (green)
- "Show at Checkout" text

**Quick Stats Section** (2 columns):
1. **Total Savings**
   - Large number: "Rs. 1,250"
   - Subtext: "Saved this year"
   - Icon: Piggy bank or savings icon

2. **Total Purchases**
   - Large number: "15"
   - Subtext: "Purchases made"
   - Icon: Shopping bag

**Quick Actions Section** (horizontal scroll cards):
1. **Purchase History**
   - Icon + Label
   - Navigate to Purchase History Screen

2. **Renew Membership**
   - Icon + Label
   - Navigate to Renewal Screen (only if expiring soon)

3. **Refer a Friend**
   - Icon + Label
   - Navigate to Referral Screen (if feature enabled)

4. **Nearby Stores**
   - Icon + Label
   - Navigate to Store Locator Screen

5. **Support**
   - Icon + Label
   - Navigate to Help/Support Screen

**Promotional Banner Section** (optional):
- Carousel of current offers/promotions
- Swipeable
- Tappable to view details

**Recent Activity Section**:
- Title: "Recent Purchases"
- List of last 3 transactions
  - Store name
  - Date
  - Amount
  - Discount received (highlighted in green)
- "View All" link → Purchase History Screen

**Bottom Navigation Bar** (sticky):
1. **Home** (current)
   - Icon: House
   - Label: "Home"

2. **Card**
   - Icon: ID Card
   - Label: "My Card"

3. **History**
   - Icon: Clock/Receipt
   - Label: "History"

4. **Profile**
   - Icon: User
   - Label: "Profile"

---

### 4. MEMBERSHIP CARD SCREEN

#### Screen 4.1: Digital Membership Card
**Purpose**: Display QR code for scanning at checkout

**UI Elements**:
- Full-screen card design (can be rotated to landscape for larger QR)
- Premium visual design with brand colors
- Mumuso logo (top-center)

**Card Front** (primary view):
- **Member Name**: [Full Name]
- **Member ID**: MUM-XXXXX (large, readable)
- **QR Code**: Very large, center-aligned, high contrast
- **Valid Until**: DD/MM/YYYY
- **Status Badge**: "ACTIVE" (green) or "EXPIRED" (red)

**Brightness Control**:
- Auto-increase screen brightness when card is opened
- Reset to normal when closed
- Toggle: "Keep screen on while viewing card"

**Additional Features**:
- "Tap to enlarge QR code" (makes QR fill entire screen)
- "Add to Apple Wallet" button (iOS)
- "Add to Google Wallet" button (Android)
- "Save QR to Photos" button

**Instructions Text** (bottom):
- "Show this QR code to cashier at checkout"
- "Your discount will be applied automatically"

**Card Back** (swipe or flip to view):
- Membership benefits summary
- Terms & conditions link
- Customer service number
- Emergency: "Card not working? Call XXX-XXXXXXX"

---

### 5. PURCHASE HISTORY SCREEN

#### Screen 5.1: Transaction History
**Purpose**: Show all past purchases with discounts

**Header**:
- Back button
- Title: "Purchase History"
- Filter icon (top-right)

**Filter Options** (when filter tapped):
- Date Range: Last 7 days, Last 30 days, Last 3 months, All time
- Store Location: All stores, or specific store
- Sort by: Date (newest), Date (oldest), Amount (high to low)

**Summary Cards** (top section):
1. **Total Spent This Year**
   - Large amount: Rs. XX,XXX
   
2. **Total Saved This Year**
   - Large amount: Rs. X,XXX
   - Percentage: "You saved 10% on average"

3. **Most Visited Store**
   - Store name
   - Visit count

**Transaction List**:
Each transaction card shows:
- **Date & Time**: "15 Jan 2024, 3:45 PM"
- **Store Name & Location**: "Mumuso - Dolmen Mall, Clifton"
- **Items Purchased**: "5 items" (tappable to see details)
- **Original Amount**: Rs. 2,500 (struck through)
- **Discount Applied**: -Rs. 250 (green, highlighted)
- **Final Amount Paid**: Rs. 2,250 (bold)
- **Payment Method**: Cash / Card icon

**Transaction Card Actions**:
- Tap anywhere → View full receipt details
- Swipe left → Options: "Download Receipt", "Share", "Report Issue"

**Empty State** (if no purchases):
- Illustration of empty shopping bag
- Text: "No purchases yet"
- Subtext: "Start shopping and your purchases will appear here"
- CTA: "Find Nearest Store"

**Loading State**:
- Skeleton screens while loading
- Pull-to-refresh functionality

---

#### Screen 5.2: Transaction Detail Screen
**Purpose**: Show detailed receipt for a single purchase

**Header**:
- Back button
- Title: "Purchase Details"
- Share icon (top-right)
- Download icon (top-right)

**Receipt Design** (mimics physical receipt):
- Mumuso logo (top)
- Store name and address
- Date and time
- Transaction ID: TXN-XXXXXXXXX
- Cashier name (if available)

**Items List**:
Each item row:
- Item name
- Quantity × Unit Price
- Line total

Example:
```
Cute Notebook          1 × Rs. 150.00    Rs. 150.00
Pen Set (Blue)         2 × Rs. 80.00     Rs. 160.00
Water Bottle           1 × Rs. 300.00    Rs. 300.00
```

**Calculation Breakdown**:
```
Subtotal:                              Rs. 610.00
Member Discount (10%):               - Rs. 61.00
Tax (if applicable):                 + Rs. 50.00
───────────────────────────────────────────────
Total Paid:                            Rs. 599.00
```

**Savings Highlight Box** (colored background):
- "You saved Rs. 61.00 with your membership!"
- Trophy or star icon

**Payment Information**:
- Payment Method: Cash / JazzCash / Card
- Member ID Used: MUM-12345

**Actions**:
- "Download PDF Receipt" button
- "Email Receipt" button
- "Report an Issue" link
- "Contact Support" link (if something wrong)

---

### 6. PROFILE SCREEN

#### Screen 6.1: User Profile
**Purpose**: Manage account settings and personal information

**Header**:
- Back button
- Title: "My Profile"
- Edit icon (top-right)

**Profile Section**:
- Profile photo (editable)
- Member name (large, bold)
- Member ID: MUM-XXXXX
- Member since: [Date]

**Membership Status Card**:
- Visual indicator (green = active, red = expired, yellow = expiring soon)
- Status: "Active" / "Expiring Soon" / "Expired"
- Valid until: DD/MM/YYYY
- If expiring within 30 days: "Renew Now" button (prominent)

**Personal Information Section**:
- Email: user@example.com (with verified badge)
- Phone: +92 XXX XXXXXXX (with verified badge)
- Date of Birth: DD/MM/YYYY
- Gender: Male/Female/Other
- City: Karachi
- Each field has edit icon

**Membership Settings Section**:
- "Auto-Renew Membership" (toggle switch)
- "Renewal Reminders" (toggle switch)
- "Payment Methods" → Navigate to Payment Methods Screen

**Preferences Section**:
- "Notification Settings" → Navigate to Notifications Screen
- "Language" → English / Urdu
- "Dark Mode" (toggle switch)

**App Settings Section**:
- "Privacy Policy" (link)
- "Terms & Conditions" (link)
- "Help & Support" → Navigate to Support Screen
- "About App" → Show app version, credits

**Account Actions**:
- "Change Password" → Navigate to Change Password Screen
- "Delete Account" (red text) → Show confirmation dialog

**Logout Button** (bottom, outlined, red text):
- "Logout"
- Show confirmation dialog: "Are you sure you want to logout?"

---

#### Screen 6.2: Edit Profile Screen
**Purpose**: Allow users to update their information

**Header**:
- Back button
- Title: "Edit Profile"
- "Save" button (top-right, enabled when changes made)

**Editable Fields** (same as registration but pre-filled):
- Profile Photo (tap to change)
  - Options: Take Photo, Choose from Gallery, Remove Photo
- Full Name
- Email (show warning: "Changing email requires verification")
- Date of Birth
- Gender
- City

**Password Section**:
- "Change Password" button → Navigate to Change Password Screen

**Actions**:
- On "Save":
  - Validate changes
  - If email changed → Send verification email
  - Show loading indicator
  - Update backend
  - Show success message
  - Navigate back to Profile Screen

**Validation**:
- Same rules as registration
- Show errors inline
- Prevent saving if validation fails

---

### 7. RENEWAL FLOW

#### Screen 7.1: Renewal Reminder Screen
**Purpose**: Notify user of upcoming expiry and encourage renewal

**Triggered When**:
- Membership expires in 30 days: Show subtle banner on Home Screen
- Membership expires in 7 days: Show full-screen modal (dismissible)
- Membership expired: Show blocking screen until renewed

**UI Elements**:
- Icon: Calendar with exclamation mark
- **If expiring soon**:
  - Title: "Your Membership Expires Soon"
  - Countdown: "X days remaining"
  - Reminder: "Don't lose your benefits!"
  
- **If expired**:
  - Title: "Your Membership Has Expired"
  - Date: "Expired on DD/MM/YYYY"
  - Message: "Renew now to continue saving 10%"

**Benefits Reminder**:
- "What you'll miss:"
  - ✗ 10% discount on all purchases
  - ✗ Purchase history tracking
  - ✗ Member-only offers

**Savings Summary** (if renewing):
- "You've saved Rs. X,XXX this year"
- "That's XXX% of your membership cost!"
- Motivational message if user saved more than membership cost

**CTA Buttons**:
- **Primary**: "Renew Membership - Rs. 2,000"
- **Secondary**: "Remind Me Later" (only if not expired)

**Actions**:
- On "Renew Membership":
  - Navigate to Payment Screen (same as initial purchase)
  - Pre-select last used payment method
  - After successful payment:
    - Extend membership by 1 year from current expiry date
    - Show success message
    - Send confirmation SMS/email

---

### 8. NOTIFICATIONS SCREEN

#### Screen 8.1: Notification Center
**Purpose**: Show all app notifications

**Header**:
- Back button
- Title: "Notifications"
- Mark all as read icon (top-right)
- Filter icon (top-right)

**Filter Options**:
- All Notifications
- Membership Updates
- Promotional Offers
- Transaction Alerts
- System Updates

**Notification Categories & Examples**:

**1. Membership Notifications**:
- "Welcome to Mumuso Membership! 🎉"
- "Your membership expires in 7 days"
- "Membership renewed successfully"
- "Auto-renewal scheduled for [Date]"

**2. Transaction Notifications**:
- "Purchase confirmed - You saved Rs. 150!"
- "Receipt for transaction TXN-XXXXX"

**3. Promotional Notifications**:
- "Weekend Special: Extra 5% off on selected items"
- "Birthday month surprise! Check your offers"
- "New store opening near you"

**4. System Notifications**:
- "App updated to version 2.0"
- "Scheduled maintenance on [Date]"

**Notification Card Design**:
Each notification shows:
- Icon (based on category)
- Title (bold if unread)
- Message body
- Timestamp ("2 hours ago", "Yesterday", "15 Jan 2024")
- Read/Unread indicator (blue dot)
- Swipe actions: Mark as read, Delete

**Empty State**:
- Illustration of bell
- "No notifications yet"
- "We'll notify you about membership updates and special offers"

**Actions**:
- Tap notification → Navigate to relevant screen
  - Transaction notification → Transaction detail
  - Renewal reminder → Renewal screen
  - Promotional offer → Offer details

---

### 9. ADDITIONAL SCREENS

#### Screen 9.1: Store Locator
**Purpose**: Help users find nearest Mumuso stores

**UI Elements**:
- Search bar: "Search by area or store name"
- "Use My Location" button (with permission prompt)
- Map view toggle / List view toggle

**Map View**:
- Google Maps / Apple Maps integration
- Pin markers for each store
- User's current location (blue dot)
- Tap pin → Show store info card

**List View**:
- Sorted by distance from user
- Each store card shows:
  - Store name
  - Address
  - Distance: "2.5 km away"
  - Phone number (tappable to call)
  - Opening hours: "Open until 10:00 PM" / "Closed"
  - "Get Directions" button

**Actions**:
- "Get Directions" → Open in Maps app (Google Maps/Apple Maps)
- "Call Store" → Dial phone number
- "Share Location" → Share via WhatsApp/SMS

---

#### Screen 9.2: Help & Support Screen
**Purpose**: Provide customer assistance

**UI Elements**:

**Contact Options**:
1. **Live Chat** (if implemented)
   - Icon + "Chat with us"
   - Available: 9 AM - 9 PM

2. **Phone Support**
   - Icon + Phone number
   - "Call: 111-MUMUSO"
   - Tap to dial

3. **Email Support**
   - Icon + Email address
   - "support@mumuso.com.pk"
   - Tap to open email app

4. **WhatsApp Support** (if available)
   - Icon + "Message on WhatsApp"
   - Opens WhatsApp with pre-filled message

**FAQ Section**:
- Expandable accordion
- Common questions:
  - "How do I use my membership card?"
  - "What if my QR code doesn't scan?"
  - "How do I renew my membership?"
  - "What products are excluded from discount?"
  - "Can I share my membership?"
  - "How do I change my payment method?"
  - "What if I don't receive my discount?"

**Report an Issue**:
- "Report a Problem" button
- Form with:
  - Issue type dropdown
  - Description text area
  - Attach screenshot option
  - Submit button

**App Version & Info**:
- Version: 1.0.0
- Last updated: [Date]
- "Rate Us" link → App Store/Play Store
- "Share App" → Share download link

---

#### Screen 9.3: Referral Screen (Optional Feature)
**Purpose**: Encourage member acquisition through referrals

**UI Elements**:
- Hero image/illustration
- Title: "Refer Friends & Earn"
- Description: "Give Rs. 200 off, Get 1 month free extension"

**How it Works Section**:
1. Share your unique referral code
2. Friend signs up using your code
3. Friend gets Rs. 200 discount on membership
4. You get 1 month free extension when they purchase

**Referral Stats**:
- "Friends Referred: 3"
- "Months Earned: 3"
- "Pending Referrals: 1"

**Your Referral Code**:
- Large display: "MUMREF-12345"
- "Copy Code" button

**Share Options**:
- WhatsApp
- SMS
- Email
- Facebook
- Copy Link

**Referral History**:
- List of referred friends
- Status: Pending / Completed
- Date referred
- Reward earned

---

### 10. ERROR STATES & EDGE CASES

#### 10.1: No Internet Connection
**UI Elements**:
- Icon: Disconnected wifi/signal
- Title: "No Internet Connection"
- Message: "Please check your internet connection and try again"
- "Retry" button
- "Offline Mode" message: "Some features are unavailable offline"

**Offline Capabilities** (if implemented):
- View membership card QR code (cached)
- View cached purchase history
- Cannot make purchases or renew
- Show "Offline" badge

---

#### 10.2: Server Error
**UI Elements**:
- Icon: Server/cloud with error symbol
- Title: "Something Went Wrong"
- Message: "We're experiencing technical difficulties. Please try again later."
- Error code (for support): "Error Code: 500"
- "Retry" button
- "Contact Support" button

---

#### 10.3: Expired Membership - Blocking State
**UI Elements**:
- Full-screen overlay (cannot dismiss)
- Icon: Expired calendar
- Title: "Membership Expired"
- Message: "Your membership expired on [Date]. Renew now to continue enjoying benefits."
- Shows how much user saved while member
- **Primary CTA**: "Renew Now - Rs. 2,000"
- **Secondary**: "Learn More" (about benefits)

**Allowed Actions When Expired**:
- View profile
- View past purchases (marked as "before expiry")
- Contact support
- Renew membership

**Blocked Actions**:
- Cannot show QR code (displays "Expired - Renew to Activate")
- Cannot use discounts in-store

---

#### 10.4: QR Code Scanning Issues
**Help Screen** (accessible from card screen):
- "QR Code Not Scanning? Try This:"
  1. Increase screen brightness ✓
  2. Make sure screen is clean
  3. Hold steady while cashier scans
  4. If problem persists, show Member ID manually
- "Your Member ID: MUM-XXXXX"
- "Manual Entry Instructions for Cashier" button
- "Call Support: XXX-XXXXXXX"

---

## UI/UX DESIGN GUIDELINES

### Color Palette
**Primary Brand Colors** (get actual from Mumuso):
- Primary: #[HEX] (Mumuso brand color)
- Secondary: #[HEX]
- Accent: #[HEX] (for CTAs and highlights)

**Functional Colors**:
- Success: #10B981 (green)
- Error: #EF4444 (red)
- Warning: #F59E0B (yellow)
- Info: #3B82F6 (blue)

**Neutral Colors**:
- Background: #FFFFFF (light mode), #1F2937 (dark mode)
- Text Primary: #111827 (light mode), #F9FAFB (dark mode)
- Text Secondary: #6B7280
- Border: #E5E7EB
- Card Background: #F9FAFB

---

### Typography
**Font Family**: 
- Primary: "Inter" or "SF Pro" (iOS) / "Roboto" (Android)
- Arabic/Urdu support: "Noto Nastaliq Urdu" (if Urdu language added)

**Font Sizes**:
- Heading 1: 32px, Bold
- Heading 2: 24px, Semi-bold
- Heading 3: 20px, Semi-bold
- Body: 16px, Regular
- Small Text: 14px, Regular
- Caption: 12px, Regular

**Line Height**: 1.5 for body text

---

### Spacing System
Use 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

### Component Design Standards

#### Buttons
**Primary Button**:
- Background: Brand primary color
- Text: White, 16px, Semi-bold
- Padding: 16px vertical, 24px horizontal
- Border radius: 8px
- Shadow: subtle elevation
- States: Default, Hover, Pressed, Disabled

**Secondary Button**:
- Background: Transparent
- Border: 2px solid primary color
- Text: Primary color, 16px, Semi-bold
- Same padding and radius as primary

**Text Button**:
- No background or border
- Text: Primary color, underlined on hover

**Icon Button**:
- Circular or square
- 44px minimum touch target
- Icon size: 24px

---

#### Input Fields
**Text Input**:
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Padding: 12px 16px
- Font size: 16px
- Focus state: Border color changes to primary
- Error state: Border color red, error message below

**Placeholder Style**:
- Color: #9CA3AF
- Font style: Regular

**Label Style**:
- Above input
- Font size: 14px
- Semi-bold
- Color: Text primary

---

#### Cards
**Standard Card**:
- Background: White (or card background color)
- Border radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Padding: 16px
- Margin between cards: 12px

**Membership Card** (premium design):
- Gradient background
- Elevated shadow
- Gold/silver accents (premium feel)
- Border radius: 16px

---

#### QR Code Display
**Requirements**:
- Minimum size: 200x200px (for reliable scanning)
- High contrast: Black on white background
- White padding around QR: minimum 10px
- Error correction level: Medium (M) or High (H)
- Format: PNG or SVG
- Should be crisp even on high-DPI screens

---

### Animations & Transitions

**Page Transitions**:
- Duration: 300ms
- Easing: ease-in-out
- Slide from right for forward navigation
- Slide to right for back navigation

**Button Press**:
- Scale down to 0.95 on tap
- Duration: 100ms

**Loading States**:
- Skeleton screens for content loading
- Shimmer effect on skeleton
- Spinner for button loading states

**Success Animations**:
- Checkmark with scale-up animation
- Confetti for major achievements (membership activation)

**Micro-interactions**:
- Toggle switches: Smooth slide animation
- Checkbox: Bounce effect when checked
- Heart icon: Scale and color change on favorite

---

### Accessibility Requirements

**Minimum Touch Targets**:
- All tappable elements: 44x44pt (iOS) / 48x48dp (Android)

**Text Contrast**:
- WCAG AA compliance minimum
- Body text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

**Screen Reader Support**:
- All UI elements properly labeled
- Meaningful content descriptions
- Announce state changes

**Dynamic Type Support**:
- Text scales with system font size settings
- Layout adapts to larger text

**Color Blindness**:
- Don't rely on color alone for information
- Use icons + text labels
- Error states: Red border + error icon + error text

**RTL Support** (if Urdu added):
- Entire layout mirrors for right-to-left languages
- Text alignment changes
- Icons flip direction where appropriate

---

## DATA MODELS & API SPECIFICATIONS

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    profile_photo_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Memberships Table
```sql
CREATE TABLE memberships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    member_id VARCHAR(20) UNIQUE NOT NULL, -- Format: MUM-XXXXX
    status VARCHAR(20) NOT NULL, -- 'active', 'expired', 'cancelled'
    activation_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    annual_fee DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    qr_code_data TEXT NOT NULL, -- Encoded member_id
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL, -- From POS
    membership_id UUID REFERENCES memberships(id),
    user_id UUID REFERENCES users(id),
    store_id UUID REFERENCES stores(id),
    transaction_date TIMESTAMP NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    items_count INTEGER,
    items_details JSONB, -- Array of items purchased
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Stores Table
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_number VARCHAR(15),
    opening_hours JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    membership_id UUID REFERENCES memberships(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50),
    transaction_reference VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50), -- 'membership', 'transaction', 'promotional', 'system'
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### API Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
```json
Request:
{
    "phone_number": "+923001234567",
    "email": "user@example.com",
    "full_name": "Ahmed Khan",
    "password": "SecurePass123",
    "date_of_birth": "1995-06-15",
    "gender": "male",
    "city": "Karachi"
}

Response (Success - 201):
{
    "success": true,
    "message": "OTP sent to your phone number",
    "data": {
        "user_id": "uuid-here",
        "otp_sent_to": "+923001234567"
    }
}

Response (Error - 400):
{
    "success": false,
    "error": "Phone number already registered"
}
```

---

**POST /api/auth/verify-otp**
```json
Request:
{
    "phone_number": "+923001234567",
    "otp": "123456"
}

Response (Success - 200):
{
    "success": true,
    "message": "Phone verified successfully",
    "data": {
        "user_id": "uuid-here",
        "access_token": "jwt-token-here",
        "refresh_token": "refresh-token-here"
    }
}
```

---

**POST /api/auth/login**
```json
Request:
{
    "identifier": "+923001234567", // phone or email
    "password": "SecurePass123"
}

Response (Success - 200):
{
    "success": true,
    "data": {
        "user_id": "uuid-here",
        "access_token": "jwt-token-here",
        "refresh_token": "refresh-token-here",
        "user": {
            "full_name": "Ahmed Khan",
            "email": "user@example.com",
            "phone_number": "+923001234567",
            "has_active_membership": true
        }
    }
}
```

---

#### Membership Endpoints

**POST /api/membership/purchase**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }
Body:
{
    "payment_method": "jazzcash",
    "promo_code": "WELCOME10" // optional
}

Response (Success - 200):
{
    "success": true,
    "data": {
        "payment_url": "https://jazzcash.gateway.com/pay?ref=xxx",
        "payment_reference": "PAY-XXXXX",
        "amount": 1800, // After promo code
        "original_amount": 2000
    }
}
```

---

**GET /api/membership/status**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }

Response (Success - 200):
{
    "success": true,
    "data": {
        "member_id": "MUM-12345",
        "status": "active",
        "activation_date": "2024-01-15T10:30:00Z",
        "expiry_date": "2025-01-15T10:30:00Z",
        "days_remaining": 320,
        "qr_code_url": "https://api.mumuso.com/qr/MUM-12345",
        "total_savings": 1250.50,
        "total_purchases": 15
    }
}

Response (No Active Membership - 200):
{
    "success": true,
    "data": {
        "status": "none",
        "message": "No active membership"
    }
}
```

---

**POST /api/membership/validate** (Called by POS at checkout)
```json
Request:
Headers: { "X-API-Key": "pos-api-key-here" }
Body:
{
    "member_id": "MUM-12345",
    "store_id": "store-uuid",
    "transaction_amount": 2500
}

Response (Success - 200):
{
    "success": true,
    "data": {
        "is_valid": true,
        "member_name": "Ahmed Khan",
        "discount_applicable": true,
        "discount_percentage": 10,
        "discount_amount": 250,
        "final_amount": 2250
    }
}

Response (Invalid/Expired - 200):
{
    "success": true,
    "data": {
        "is_valid": false,
        "reason": "Membership expired on 2024-12-15",
        "discount_applicable": false
    }
}
```

---

#### Transaction Endpoints

**POST /api/transactions/sync** (Called by POS after payment)
```json
Request:
Headers: { "X-API-Key": "pos-api-key-here" }
Body:
{
    "transaction_id": "TXN-20240115-001",
    "member_id": "MUM-12345",
    "store_id": "store-uuid",
    "transaction_date": "2024-01-15T14:30:00Z",
    "original_amount": 2500,
    "discount_amount": 250,
    "final_amount": 2250,
    "tax_amount": 200,
    "payment_method": "cash",
    "items": [
        {
            "item_name": "Cute Notebook",
            "quantity": 1,
            "unit_price": 150,
            "total": 150
        },
        {
            "item_name": "Pen Set",
            "quantity": 2,
            "unit_price": 80,
            "total": 160
        }
    ]
}

Response (Success - 201):
{
    "success": true,
    "message": "Transaction recorded successfully",
    "data": {
        "transaction_uuid": "uuid-here"
    }
}
```

---

**GET /api/transactions/history**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }
Query Params: {
    "limit": 20,
    "offset": 0,
    "from_date": "2024-01-01",
    "to_date": "2024-01-31",
    "store_id": "uuid" // optional
}

Response (Success - 200):
{
    "success": true,
    "data": {
        "transactions": [
            {
                "id": "uuid",
                "transaction_id": "TXN-20240115-001",
                "store_name": "Mumuso - Dolmen Mall",
                "date": "2024-01-15T14:30:00Z",
                "original_amount": 2500,
                "discount_amount": 250,
                "final_amount": 2250,
                "items_count": 3,
                "payment_method": "cash"
            }
        ],
        "total_count": 45,
        "total_spent": 45000,
        "total_saved": 4500
    }
}
```

---

**GET /api/transactions/{id}**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }

Response (Success - 200):
{
    "success": true,
    "data": {
        "transaction_id": "TXN-20240115-001",
        "store": {
            "name": "Mumuso - Dolmen Mall",
            "address": "Clifton, Karachi"
        },
        "date": "2024-01-15T14:30:00Z",
        "items": [
            {
                "name": "Cute Notebook",
                "quantity": 1,
                "unit_price": 150,
                "total": 150
            }
        ],
        "subtotal": 610,
        "discount": 61,
        "tax": 50,
        "total": 599,
        "payment_method": "cash",
        "member_id": "MUM-12345"
    }
}
```

---

#### Store Endpoints

**GET /api/stores**
```json
Request:
Query Params: {
    "latitude": 24.8607,
    "longitude": 67.0011,
    "radius": 10 // km
}

Response (Success - 200):
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Mumuso - Dolmen Mall Clifton",
            "address": "HC 3, Rahat Commercial Area Clifton, Karachi",
            "city": "Karachi",
            "phone": "+92-XXX-XXXXXXX",
            "distance": 2.3, // km from user
            "latitude": 24.8125,
            "longitude": 67.0307,
            "opening_hours": {
                "monday": "10:00-22:00",
                "tuesday": "10:00-22:00"
            },
            "is_open_now": true
        }
    ]
}
```

---

#### Notification Endpoints

**GET /api/notifications**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }
Query Params: {
    "limit": 20,
    "offset": 0,
    "category": "membership" // optional
}

Response (Success - 200):
{
    "success": true,
    "data": {
        "notifications": [
            {
                "id": "uuid",
                "title": "Welcome to Mumuso!",
                "message": "Your membership is now active",
                "category": "membership",
                "is_read": false,
                "created_at": "2024-01-15T10:30:00Z",
                "action_url": "/membership"
            }
        ],
        "unread_count": 3
    }
}
```

---

**PATCH /api/notifications/{id}/read**
```json
Request:
Headers: { "Authorization": "Bearer jwt-token" }

Response (Success - 200):
{
    "success": true,
    "message": "Notification marked as read"
}
```

---

### Push Notification Payloads

**Membership Activated**
```json
{
    "notification": {
        "title": "Welcome to Mumuso Membership! 🎉",
        "body": "Your membership is now active. Start saving 10% today!",
        "sound": "default",
        "badge": 1
    },
    "data": {
        "type": "membership_activated",
        "action": "open_membership_card"
    }
}
```

**Renewal Reminder**
```json
{
    "notification": {
        "title": "Membership Expiring Soon ⏰",
        "body": "Your membership expires in 7 days. Renew now to keep saving!",
        "sound": "default"
    },
    "data": {
        "type": "renewal_reminder",
        "action": "open_renewal_screen",
        "days_remaining": 7
    }
}
```

**Purchase Receipt**
```json
{
    "notification": {
        "title": "Purchase Confirmed! 🛍️",
        "body": "You saved Rs. 250 on your recent purchase. View receipt.",
        "sound": "default"
    },
    "data": {
        "type": "transaction_completed",
        "action": "open_transaction_detail",
        "transaction_id": "uuid"
    }
}
```

---

## POS INTEGRATION WORKFLOW

### Checkout Flow - Detailed Steps

**Step 1: Customer Initiates Checkout**
```
1. Customer brings items to cashier
2. Cashier starts new transaction in CBS POS
3. Cashier scans all product barcodes
4. CBS POS calculates original total
```

**Step 2: Member Identification**
```
5. Cashier asks: "Are you a Mumuso member?"
6. Customer says yes and opens app
7. Customer navigates to "My Card" screen
8. Customer shows QR code on phone
```

**Step 3: QR Code Scanning**
```
9. Cashier clicks "Scan Member QR" button in CBS POS
10. Cashier uses barcode scanner to scan phone QR code
11. CBS POS reads QR code data: "MUM-12345"
```

**Step 4: Membership Validation (API Call)**
```
12. CBS POS sends API request to your backend:

POST https://api.mumuso-loyalty.com/validate
Headers: { "X-API-Key": "pos-api-key" }
Body: {
    "member_id": "MUM-12345",
    "store_id": "store-uuid",
    "transaction_amount": 2500,
    "transaction_items": [...]
}

13. Your backend checks:
    - Is member_id valid?
    - Is membership active (not expired)?
    - Is transaction_amount > minimum (if applicable)?

14. Your backend responds within 2 seconds:
{
    "is_valid": true,
    "member_name": "Ahmed Khan",
    "discount_percentage": 10,
    "discount_amount": 250,
    "final_amount": 2250,
    "message": "Discount applied successfully"
}
```

**Step 5: Discount Application**
```
15. CBS POS receives validation response
16. CBS POS shows on screen:
    - "Member: Ahmed Khan"
    - "Discount: Rs. 250 (10%)"
17. CBS POS automatically applies discount to transaction
18. New total shows: Rs. 2,250 (from Rs. 2,500)
```

**Step 6: Payment**
```
19. Customer pays Rs. 2,250
20. CBS POS completes transaction
21. CBS POS prints receipt showing:
    - Original amount
    - Membership discount
    - Final amount
    - "Thank you for being a member!"
```

**Step 7: Transaction Sync (Webhook)**
```
22. CBS POS sends transaction data to your backend:

POST https://api.mumuso-loyalty.com/transactions/sync
Headers: { "X-API-Key": "pos-api-key" }
Body: {
    "transaction_id": "TXN-20240115-001",
    "member_id": "MUM-12345",
    "store_id": "store-uuid",
    "timestamp": "2024-01-15T14:30:00Z",
    "original_amount": 2500,
    "discount_amount": 250,
    "final_amount": 2250,
    "items": [...],
    "payment_method": "cash"
}

23. Your backend stores transaction
24. Your backend sends push notification to customer's app
```

**Step 8: App Update**
```
25. Customer opens app later
26. Sees new purchase in "Purchase History"
27. Total savings counter updated
28. Push notification: "You saved Rs. 250! View receipt."
```

---

### Error Scenarios & Handling

**Scenario 1: QR Code Won't Scan**
```
Problem: Scanner can't read QR code (screen too dim, broken scanner, etc.)

Fallback:
1. Cashier clicks "Manual Entry" in CBS POS
2. Customer tells Member ID: "MUM-12345"
3. Cashier types it manually
4. Rest of flow continues as normal

App Help:
- "QR not scanning? Show your Member ID to cashier"
- Display Member ID in large text
- Brightness auto-increase when card is opened
```

**Scenario 2: Internet/API Down**
```
Problem: CBS POS can't reach your API (internet down, server issue)

Handling:
1. CBS POS shows: "Unable to validate membership"
2. Cashier offers two options:
   a) Customer pays full price now, claims refund later
   b) Skip discount, transaction logged for manual adjustment

Your Backend:
- When API comes back online, sync missed transactions
- Send notification to affected members: "We'll credit your discount"
```

**Scenario 3: Expired Membership**
```
Problem: Member tries to use expired membership

API Response:
{
    "is_valid": false,
    "reason": "Membership expired on 2024-12-15",
    "discount_applicable": false,
    "renewal_url": "https://app.mumuso.com/renew"
}

POS Shows:
- "Membership expired. No discount available."
- "Ask customer to renew via app"

App Shows:
- QR code is grayed out with "EXPIRED" watermark
- "Renew Now" button prominently displayed
```

**Scenario 4: Duplicate Transaction**
```
Problem: Transaction accidentally sent twice

Prevention:
- Each transaction has unique transaction_id from POS
- Your backend checks: "Does this transaction_id already exist?"
- If yes: Respond "Already processed" but don't store duplicate
```

---

## SECURITY & COMPLIANCE

### Data Security

**Encryption**:
- All API calls use HTTPS (TLS 1.2+)
- Passwords hashed with bcrypt (cost factor 12+)
- JWT tokens expire after 7 days
- Refresh tokens stored securely, expire after 30 days

**PII Protection**:
- Phone numbers partially masked in logs: +92-XXX-XXX-4567
- Credit card numbers never stored (handled by payment gateway)
- GDPR-like data handling: users can request data deletion

**API Security**:
- Rate limiting: 100 requests/minute per user
- POS API requires API key authentication
- All sensitive endpoints require JWT authentication
- CORS properly configured

---

### Privacy Compliance

**User Consent**:
- Clear privacy policy during registration
- Explicit consent for marketing notifications
- Option to opt-out of promotional messages
- Data retention policy: 3 years after account closure

**Data Access**:
- Users can download their data via app
- Users can request account deletion
- Deletion cascades to all related data (except financial records for compliance)

---

### Payment Security

**PCI DSS Compliance**:
- Never store card numbers in your database
- All card payments through PCI-compliant gateways
- Use tokenization for saved payment methods

**Payment Verification**:
- 3D Secure / OTP verification for card payments
- Payment confirmation emails sent immediately
- Failed payment attempts logged and monitored

---

## PERFORMANCE REQUIREMENTS

### App Performance

**Load Times**:
- App launch to splash screen: < 1 second
- Splash to main screen: < 2 seconds
- API response time: < 2 seconds (95th percentile)
- QR code generation: Instant (pre-generated)

**Offline Capability**:
- Membership card viewable offline (cached)
- Purchase history cached (last 30 days)
- App usable with degraded functionality when offline

**App Size**:
- iOS: < 50 MB download
- Android: < 40 MB download

---

### Backend Performance

**Database**:
- User queries: < 100ms
- Transaction queries: < 200ms
- Analytics queries: < 500ms
- Use indexing on frequently queried fields

**Scalability**:
- Handle 10,000 concurrent users
- Process 1,000 transactions per minute
- API rate: 99.9% uptime SLA

**Caching**:
- Redis cache for membership validation (instant lookup)
- CDN for static assets (QR codes, images)
- Cache invalidation on membership status change

---

## TESTING REQUIREMENTS

### Unit Testing
- All API endpoints have test coverage
- Business logic functions tested
- Minimum 80% code coverage

### Integration Testing
- Test POS API integration end-to-end
- Test payment gateway webhooks
- Test push notification delivery

### User Acceptance Testing
- Beta test with 50-100 real users
- Pilot store testing before full rollout
- Gather feedback and iterate

### Security Testing
- Penetration testing before launch
- SQL injection prevention verified
- XSS attack prevention verified

---

## DEPLOYMENT & DEVOPS

### Environments
1. **Development**: For active development
2. **Staging**: Mirror of production for testing
3. **Production**: Live app serving real users

### CI/CD Pipeline
- Automated builds on code commit
- Automated tests run before deployment
- Blue-green deployment for zero downtime
- Rollback capability in case of issues

### Monitoring
- Application Performance Monitoring (APM)
- Error tracking (Sentry or similar)
- User analytics (Firebase Analytics)
- Server health monitoring
- Alert system for critical errors

---

## LAUNCH CHECKLIST

### Pre-Launch (2 weeks before)
- [ ] CBS POS integration tested in pilot store
- [ ] Payment gateways tested with real transactions
- [ ] App submitted to App Store and Play Store
- [ ] Admin dashboard fully functional
- [ ] Customer support trained
- [ ] Marketing materials prepared
- [ ] Terms of Service and Privacy Policy finalized

### Launch Day
- [ ] App approved and live on stores
- [ ] Backend servers monitored closely
- [ ] Support team on standby
- [ ] Marketing campaign activated
- [ ] First 100 sign-ups monitored for issues

### Post-Launch (First week)
- [ ] Daily monitoring of error rates
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately
- [ ] Track KPIs: Sign-ups, purchases, issues

---

## SUCCESS METRICS (KPIs)

### User Acquisition
- Daily/Weekly/Monthly new member sign-ups
- Conversion rate: App downloads → Paid memberships
- Marketing campaign attribution

### Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration
- QR code scans per member per month

### Revenue
- Monthly Recurring Revenue (MRR) from memberships
- Renewal rate after first year
- Average transaction value: Members vs Non-members
- Total discount given vs Membership revenue

### Customer Satisfaction
- App store rating (target: 4.5+)
- NPS (Net Promoter Score)
- Support ticket volume and resolution time
- Feature request frequency

---

## FUTURE ENHANCEMENTS (Post-Launch)

### Phase 2 Features
- Points/rewards system (earn points per purchase)
- Referral program (get free months for referrals)
- Birthday month special offers
- Tiered membership (Silver, Gold, Platinum)

### Phase 3 Features
- Product catalog in app
- Wishlist functionality
- In-app exclusive deals
- Social sharing of savings

### Phase 4 Features
- AI-powered personalized recommendations
- Gamification (badges, achievements)
- Community features (member reviews)
- Integration with e-commerce platform

---

## SUPPORT & MAINTENANCE

### Customer Support Channels
- In-app chat (9 AM - 9 PM)
- Phone: 111-MUMUSO
- Email: support@mumuso.com.pk
- WhatsApp Business
- FAQ section in app

### Maintenance Schedule
- Regular app updates every 2 weeks (bug fixes)
- Major feature releases quarterly
- Server maintenance: Sundays 2-4 AM (low traffic)
- Security patches applied immediately

---

## CONCLUSION

This prompt provides a comprehensive blueprint for developing the Mumuso Loyalty App. The app must be:

1. **User-Friendly**: Simple registration, easy-to-use QR card, clear purchase history
2. **Reliable**: Fast API responses, offline fallback, error handling
3. **Secure**: Encrypted data, secure payments, privacy compliance
4. **Scalable**: Handle thousands of users and transactions
5. **Integrated**: Seamless CBS POS integration is critical

**Critical Success Factors**:
- CBS POS integration must work flawlessly
- QR code scanning must be reliable
- Payment processing must be smooth
- App performance must be fast
- Customer support must be responsive

**Development Priority Order**:
1. Backend API + Database (Foundation)
2. POS Integration (Critical path)
3. Mobile App Core Features (Registration, Card, History)
4. Payment Gateway Integration
5. Admin Dashboard
6. Additional Features (Notifications, Referrals, etc.)

**Timeline**: 6-8 months for MVP launch, assuming CBS cooperation.

---

## APPENDIX: DESIGN ASSETS NEEDED

From Mumuso:
- [ ] Official logo (SVG, PNG in various sizes)
- [ ] Brand color codes (HEX values)
- [ ] Font preferences (if any)
- [ ] Icon style guide
- [ ] Sample product images
- [ ] Store photos
- [ ] Marketing copy and messaging

This completes the comprehensive development prompt for the Mumuso Loyalty App. Use this document as your single source of truth for all design and development decisions.

---

**Document Version**: 1.0  
**Last Updated**: February 10, 2026  
**Author**: Development Team  
**Status**: Ready for AI Design & Development
