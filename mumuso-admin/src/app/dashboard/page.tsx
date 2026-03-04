'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, DollarSign, Tag } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { MemberGrowthChart } from '@/components/dashboard/MemberGrowthChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TopStores } from '@/components/dashboard/TopStores'

const periods = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState('month')

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => adminApi.getDashboard(period),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-accent-gold">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-error/10 border border-error">
        <p className="text-error">Failed to load dashboard data. Please try again.</p>
      </div>
    )
  }

  const metrics = data?.metrics

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">Dashboard</h1>
          <p className="text-text-secondary">
            Overview of your loyalty program performance
          </p>
        </div>

        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-accent-gold text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-dark hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Members"
          value={metrics?.total_members || 0}
          icon={Users}
          subtitle={`+${metrics?.new_members_this_period || 0} this period`}
        />
        <MetricCard
          title="Active Members"
          value={metrics?.active_members || 0}
          icon={TrendingUp}
          subtitle={`${((metrics?.active_members || 0) / (metrics?.total_members || 1) * 100).toFixed(1)}% active rate`}
          badge={
            metrics?.expiring_in_30_days
              ? {
                  text: `${metrics.expiring_in_30_days} expiring soon`,
                  variant: 'warning',
                }
              : undefined
          }
        />
        <MetricCard
          title="Total Revenue"
          value={metrics?.total_revenue_actual || 0}
          icon={DollarSign}
          subtitle="This period"
          isCurrency
        />
        <MetricCard
          title="Member Savings"
          value={metrics?.total_discount_given || 0}
          icon={Tag}
          subtitle="Total discounts given"
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.charts.daily_transactions || []} />
        <MemberGrowthChart data={data?.charts.member_growth || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={data?.recent_transactions || []} />
        <TopStores stores={data?.metrics.top_stores || []} />
      </div>
    </div>
  )
}
