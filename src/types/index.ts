// ─── API Response Wrapper ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: { field: string; message: string }[] };
}

// ─── Auth Types ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  has_membership: boolean;
  store_id?: string;
  store_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterResponse {
  user_id: string;
  message: string;
}

export interface VerifyOTPResponse extends AuthTokens {
  user: AuthUser;
}

// ─── User (local state, enriched from profile/dashboard) ────────────────────
export interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  has_membership: boolean;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export interface DashboardData {
  has_membership?: boolean;
  member_id: string | null;
  status: string | null;
  expiry_date: string | null;
  days_remaining: number;
  total_saved: number;
  total_transactions: number;
  recent_transactions: DashboardTransaction[];
  membership: {
    plan_name: string;
    activated_at: string | null;
    renewal_eligible: boolean;
    auto_renew: boolean;
  } | null;
  stats: {
    this_month_saved: number;
    favorite_store: string | null;
    last_transaction_date: string | null;
  } | null;
  active_campaign: null;
}

export interface DashboardTransaction {
  id: string;
  store_name: string;
  date: string;
  discount_amount: number;
  final_amount: number;
  discount_type: string;
}

// ─── Membership ─────────────────────────────────────────────────────────────
export interface MemberStatus {
  has_membership: boolean;
  status: string | null;
  expiry_date: string | null;
  member_id: string | null;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration_months: number;
  benefits: any;
}

export interface CreateOrderResponse {
  payment_id: string;
  gateway_token: string;
  amount: number;
  currency: string;
  expiry: string;
  is_renewal: boolean;
}

// ─── QR Token ───────────────────────────────────────────────────────────────
export interface QRTokenResponse {
  token: string;
  expires_at: number;
  member_id: string;
}

// ─── Transactions ───────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  store_name: string;
  date: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  discount_pct: number;
  discount_type: string;
  is_offline_sync: boolean;
}

export interface TransactionDetail {
  id: string;
  member_id: string;
  store_name: string;
  store_city: string;
  date: string;
  original_amount: number;
  discount_pct: number;
  discount_amount: number;
  final_amount: number;
  discount_type: string;
  is_offline_sync: boolean;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
  summary: { total_saved: number; total_transactions: number };
}

// ─── Stores ─────────────────────────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  discount_pct: number;
  phone: string | null;
  operating_hours: any;
  is_open_now: boolean;
}

// ─── Notifications ──────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  deep_link: string | null;
  read: boolean;
  metadata: any;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unread_count: number;
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

// ─── Referral (future feature — no backend endpoint yet) ────────────────────
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

// ─── Constants (moved from mockData) ────────────────────────────────────────
export const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Mardan', 'Abbottabad',
];

export type RootStackParamList = {
  Onboarding: undefined;
  AuthChoice: undefined;
  Register: undefined;
  OTPVerification: { phone_number: string; from: 'register' | 'login'; user_id?: string };
  Login: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  MembershipPurchase: undefined;
  PaymentProcessing: { method: string; amount: number; payment_id?: string; gateway_token?: string };
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
