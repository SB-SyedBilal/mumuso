import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  DashboardData,
  MemberStatus,
  LoginResponse,
  RegisterResponse,
  VerifyOTPResponse,
  CreateOrderResponse,
  MembershipPlan,
} from '../types';
import { api, storeTokens, clearTokens } from './apiClient';

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  isFirstTimeUser: boolean;
  user: User | null;
  dashboard: DashboardData | null;
  memberStatus: MemberStatus | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { full_name: string; email: string; phone: string; password: string; confirm_password: string }) => Promise<{ success: boolean; error?: string; user_id?: string; dev_otp?: string }>;
  verifyOTP: (code: string, userId: string, type: 'registration' | 'password_reset') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  completeWelcome: () => void;
  updateUser: (data: { full_name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshDashboard: () => Promise<void>;
  refreshMemberStatus: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (userId: string, code: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  createMembershipOrder: (planId: string) => Promise<{ success: boolean; error?: string; data?: CreateOrderResponse }>;
  fetchPlans: () => Promise<{ success: boolean; plans?: MembershipPlan[]; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);

  useEffect(() => {
    loadStoredState();
  }, []);

  const loadStoredState = async () => {
    try {
      const [token, onboarding] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('has_seen_onboarding'),
      ]);
      if (onboarding === 'true') setHasSeenOnboarding(true);
      if (token) {
        // Try to load dashboard to verify token is still valid
        const dashRes = await api.get<DashboardData>('/member/dashboard');
        if (dashRes.success && dashRes.data) {
          // Token valid — restore session from dashboard + status
          const statusRes = await api.get<MemberStatus>('/member/status');
          setDashboard(dashRes.data);
          if (statusRes.success && statusRes.data) setMemberStatus(statusRes.data);
          // Reconstruct user from stored data
          const storedUser = await AsyncStorage.getItem('user_data');
          if (storedUser) setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        } else {
          // Token expired/invalid — clear
          await clearTokens();
          await AsyncStorage.removeItem('user_data');
        }
      }
    } catch (e) {
      console.error('Failed to load auth state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) return { success: false, error: 'Please fill in all fields' };

    const res = await api.post<LoginResponse>('/auth/login', { email, password }, false);
    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Login failed' };
    }

    const { access_token, refresh_token, user: authUser } = res.data;
    await storeTokens(access_token, refresh_token);

    const localUser: User = {
      id: authUser.id,
      full_name: authUser.full_name,
      email: authUser.email,
      phone: authUser.phone,
      role: authUser.role,
      has_membership: authUser.has_membership,
    };
    await AsyncStorage.setItem('user_data', JSON.stringify(localUser));
    setUser(localUser);
    setIsLoggedIn(true);

    // Load dashboard in background
    refreshDashboard();
    refreshMemberStatus();

    return { success: true };
  };

  const register = async (data: { full_name: string; email: string; phone: string; password: string; confirm_password: string }) => {
    const res = await api.post<RegisterResponse>('/auth/register', {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirm_password: data.confirm_password,
    }, false);

    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Registration failed' };
    }

    return { success: true, user_id: res.data.user_id, dev_otp: res.data.dev_otp };
  };

  const verifyOTP = async (code: string, userId: string, type: 'registration' | 'password_reset') => {
    const res = await api.post<VerifyOTPResponse>('/auth/verify-otp', {
      user_id: userId,
      code,
      type,
    }, false);

    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Verification failed' };
    }

    // For registration — tokens are returned, log user in
    if (type === 'registration' && res.data.access_token) {
      const { access_token, refresh_token, user: authUser } = res.data;
      await storeTokens(access_token, refresh_token);

      const localUser: User = {
        id: authUser.id,
        full_name: authUser.full_name,
        email: authUser.email,
        phone: '',
        role: authUser.role,
        has_membership: authUser.has_membership,
      };
      await AsyncStorage.setItem('user_data', JSON.stringify(localUser));
      setUser(localUser);
      setIsLoggedIn(true);
      setIsFirstTimeUser(true);

      refreshDashboard();
      refreshMemberStatus();
    }

    return { success: true };
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch { /* best effort */ }
    await clearTokens();
    await AsyncStorage.removeItem('user_data');
    setUser(null);
    setDashboard(null);
    setMemberStatus(null);
    setIsLoggedIn(false);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const completeWelcome = () => {
    setIsFirstTimeUser(false);
  };

  const updateUser = async (data: { full_name?: string; phone?: string }) => {
    const res = await api.put<{ id: string; full_name: string; email: string; phone: string }>('/member/profile', data as Record<string, unknown>);
    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Update failed' };
    }
    if (user) {
      const updated = { ...user, full_name: res.data.full_name, phone: res.data.phone || user.phone };
      setUser(updated);
      await AsyncStorage.setItem('user_data', JSON.stringify(updated));
    }
    return { success: true };
  };

  const refreshDashboard = async () => {
    const res = await api.get<DashboardData>('/member/dashboard');
    if (res.success && res.data) {
      setDashboard(res.data);
    }
  };

  const refreshMemberStatus = async () => {
    const res = await api.get<MemberStatus>('/member/status');
    if (res.success && res.data) {
      setMemberStatus(res.data);
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email }, false);
    if (!res.success) {
      return { success: false, error: res.error?.message || 'Request failed' };
    }
    return { success: true };
  };

  const resetPassword = async (userId: string, code: string, newPassword: string, confirmPassword: string) => {
    const res = await api.post('/auth/reset-password', {
      user_id: userId,
      code,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }, false);
    if (!res.success) {
      return { success: false, error: res.error?.message || 'Reset failed' };
    }
    return { success: true };
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const res = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    if (!res.success) {
      return { success: false, error: res.error?.message || 'Password change failed' };
    }
    return { success: true };
  };

  const createMembershipOrder = async (planId: string) => {
    const res = await api.post<CreateOrderResponse>('/membership/create-order', { plan_id: planId });
    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Order creation failed' };
    }
    return { success: true, data: res.data };
  };

  const fetchPlans = async () => {
    const res = await api.get<{ plans: MembershipPlan[] }>('/membership/plans');
    if (!res.success || !res.data) {
      return { success: false, error: res.error?.message || 'Failed to load plans' };
    }
    return { success: true, plans: res.data.plans };
  };

  return (
    <AuthContext.Provider value={{
      isLoading, isLoggedIn, hasSeenOnboarding, isFirstTimeUser, user, dashboard, memberStatus,
      login, register, verifyOTP, logout, completeOnboarding, completeWelcome,
      updateUser, refreshDashboard, refreshMemberStatus,
      forgotPassword, resetPassword, changePassword,
      createMembershipOrder, fetchPlans,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
