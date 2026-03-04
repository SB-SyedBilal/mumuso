# Mumuso App - Setup Instructions

## Recent Updates

### ✅ Implemented Features

1. **Welcome Splash Screen for First-Time Users**
   - New users see a personalized welcome screen with their name after registration
   - Smooth animation with fade and scale effects
   - Automatically dismisses after 2.5 seconds

2. **Membership Prompt for New Users**
   - First-time users without membership are shown a dedicated prompt screen
   - Highlights membership benefits with icons and descriptions
   - Options to "Get Membership Now" or "Maybe Later"
   - Prevents showing expired card to new users

3. **Fixed Icon Display Issues**
   - Added proper vector icons configuration to Android build.gradle
   - Icons from `react-native-vector-icons` (Ionicons) now render correctly

4. **Fixed QR Code Rendering**
   - Improved QR code generation and display
   - Better error handling for QR code library
   - Proper fallback when QR code cannot be generated

## Prerequisites

- Node.js 18 or higher
- React Native development environment set up
- Android Studio (for Android development)
- Java Development Kit (JDK) 11 or higher

## Installation Steps

### 1. Install Dependencies

**IMPORTANT**: Due to Windows cmd buffering issues, you must run npm install manually from PowerShell or Git Bash:

```bash
npm install
```

### 2. Android Setup

The vector icons are now properly configured. After installing dependencies, you need to:

1. **Clean the Android build** (if you've built before):
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild the app**:
   ```bash
   npm run android
   ```

### 3. Backend Setup (Optional for Testing)

If you want to test with the real backend:

1. Navigate to the backend directory:
   ```bash
   cd mumuso-backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy `.env.example` to `.env`)

4. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the backend:
   ```bash
   npm run dev
   ```

## User Flow for First-Time Registration

1. **Onboarding** → User sees app introduction (first launch only)
2. **Registration** → User creates account with email/phone/password
3. **OTP Verification** → User verifies phone number
4. **Welcome Splash** → Personalized welcome screen with user's name (NEW!)
5. **Membership Prompt** → User is prompted to get membership (NEW!)
   - Option 1: "Get Membership Now" → Navigate to membership purchase
   - Option 2: "Maybe Later" → Navigate to main app
6. **Main App** → User can explore the app

## Key Files Modified

### New Files Created:
- `src/screens/WelcomeSplashScreen.tsx` - Welcome splash for new users
- `src/screens/MembershipPromptScreen.tsx` - Membership prompt screen

### Modified Files:
- `src/services/AuthContext.tsx` - Added `isFirstTimeUser` state and `completeWelcome()` function
- `src/navigation/AppNavigator.tsx` - Updated navigation flow for first-time users
- `src/screens/MyCardScreen.tsx` - Fixed QR code rendering
- `src/types/index.ts` - Added new screen types to navigation
- `android/app/build.gradle` - Added vector icons font configuration

## Testing the New Features

### Test Welcome Splash:
1. Register a new account
2. Complete OTP verification
3. You should see the welcome splash with your name
4. After 2.5 seconds, you'll see the membership prompt

### Test Membership Prompt:
1. After welcome splash, you'll see the membership benefits screen
2. Click "Get Membership Now" to go to purchase flow
3. Click "Maybe Later" to skip to main app

### Test Icons:
1. Navigate through the app
2. All Ionicons should now display properly in:
   - Bottom navigation tabs
   - Home screen quick actions
   - Profile screen options
   - Card screen actions

### Test QR Code:
1. Go to "My Card" tab
2. Tap the card to flip to QR code side
3. QR code should render properly (if you have an active membership)
4. Tap the expand icon to see full-screen QR code

## Troubleshooting

### Icons Not Showing
If icons still don't show after rebuilding:
1. Clear Android build cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Delete `android/app/build` folder
3. Rebuild: `npm run android`

### QR Code Not Rendering
- Ensure `react-native-qrcode-svg` and `react-native-svg` are installed
- Check console for any error messages
- The app will show a fallback (member ID text) if QR code fails

### Welcome Splash Not Showing
- This only shows for NEW registrations
- If you're testing with an existing account, you won't see it
- Clear app data or register a new account to test

## External Dependencies

All required dependencies are already in `package.json`:
- ✅ `react-native-vector-icons` - For icons (Ionicons)
- ✅ `react-native-qrcode-svg` - For QR code generation
- ✅ `react-native-svg` - Required by QR code library
- ✅ `@react-native-async-storage/async-storage` - For storing user state
- ✅ `react-native-gesture-handler` - For gestures
- ✅ `react-native-reanimated` - For animations

**No additional external packages needed!**

## Notes

- The welcome splash uses React Native's built-in `Animated` API
- First-time user detection is based on the OTP verification flow
- Membership prompt only shows if user doesn't have an active membership
- All changes are backward compatible with existing users
