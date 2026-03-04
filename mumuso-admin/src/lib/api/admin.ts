import { apiClient } from './client'

export interface DashboardMetrics {
  period: string
  start_date: string
  end_date: string
  metrics: {
    total_members: number
    active_members: number
    expired_members: number
    suspended_members: number
    expiring_in_30_days: number
    expiring_in_7_days: number
    new_members_this_period: number
    renewal_rate: number
    auto_renew_enabled: number
    total_transactions: number
    total_transactions_this_period: number
    total_revenue_without_discount: number
    total_discount_given: number
    total_revenue_actual: number
    average_transaction_value: number
    average_savings_per_member: number
    total_stores: number
    active_stores: number
    stores_with_recent_activity: number
    top_stores: Array<{
      store_id: string
      store_name: string
      city: string
      transaction_count: number
      total_discount_given: number
      revenue: number
      last_transaction: string
    }>
  }
  charts: {
    daily_transactions: Array<{
      date: string
      count: number
      revenue: number
      discount: number
    }>
    member_growth: Array<{
      month: string
      new: number
      churned: number
      net: number
    }>
  }
  recent_transactions: Array<{
    transaction_id: string
    member_id: string
    member_name: string
    store_name: string
    store_id: string
    discount_amount: number
    final_amount: number
    timestamp: string
  }>
  system_health: {
    pos_integration: string
    payment_gateway: string
    database: string
    last_transaction: string
  }
}

export interface Member {
  id: string
  member_id: string
  name: string
  email: string
  phone: string
  status: string
  membership_start: string
  membership_end: string
  auto_renew: boolean
  total_savings: number
  transaction_count: number
}

export interface Transaction {
  transaction_id: string
  member_id: string
  member_name: string
  store_name: string
  store_id: string
  discount_amount: number
  final_amount: number
  timestamp: string
}

export interface Store {
  id: string
  store_id: string
  name: string
  city: string
  address: string
  phone: string
  is_active: boolean
  transaction_count?: number
  total_revenue?: number
}

export const adminApi = {
  getDashboard: async (period: string = 'month'): Promise<DashboardMetrics> => {
    const response = await apiClient.get(`/admin/dashboard?period=${period}`)
    return response.data
  },

  getMembers: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<{ data: Member[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get('/admin/members', { params })
    return response.data
  },

  getMemberDetails: async (id: string): Promise<Member> => {
    const response = await apiClient.get(`/admin/members/${id}`)
    return response.data
  },

  updateMemberStatus: async (
    id: string,
    data: { status: string; reason?: string }
  ): Promise<void> => {
    await apiClient.put(`/admin/members/${id}/status`, data)
  },

  getTransactions: async (params?: {
    page?: number
    limit?: number
    member_id?: string
    store_id?: string
    start_date?: string
    end_date?: string
  }): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get('/admin/transactions', { params })
    return response.data
  },

  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get('/admin/stores')
    return response.data
  },

  createStore: async (data: {
    store_id: string
    name: string
    city: string
    address: string
    phone: string
  }): Promise<Store> => {
    const response = await apiClient.post('/admin/stores', data)
    return response.data
  },

  updateStore: async (
    id: string,
    data: {
      name?: string
      city?: string
      address?: string
      phone?: string
      is_active?: boolean
    }
  ): Promise<Store> => {
    const response = await apiClient.put(`/admin/stores/${id}`, data)
    return response.data
  },
}
