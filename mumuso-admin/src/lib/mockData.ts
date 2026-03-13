import { format, subDays, subMonths, addDays } from 'date-fns'

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']
const storeNames = ['Mall of Lahore', 'Dolmen City', 'Centaurus', 'Packages Mall', 'Emporium Mall', 'Fortress Square', 'Bahria Town', 'DHA Phase 5']

const firstNames = ['Ahmed', 'Fatima', 'Ali', 'Ayesha', 'Hassan', 'Zainab', 'Usman', 'Maryam', 'Bilal', 'Sana', 'Imran', 'Hira', 'Kamran', 'Nida', 'Faisal', 'Rabia', 'Asad', 'Mahnoor', 'Hamza', 'Amna']
const lastNames = ['Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Malik', 'Sheikh', 'Raza', 'Iqbal', 'Butt', 'Chaudhry', 'Siddiqui', 'Mirza', 'Qureshi', 'Shah']

function generateMemberId(index: number): string {
  return `MUM${String(index).padStart(6, '0')}`
}

function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
}

function generateStoreId(index: number): string {
  return `STR${String(index).padStart(3, '0')}`
}

export interface MockMember {
  id: string
  member_id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'expired' | 'suspended'
  membership_start: string
  membership_end: string
  auto_renew: boolean
  total_savings: number
  transaction_count: number
  last_transaction?: string
  city?: string
  joined_via?: string
}

export interface MockTransaction {
  transaction_id: string
  member_id: string
  member_name: string
  store_name: string
  store_id: string
  city: string
  original_amount: number
  discount_amount: number
  final_amount: number
  timestamp: string
  items_count: number
  payment_method: string
}

export interface MockStore {
  id: string
  store_id: string
  name: string
  city: string
  address: string
  phone: string
  is_active: boolean
  transaction_count: number
  total_revenue: number
  total_discount_given: number
  member_count: number
  avg_transaction_value: number
  last_transaction: string
  manager_name: string
  opening_date: string
}

class MockDataService {
  private members: MockMember[] = []
  private transactions: MockTransaction[] = []
  private stores: MockStore[] = []

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    this.generateStores()
    this.generateMembers()
    this.generateTransactions()
  }

  private generateStores() {
    this.stores = storeNames.map((name, index) => {
      const city = cities[index % cities.length]
      const transactionCount = Math.floor(Math.random() * 5000) + 1000
      const avgTransaction = Math.floor(Math.random() * 3000) + 1500
      const totalRevenue = transactionCount * avgTransaction
      const totalDiscount = totalRevenue * 0.1

      return {
        id: `store-${index + 1}`,
        store_id: generateStoreId(index + 1),
        name,
        city,
        address: `${Math.floor(Math.random() * 500) + 1} Main Boulevard, ${city}`,
        phone: `+92-${300 + index}-${Math.floor(Math.random() * 9000000) + 1000000}`,
        is_active: Math.random() > 0.1,
        transaction_count: transactionCount,
        total_revenue: totalRevenue,
        total_discount_given: totalDiscount,
        member_count: Math.floor(Math.random() * 800) + 200,
        avg_transaction_value: avgTransaction,
        last_transaction: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString(),
        manager_name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
        opening_date: subMonths(new Date(), Math.floor(Math.random() * 24) + 6).toISOString(),
      }
    })
  }

  private generateMembers() {
    const statuses: ('active' | 'expired' | 'suspended')[] = ['active', 'active', 'active', 'active', 'active', 'expired', 'suspended']
    
    for (let i = 1; i <= 2500; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const membershipStart = subDays(new Date(), Math.floor(Math.random() * 365))
      const membershipEnd = addDays(membershipStart, 365)
      const daysUntilExpiry = Math.floor((membershipEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      let actualStatus = status
      if (daysUntilExpiry < 0 && status === 'active') {
        actualStatus = 'expired'
      }

      this.members.push({
        id: `member-${i}`,
        member_id: generateMemberId(i),
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+92-3${Math.floor(Math.random() * 100000000) + 100000000}`,
        status: actualStatus,
        membership_start: membershipStart.toISOString(),
        membership_end: membershipEnd.toISOString(),
        auto_renew: Math.random() > 0.4,
        total_savings: Math.floor(Math.random() * 50000) + 5000,
        transaction_count: Math.floor(Math.random() * 150) + 10,
        last_transaction: actualStatus === 'active' ? subDays(new Date(), Math.floor(Math.random() * 30)).toISOString() : undefined,
        city: cities[Math.floor(Math.random() * cities.length)],
        joined_via: Math.random() > 0.5 ? 'mobile_app' : 'in_store',
      })
    }
  }

  private generateTransactions() {
    const paymentMethods = ['cash', 'card', 'mobile_wallet']
    
    for (let i = 0; i < 15000; i++) {
      const member = this.members[Math.floor(Math.random() * this.members.length)]
      const store = this.stores[Math.floor(Math.random() * this.stores.length)]
      const originalAmount = Math.floor(Math.random() * 8000) + 500
      const discountAmount = member.status === 'active' ? Math.floor(originalAmount * 0.1) : 0
      const finalAmount = originalAmount - discountAmount

      this.transactions.push({
        transaction_id: generateTransactionId(),
        member_id: member.member_id,
        member_name: member.name,
        store_name: store.name,
        store_id: store.store_id,
        city: store.city,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        timestamp: subDays(new Date(), Math.floor(Math.random() * 90)).toISOString(),
        items_count: Math.floor(Math.random() * 15) + 1,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      })
    }

    this.transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getMembers(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) {
    let filtered = [...this.members]

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(m => m.status === params.status)
    }

    if (params?.search) {
      const search = params.search.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.member_id.toLowerCase().includes(search) ||
        m.phone.includes(search)
      )
    }

    const page = params?.page || 1
    const limit = params?.limit || 20
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
    }
  }

  getMemberById(id: string) {
    return this.members.find(m => m.id === id || m.member_id === id)
  }

  getTransactions(params?: {
    page?: number
    limit?: number
    member_id?: string
    store_id?: string
    start_date?: string
    end_date?: string
  }) {
    let filtered = [...this.transactions]

    if (params?.member_id) {
      filtered = filtered.filter(t => t.member_id === params.member_id)
    }

    if (params?.store_id) {
      filtered = filtered.filter(t => t.store_id === params.store_id)
    }

    if (params?.start_date) {
      filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(params.start_date!))
    }

    if (params?.end_date) {
      filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(params.end_date!))
    }

    const page = params?.page || 1
    const limit = params?.limit || 50
    const start = (page - 1) * limit
    const end = start + limit

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
    }
  }

  getStores() {
    return this.stores
  }

  getStoreById(id: string) {
    return this.stores.find(s => s.id === id || s.store_id === id)
  }

  getDashboardMetrics(period: string = 'month') {
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = subDays(now, 7)
        break
      case 'month':
        startDate = subMonths(now, 1)
        break
      case 'year':
        startDate = subMonths(now, 12)
        break
      default:
        startDate = new Date(2020, 0, 1)
    }

    const periodTransactions = this.transactions.filter(t => {
      const date = new Date(t.timestamp)
      return date >= startDate && date <= endDate
    })

    const activeMembers = this.members.filter(m => m.status === 'active')
    const expiredMembers = this.members.filter(m => m.status === 'expired')
    const suspendedMembers = this.members.filter(m => m.status === 'suspended')

    const expiringIn30Days = activeMembers.filter(m => {
      const daysUntilExpiry = Math.floor((new Date(m.membership_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30
    }).length

    const expiringIn7Days = activeMembers.filter(m => {
      const daysUntilExpiry = Math.floor((new Date(m.membership_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7
    }).length

    const newMembersThisPeriod = this.members.filter(m => {
      const joinDate = new Date(m.membership_start)
      return joinDate >= startDate && joinDate <= endDate
    }).length

    const totalRevenue = periodTransactions.reduce((sum, t) => sum + t.original_amount, 0)
    const totalDiscount = periodTransactions.reduce((sum, t) => sum + t.discount_amount, 0)
    const totalRevenueActual = periodTransactions.reduce((sum, t) => sum + t.final_amount, 0)

    const storePerformance = this.stores.map(store => {
      const storeTransactions = periodTransactions.filter(t => t.store_id === store.store_id)
      return {
        store_id: store.store_id,
        store_name: store.name,
        city: store.city,
        transaction_count: storeTransactions.length,
        total_discount_given: storeTransactions.reduce((sum, t) => sum + t.discount_amount, 0),
        revenue: storeTransactions.reduce((sum, t) => sum + t.final_amount, 0),
        last_transaction: storeTransactions[0]?.timestamp || store.last_transaction,
      }
    }).sort((a, b) => b.revenue - a.revenue)

    const dailyTransactions = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayTransactions = this.transactions.filter(t => {
        const tDate = new Date(t.timestamp)
        return tDate >= dayStart && tDate < dayEnd
      })

      dailyTransactions.push({
        date: format(date, 'MMM dd'),
        count: dayTransactions.length,
        revenue: dayTransactions.reduce((sum, t) => sum + t.final_amount, 0),
        discount: dayTransactions.reduce((sum, t) => sum + t.discount_amount, 0),
      })
    }

    const memberGrowth = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const newMembers = this.members.filter(m => {
        const joinDate = new Date(m.membership_start)
        return joinDate >= monthStart && joinDate <= monthEnd
      }).length

      const churned = this.members.filter(m => {
        const endDate = new Date(m.membership_end)
        return endDate >= monthStart && endDate <= monthEnd && m.status === 'expired'
      }).length

      memberGrowth.push({
        month: format(monthDate, 'MMM yyyy'),
        new: newMembers,
        churned,
        net: newMembers - churned,
      })
    }

    return {
      period,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      metrics: {
        total_members: this.members.length,
        active_members: activeMembers.length,
        expired_members: expiredMembers.length,
        suspended_members: suspendedMembers.length,
        expiring_in_30_days: expiringIn30Days,
        expiring_in_7_days: expiringIn7Days,
        new_members_this_period: newMembersThisPeriod,
        renewal_rate: 0.78,
        auto_renew_enabled: activeMembers.filter(m => m.auto_renew).length,
        total_transactions: this.transactions.length,
        total_transactions_this_period: periodTransactions.length,
        total_revenue_without_discount: totalRevenue,
        total_discount_given: totalDiscount,
        total_revenue_actual: totalRevenueActual,
        average_transaction_value: periodTransactions.length > 0 ? totalRevenueActual / periodTransactions.length : 0,
        average_savings_per_member: activeMembers.length > 0 ? totalDiscount / activeMembers.length : 0,
        total_stores: this.stores.length,
        active_stores: this.stores.filter(s => s.is_active).length,
        stores_with_recent_activity: this.stores.filter(s => {
          const lastTxn = new Date(s.last_transaction)
          return (now.getTime() - lastTxn.getTime()) / (1000 * 60 * 60 * 24) <= 7
        }).length,
        top_stores: storePerformance.slice(0, 5),
      },
      charts: {
        daily_transactions: dailyTransactions,
        member_growth: memberGrowth,
      },
      recent_transactions: this.transactions.slice(0, 10),
      system_health: {
        pos_integration: 'operational',
        payment_gateway: 'operational',
        database: 'operational',
        last_transaction: this.transactions[0]?.timestamp || now.toISOString(),
      },
    }
  }

  getCityDistribution() {
    const distribution = cities.map(city => {
      const cityMembers = this.members.filter(m => m.city === city && m.status === 'active')
      const cityTransactions = this.transactions.filter(t => t.city === city)
      const revenue = cityTransactions.reduce((sum, t) => sum + t.final_amount, 0)

      return {
        city,
        members: cityMembers.length,
        transactions: cityTransactions.length,
        revenue,
        avg_transaction: cityTransactions.length > 0 ? revenue / cityTransactions.length : 0,
      }
    }).sort((a, b) => b.revenue - a.revenue)

    return distribution
  }

  getRevenueByCategory() {
    return [
      { category: 'Beauty & Cosmetics', revenue: 4250000, percentage: 28, growth: 12 },
      { category: 'Home Decor', revenue: 3800000, percentage: 25, growth: 8 },
      { category: 'Stationery', revenue: 2850000, percentage: 19, growth: 15 },
      { category: 'Accessories', revenue: 2280000, percentage: 15, growth: 5 },
      { category: 'Toys & Games', revenue: 1520000, percentage: 10, growth: 22 },
      { category: 'Others', revenue: 456000, percentage: 3, growth: -2 },
    ]
  }

  getMemberDemographics() {
    return {
      age_groups: [
        { range: '18-24', count: 450, percentage: 18 },
        { range: '25-34', count: 875, percentage: 35 },
        { range: '35-44', count: 625, percentage: 25 },
        { range: '45-54', count: 375, percentage: 15 },
        { range: '55+', count: 175, percentage: 7 },
      ],
      gender: [
        { type: 'Female', count: 1625, percentage: 65 },
        { type: 'Male', count: 750, percentage: 30 },
        { type: 'Other', count: 125, percentage: 5 },
      ],
      join_source: [
        { source: 'Mobile App', count: 1375, percentage: 55 },
        { source: 'In-Store', count: 875, percentage: 35 },
        { source: 'Website', count: 250, percentage: 10 },
      ],
    }
  }

  getHourlyTransactionPattern() {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map(hour => {
      let count = 0
      if (hour >= 10 && hour <= 22) {
        count = Math.floor(Math.random() * 300) + 100
        if (hour >= 17 && hour <= 21) {
          count = Math.floor(Math.random() * 500) + 300
        }
      }
      return {
        hour: `${hour}:00`,
        transactions: count,
        revenue: count * (Math.floor(Math.random() * 2000) + 1500),
      }
    })
  }
}

export const mockDataService = new MockDataService()
