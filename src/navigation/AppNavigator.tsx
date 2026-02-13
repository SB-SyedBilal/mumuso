import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import { spacing, fontWeight } from '../constants/dimensions';
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

const TAB_CONFIG: Record<string, { label: string; icon: string; activeIcon: string }> = {
  Home:    { label: 'HOME',    icon: '\u25CB', activeIcon: '\u25CF' },
  MyCard:  { label: 'CARD',    icon: '\u25A1', activeIcon: '\u25A0' },
  History: { label: 'HISTORY', icon: '\u25B3', activeIcon: '\u25B2' },
  Profile: { label: 'PROFILE', icon: '\u25C7', activeIcon: '\u25C6' },
};

function TabIcon({ focused, routeName }: { focused: boolean; routeName: string }) {
  const config = TAB_CONFIG[routeName];
  return (
    <View style={tabStyles.iconContainer}>
      {focused && <View style={tabStyles.activeIndicator} />}
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
        {focused ? config.activeIcon : config.icon}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 56 + (Platform.OS === 'ios' ? 34 : 0),
          paddingBottom: Platform.OS === 'ios' ? 34 : 8,
          paddingTop: 8,
          backgroundColor: 'rgba(245,243,240,0.88)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          elevation: 0,
        },
        tabBarActiveTintColor: colors.tabActiveLabel,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: fontWeight.medium,
          letterSpacing: 10 * 0.06,
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
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent.default,
  },
  icon: {
    fontSize: 20,
    color: colors.tabInactive,
  },
  iconActive: {
    color: colors.tabActive,
  },
});

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
