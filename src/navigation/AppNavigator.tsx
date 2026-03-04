import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { spacing, fontWeight, radius } from '../constants/dimensions';
import { RootStackParamList, BottomTabParamList } from '../types';
import { useAuth } from '../services/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import WelcomeSplashScreen from '../screens/WelcomeSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthChoiceScreen from '../screens/AuthChoiceScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MembershipPromptScreen from '../screens/MembershipPromptScreen';
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

const TAB_CONFIG: Record<string, { label: string; icon: string; activeIcon: string }> = {
  Home: { label: 'HOME', icon: 'home-outline', activeIcon: 'home' },
  MyCard: { label: 'CARD', icon: 'qr-code-outline', activeIcon: 'qr-code' },
  History: { label: 'HISTORY', icon: 'time-outline', activeIcon: 'time' },
  Profile: { label: 'PROFILE', icon: 'person-outline', activeIcon: 'person' },
};

function TabIcon({ focused, routeName }: { focused: boolean; routeName: string }) {
  const config = TAB_CONFIG[routeName];
  return (
    <View style={tabStyles.iconContainer}>
      {focused && <View style={tabStyles.activeIndicator} />}
      <Ionicons
        name={focused ? config.activeIcon : config.icon}
        size={22}
        color={focused ? colors.tabActive : colors.tabInactive}
      />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 64 + (Platform.OS === 'ios' ? 34 : 0),
          paddingBottom: Platform.OS === 'ios' ? 34 : 12,
          paddingTop: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: colors.accent.default,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: fontWeight.bold,
          letterSpacing: 0.5,
          marginTop: 4,
        },
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabIcon focused={focused} routeName={route.name} />
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: TAB_CONFIG.Home.label }} />
      <Tab.Screen name="MyCard" component={MyCardScreen} options={{ tabBarLabel: TAB_CONFIG.MyCard.label }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: TAB_CONFIG.History.label }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: TAB_CONFIG.Profile.label }} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.accent.default,
  },
});

export default function AppNavigator() {
  const { isLoading, isLoggedIn, hasSeenOnboarding, isFirstTimeUser, user, dashboard, completeOnboarding, completeWelcome } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSplashFinish = useCallback(() => { setShowSplash(false); }, []);
  const handleOnboardingComplete = useCallback(() => { completeOnboarding(); }, [completeOnboarding]);
  const handleWelcomeFinish = useCallback(() => { 
    setShowWelcome(false); 
    completeWelcome(); 
  }, [completeWelcome]);

  if (isLoading || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isFirstTimeUser && !showWelcome && isLoggedIn) {
    setShowWelcome(true);
  }

  if (showWelcome && user) {
    return <WelcomeSplashScreen userName={user.full_name} onFinish={handleWelcomeFinish} />;
  }

  const shouldShowMembershipPrompt = isLoggedIn && !isFirstTimeUser && dashboard && !dashboard.has_membership;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        initialRouteName={shouldShowMembershipPrompt ? 'MembershipPrompt' : undefined}>
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
            {shouldShowMembershipPrompt && (
              <Stack.Screen name="MembershipPrompt" component={MembershipPromptScreen} />
            )}
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
