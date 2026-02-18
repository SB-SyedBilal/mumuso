// Shared TypeScript interfaces — Mumuso Backend
// Ref: Primary Spec Section 5, types/index.ts

export interface StandardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: StandardError;
}

export interface StandardError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export type UserRole = 'customer' | 'cashier' | 'super_admin';

export type MembershipStatus = 'active' | 'expired' | 'suspended';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type DiscountType = 'full' | 'partial';

export type OTPType = 'registration' | 'password_reset';

export type DevicePlatform = 'ios' | 'android';

export type PartialDiscountReason =
  | 'manager_approval'
  | 'promo_exclusion'
  | 'bulk_item_limit'
  | 'other';

export type NotificationType =
  | 'membership_activated'
  | 'transaction_confirmed'
  | 'expiry_30_days'
  | 'expiry_7_days'
  | 'expiry_today'
  | 'membership_renewed';

export type AuditAction =
  | 'MEMBERSHIP_ACTIVATED'
  | 'MEMBERSHIP_RENEWED'
  | 'MEMBERSHIP_SUSPENDED'
  | 'TRANSACTION_RECORDED'
  | 'TRANSACTION_OFFLINE_SYNCED'
  | 'STORE_DISCOUNT_UPDATED'
  | 'CASHIER_ACCOUNT_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface QRTokenPayload {
  memberId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface QRTokenFull extends QRTokenPayload {
  signature: string;
}

export interface QRVerificationResult {
  valid: boolean;
  memberId?: string;
  reason?: string;
}

// Safepay webhook payload — Ref: Supplement Section 2.2
export interface SafepayWebhookPayload {
  order_id: string;
  safepay_order_id: string;
  status: 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: 'PKR';
  payment_method: 'jazzcash' | 'easypaisa' | 'hbl_pay' | 'visa' | 'mastercard';
  transaction_id: string;
  timestamp: string;
  signature: string;
}

// Offline sync transaction — Ref: Supplement Section 4.1
export interface OfflineSyncTransaction {
  local_id: string;
  member_id: string;
  store_id: string;
  original_amount: number;
  final_amount: number;
  discount_type: DiscountType;
  discount_amount?: number;
  discount_pct_snapshot: number;
  recorded_at: string;
  partial_discount_reason?: PartialDiscountReason;
}

export interface SyncResult {
  local_id: string;
  status: 'synced' | 'skipped' | 'failed';
  transaction_id?: string;
  server_timestamp?: string;
  error?: string;
}

export interface SyncActionRequired {
  local_id: string;
  action: string;
  message: string;
  remove_from_queue: boolean;
}

// Operating hours JSONB shape — Ref: Primary Spec Section 6, stores table
export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}
