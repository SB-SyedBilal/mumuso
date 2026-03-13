export interface Store {
  store_id: string;
  name: string;
  city: string;
  address: string;
}

export interface CartItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ValidationResult {
  valid: boolean;
  member_id?: string;
  member_name?: string;
  member_status: string;
  discount_percentage: number;
  discount_amount: number;
  expiry_date?: string;
  message: string;
  expired_on?: string;
  renewal_prompt?: boolean;
}

export interface Transaction {
  transaction_id: string;
  member_id: string;
  store_id: string;
  store_name: string;
  timestamp: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  tax_amount: number;
  payment_method: 'cash' | 'card' | 'mobile';
  items: CartItem[];
  cashier_id: string;
  pos_terminal_id: string;
}
