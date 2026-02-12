import React, { useState, useCallback } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import { fontSize, fontWeight } from '../constants/dimensions';
import { RootStackParamList, BottomTabParamList } from '../types';
import { useAuth } from '../services/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthChoiceScreen from '../screens/AuthChoiceScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MembershipPurchaseScreen from '../screens/MembershipPurchaseScreen';
import PaymentProcessingScreen from '../screens/PaymentProcessingScreen';
import MembershipSuccessScreen from '../screens/MembershipSuccessScreen';
import HomeScreen from '../screens/HomeScreen';
import MyCardScreen from '../screens/MyCardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import StoreLocatorScreen from '../screens/StoreLocatorScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ReferralScreen from '../screens/ReferralScreen';
import RenewalScreen from '../screens/RenewalScreen';
import QRHelpScreen from '../screens/QRHelpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '\u{1F3E0}',
  MyCard: '\u{1F4B3}',
  History: '\u{1F4CB}',
  Profile: '\u{1F464}',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 65, paddingBottom: 8, paddingTop: 8, backgroundColor: '#ffffff',
          borderTopWidth: 1, borderTopColor: colors.neutral[100], elevation: 8,
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyCard" component={MyCardScreen} options={{ tabBarLabel: 'My Card' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading, isLoggedIn, hasSeenOnboarding, completeOnboarding } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => { setShowSplash(false); }, []);
  const handleOnboardingComplete = useCallback(() => { completeOnboarding(); }, [completeOnboarding]);

  if (isLoading || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isLoggedIn ? (
          <>
            {!hasSeenOnboarding && (
              <Stack.Screen name="Onboarding">
                {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
              </Stack.Screen>
            )}
            <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="MembershipPurchase" component={MembershipPurchaseScreen} />
            <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
            <Stack.Screen name="MembershipSuccess" component={MembershipSuccessScreen} />
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
            <Stack.Screen name="RenewalScreen" component={RenewalScreen} />
            <Stack.Screen name="QRHelp" component={QRHelpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
