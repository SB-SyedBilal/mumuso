import { CreditCard, Banknote, Smartphone, ShoppingBag } from 'lucide-react';
import { CartItem, ValidationResult } from '@/types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  validationResult: ValidationResult | null;
  paymentMethod: 'cash' | 'card' | 'mobile';
  setPaymentMethod: (method: 'cash' | 'card' | 'mobile') => void;
  onCompletePurchase: () => void;
  isProcessing: boolean;
}

export default function OrderSummary({
  cartItems,
  validationResult,
  paymentMethod,
  setPaymentMethod,
  onCompletePurchase,
  isProcessing,
}: OrderSummaryProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = validationResult?.valid ? validationResult.discount_amount : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * 0.15; // 15% tax
  const total = afterDiscount + taxAmount;

  const canCompletePurchase = cartItems.length > 0 && validationResult?.valid;

  return (
    <div className="card sticky top-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-mumuso-gold" />
        Order Summary
      </h2>

      {/* Amounts */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
        </div>
        
        {validationResult?.valid && (
          <div className="flex justify-between text-mumuso-success">
            <span>Discount ({validationResult.discount_percentage}%):</span>
            <span className="font-semibold">-Rs. {discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-700">
          <span>Tax (15%):</span>
          <span className="font-semibold">Rs. {taxAmount.toFixed(2)}</span>
        </div>
        
        <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span className="text-mumuso-gold">Rs. {total.toFixed(2)}</span>
        </div>

        {validationResult?.valid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Customer Saves</p>
            <p className="text-2xl font-bold text-mumuso-success">
              Rs. {discountAmount.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'cash'
                ? 'border-mumuso-gold bg-mumuso-gold bg-opacity-10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setPaymentMethod('cash')}
          >
            <Banknote className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs font-medium">Cash</p>
          </button>
          
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-mumuso-gold bg-mumuso-gold bg-opacity-10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setPaymentMethod('card')}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs font-medium">Card</p>
          </button>
          
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'mobile'
                ? 'border-mumuso-gold bg-mumuso-gold bg-opacity-10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setPaymentMethod('mobile')}
          >
            <Smartphone className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs font-medium">Mobile</p>
          </button>
        </div>
      </div>

      {/* Complete Purchase Button */}
      <button
        className="btn-primary w-full text-lg py-4"
        onClick={onCompletePurchase}
        disabled={!canCompletePurchase || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Complete Purchase'}
      </button>

      {!canCompletePurchase && cartItems.length > 0 && (
        <p className="text-xs text-center text-red-600 mt-2">
          Please validate membership before completing purchase
        </p>
      )}
    </div>
  );
}
