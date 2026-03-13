import axios from 'axios';
import { Store, ValidationResult, Transaction } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_POS_API_KEY || 'demo-pos-api-key-12345';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const posAPI = {
  // GET /api/v1/pos/stores
  getStores: async (): Promise<{ stores: Store[] }> => {
    try {
      const { data } = await api.get('/pos/stores');
      return data.data;
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      throw error;
    }
  },

  // POST /api/v1/pos/validate-membership
  validateMembership: async (payload: {
    member_id: string;
    store_id: string;
    cart_total: number;
    timestamp: string;
  }): Promise<ValidationResult> => {
    try {
      const { data } = await api.post('/pos/validate-membership', payload);
      return data.data;
    } catch (error) {
      console.error('Failed to validate membership:', error);
      throw error;
    }
  },

  // POST /api/v1/pos/record-transaction
  recordTransaction: async (payload: Transaction): Promise<{ success: boolean; transaction_id: string; message: string }> => {
    try {
      const { data } = await api.post('/pos/record-transaction', payload);
      return data.data;
    } catch (error) {
      console.error('Failed to record transaction:', error);
      throw error;
    }
  },
};
