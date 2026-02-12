export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  city: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  user_id: string;
  status: 'active' | 'expired' | 'suspended';
  purchase_date: string;
  expiry_date: string;
  auto_renew: boolean;
  payment_method: string;
  amount_paid: number;
  total_savings: number;
  total_purchases: number;
  qr_code_data: string;
}

export interface TransactionItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  store_id: string;
  store_name: string;
  date: string;
  items: TransactionItem[];
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  tax: number;
  total: number;
  payment_method: string;
  member_id: string;
}

export interface Store {
  id: string;
  store_name: string;
  address: string;
  city: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  distance?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'membership' | 'transaction' | 'promotional' | 'system';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface Referral {
  id: string;
  referred_name: string;
  date_referred: string;
  status: 'pending' | 'completed';
  reward_earned?: string;
}

export interface ReferralStats {
  referral_code: string;
  friends_referred: number;
  months_earned: number;
  pending_referrals: number;
  referrals: Referral[];
}

export type RootStackParamList = {
  Onboarding: undefined;
  AuthChoice: undefined;
  Register: undefined;
  OTPVerification: { phone_number: string; from: 'register' | 'login' };
  Login: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  MembershipPurchase: undefined;
  PaymentProcessing: { method: string; amount: number };
  MembershipSuccess: undefined;
  TransactionDetail: { transaction_id: string };
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  StoreLocator: undefined;
  HelpSupport: undefined;
  ReferralScreen: undefined;
  RenewalScreen: undefined;
  QRHelp: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  MyCard: undefined;
  History: undefined;
  Profile: undefined;
};
