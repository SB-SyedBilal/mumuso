# Mumuso - React Native Application

A professional React Native application built with TypeScript and organized with industry best practices.

## 📱 About

Mumuso is a React Native CLI application with a clean, professional architecture designed for scalability and maintainability.

## 🏗️ Project Structure

```
mumuso/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Button, Input, etc.)
│   │   └── index.ts        # Component exports
│   ├── screens/            # Application screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services and integrations
│   │   └── api/           # API calls
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React Context providers
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants (colors, dimensions)
│   ├── styles/            # Global styles and theme
│   ├── assets/            # Static assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── types/             # TypeScript type definitions
│   └── config/            # App configuration
├── android/               # Android native code
├── ios/                   # iOS native code
└── App.tsx               # Root application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- JDK 11 or higher
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

### Running the App

Start Metro bundler:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS (macOS only):
```bash
npm run ios
```

## 🎨 Design System

The app includes a comprehensive design system with:
- **Colors**: Primary, neutral, semantic color palettes
- **Spacing**: Consistent spacing scale (xs to xxl)
- **Typography**: Font sizes and weights
- **Shadows**: Shadow presets for depth
- **Border Radius**: Rounded corner presets

Import and use the theme:
```typescript
import { theme } from './src/styles';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral.white,
    borderRadius: theme.borderRadius.lg,
  },
});
```

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📦 Building

Build for Android:
```bash
cd android && ./gradlew assembleRelease
```

Build for iOS (macOS only):
```bash
cd ios && xcodebuild -scheme mumuso -configuration Release
```

## 📝 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linter:
```bash
npm run lint
```

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Import from barrel exports (index.ts files)
4. Follow the design system for styling
5. Write tests for new features

## 📄 License

MIT

## 👥 Team

Mumuso Development Team
