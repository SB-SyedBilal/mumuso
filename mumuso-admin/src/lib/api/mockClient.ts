import { mockDataService } from '../mockData'
import type { DashboardMetrics, Member, Transaction, Store } from './admin'

const MOCK_DELAY = 300

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAdminApi = {
  getDashboard: async (period: string = 'month'): Promise<DashboardMetrics> => {
    await delay(MOCK_DELAY)
    return mockDataService.getDashboardMetrics(period) as any
  },

  getMembers: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<{ data: Member[]; total: number; page: number; limit: number }> => {
    await delay(MOCK_DELAY)
    return mockDataService.getMembers(params) as any
  },

  getMemberDetails: async (id: string): Promise<Member> => {
    await delay(MOCK_DELAY)
    const member = mockDataService.getMemberById(id)
    if (!member) {
      throw new Error('Member not found')
    }
    return member as any
  },

  updateMemberStatus: async (
    id: string,
    data: { status: string; reason?: string }
  ): Promise<void> => {
    await delay(MOCK_DELAY)
    console.log('Mock: Update member status', id, data)
  },

  getTransactions: async (params?: {
    page?: number
    limit?: number
    member_id?: string
    store_id?: string
    start_date?: string
    end_date?: string
  }): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> => {
    await delay(MOCK_DELAY)
    return mockDataService.getTransactions(params) as any
  },

  getStores: async (): Promise<Store[]> => {
    await delay(MOCK_DELAY)
    return mockDataService.getStores() as any
  },

  createStore: async (data: {
    store_id: string
    name: string
    city: string
    address: string
    phone: string
  }): Promise<Store> => {
    await delay(MOCK_DELAY)
    console.log('Mock: Create store', data)
    return {
      id: `store-${Date.now()}`,
      ...data,
      is_active: true,
      transaction_count: 0,
      total_revenue: 0,
    } as any
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
    await delay(MOCK_DELAY)
    console.log('Mock: Update store', id, data)
    const store = mockDataService.getStoreById(id)
    if (!store) {
      throw new Error('Store not found')
    }
    return { ...store, ...data } as any
  },

  getCityDistribution: async () => {
    await delay(MOCK_DELAY)
    return mockDataService.getCityDistribution()
  },

  getRevenueByCategory: async () => {
    await delay(MOCK_DELAY)
    return mockDataService.getRevenueByCategory()
  },

  getMemberDemographics: async () => {
    await delay(MOCK_DELAY)
    return mockDataService.getMemberDemographics()
  },

  getHourlyTransactionPattern: async () => {
    await delay(MOCK_DELAY)
    return mockDataService.getHourlyTransactionPattern()
  },
}

export const mockAuthApi = {
  login: async (email: string, password: string) => {
    await delay(MOCK_DELAY)
    
    if (email === 'admin@mumuso.com' && password === 'admin123') {
      return {
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        admin: {
          admin_id: 'admin-001',
          name: 'Admin User',
          email: 'admin@mumuso.com',
          role: 'super_admin',
          permissions: ['all'],
        },
      }
    }
    
    throw new Error('Invalid credentials')
  },

  logout: async (refreshToken: string) => {
    await delay(MOCK_DELAY)
    console.log('Mock: Logout', refreshToken)
  },

  refreshToken: async (refreshToken: string) => {
    await delay(MOCK_DELAY)
    return {
      access_token: 'mock-access-token-' + Date.now(),
    }
  },
}
