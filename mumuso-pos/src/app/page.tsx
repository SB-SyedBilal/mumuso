'use client';

import { useState, useEffect } from 'react';
import { posAPI } from '@/services/api';
import { Store, CartItem, ValidationResult } from '@/types';
import Header from '@/components/Header';
import MemberValidation from '@/components/MemberValidation';
import CartItems from '@/components/CartItems';
import OrderSummary from '@/components/OrderSummary';
import ValidationStatus from '@/components/ValidationStatus';

export default function POSTerminal() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [memberId, setMemberId] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await posAPI.getStores();
      setStores(data.stores);
      if (data.stores.length > 0) {
        setSelectedStore(data.stores[0]);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
      alert('Failed to load stores. Please check if backend is running.');
    }
  };

  const handleValidateMember = async () => {
    if (!memberId || !selectedStore) {
      alert('Please enter member ID and select a store');
      return;
    }

    if (cartItems.length === 0) {
      alert('Please add items to cart before validating membership');
      return;
    }

    setIsValidating(true);
    try {
      const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      const result = await posAPI.validateMembership({
        member_id: memberId,
        store_id: selectedStore.store_id,
        cart_total: cartTotal,
        timestamp: new Date().toISOString(),
      });
      
      setValidationResult(result);
    } catch (error: any) {
      console.error('Validation failed:', error);
      alert(error.response?.data?.error?.message || 'Failed to validate membership');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCompletePurchase = async () => {
    if (!validationResult?.valid || !selectedStore) {
      alert('Please validate membership first');
      return;
    }

    setIsProcessing(true);
    try {
      const originalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      const discountAmount = validationResult.discount_amount;
      const afterDiscount = originalAmount - discountAmount;
      const taxAmount = afterDiscount * 0.15;
      const finalAmount = afterDiscount + taxAmount;

      await posAPI.recordTransaction({
        transaction_id: `TXN-${Date.now()}`,
        member_id: memberId,
        store_id: selectedStore.store_id,
        store_name: selectedStore.name,
        timestamp: new Date().toISOString(),
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        tax_amount: taxAmount,
        payment_method: paymentMethod,
        items: cartItems,
        cashier_id: 'DEMO-CASHIER',
        pos_terminal_id: 'POS-DEMO-001',
      });

      // Success - reset form
      alert(`Transaction completed successfully!\n\nCustomer saved Rs. ${discountAmount.toFixed(2)}`);
      setCartItems([]);
      setMemberId('');
      setValidationResult(null);
    } catch (error: any) {
      console.error('Transaction failed:', error);
      alert(error.response?.data?.error?.message || 'Failed to record transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header selectedStore={selectedStore} />
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <MemberValidation
              memberId={memberId}
              setMemberId={setMemberId}
              onValidate={handleValidateMember}
              stores={stores}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              isValidating={isValidating}
            />
            
            <CartItems
              items={cartItems}
              setItems={setCartItems}
            />
            
            {validationResult && (
              <ValidationStatus result={validationResult} />
            )}
          </div>

          {/* Right Panel - 1/3 width */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              validationResult={validationResult}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onCompletePurchase={handleCompletePurchase}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
