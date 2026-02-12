import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Membership } from '../types';
import { MOCK_USER, MOCK_MEMBERSHIP } from './mockData';
import { generateMemberId } from '../utils';

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  user: User | null;
  membership: Membership | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  updateUser: (data: Partial<User>) => void;
  updateMembership: (data: Partial<Membership>) => void;
  purchaseMembership: (method: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    loadStoredState();
  }, []);

  const loadStoredState = async () => {
    try {
      const [token, onboarding] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('has_seen_onboarding'),
      ]);
      if (onboarding === 'true') setHasSeenOnboarding(true);
      if (token) {
        setUser(MOCK_USER);
        setMembership(MOCK_MEMBERSHIP);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to load auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    // NOT SUPPORTED YET: Real backend authentication (POST /api/auth/login).
    // Currently accepts any non-empty credentials.
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (!identifier || !password) return { success: false, error: 'Please fill in all fields' };
    await AsyncStorage.setItem('auth_token', 'mock_token_123');
    setUser(MOCK_USER);
    setMembership(MOCK_MEMBERSHIP);
    setIsLoggedIn(true);
    return { success: true };
  };

  const register = async (data: Partial<User> & { password: string }) => {
    // NOT SUPPORTED YET: Real backend registration (POST /api/auth/register).
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (!data.full_name || !data.phone_number || !data.email || !data.password) {
      return { success: false, error: 'Please fill in all required fields' };
    }
    return { success: true };
  };

  const verifyOTP = async (otp: string) => {
    // NOT SUPPORTED YET: Real OTP verification via SMS provider.
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === '123456' || otp.length === 6) {
      await AsyncStorage.setItem('auth_token', 'mock_token_123');
      const newUser: User = {
        ...MOCK_USER,
        id: 'usr_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(newUser);
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP code' };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
    setMembership(null);
    setIsLoggedIn(false);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const updateUser = (data: Partial<User>) => {
    // NOT SUPPORTED YET: Real profile update via backend API.
    if (user) setUser({ ...user, ...data, updated_at: new Date().toISOString() });
  };

  const updateMembership = (data: Partial<Membership>) => {
    if (membership) setMembership({ ...membership, ...data });
  };

  const purchaseMembership = async (method: string) => {
    // NOT SUPPORTED YET: Real payment processing via payment gateway.
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newMembership: Membership = {
      id: 'mem_' + Date.now(),
      member_id: generateMemberId(),
      user_id: user?.id || 'usr_001',
      status: 'active',
      purchase_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      auto_renew: false,
      payment_method: method,
      amount_paid: 2000,
      total_savings: 0,
      total_purchases: 0,
      qr_code_data: '',
    };
    newMembership.qr_code_data = `${newMembership.member_id}-${new Date().getFullYear()}`;
    setMembership(newMembership);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      isLoading, isLoggedIn, hasSeenOnboarding, user, membership,
      login, register, verifyOTP, logout, completeOnboarding,
      updateUser, updateMembership, purchaseMembership,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
