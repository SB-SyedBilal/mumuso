'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Calendar, FileText, TrendingUp, Users, DollarSign } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { mockAdminApi } from '@/lib/api/mockClient'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState('this_month')
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', 'month'],
    queryFn: () => adminApi.getDashboard('month'),
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions-report', fromDate, toDate],
    queryFn: () => adminApi.getTransactions({ 
      start_date: fromDate, 
      end_date: toDate,
      limit: 1000 
    }),
  })

  const { data: members } = useQuery({
    queryKey: ['members-report'],
    queryFn: () => adminApi.getMembers({ limit: 1000 }),
  })

  const handleExport = (type: string) => {
    console.log(`Exporting ${type} report...`)
    alert(`${type} report export will be downloaded. This feature uses the backend API.`)
  }

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: DollarSign },
    { value: 'members', label: 'Members Report', icon: Users },
    { value: 'transactions', label: 'Transactions Report', icon: FileText },
    { value: 'analytics', label: 'Analytics Report', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-text-primary mb-2">Reports</h1>
        <p className="text-text-secondary">Generate and export comprehensive reports</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                const now = new Date()
                if (e.target.value === 'today') {
                  setFromDate(format(now, 'yyyy-MM-dd'))
                  setToDate(format(now, 'yyyy-MM-dd'))
                } else if (e.target.value === 'this_week') {
                  setFromDate(format(subDays(now, 7), 'yyyy-MM-dd'))
                  setToDate(format(now, 'yyyy-MM-dd'))
                } else if (e.target.value === 'this_month') {
                  setFromDate(format(startOfMonth(now), 'yyyy-MM-dd'))
                  setToDate(format(endOfMonth(now), 'yyyy-MM-dd'))
                }
              }}
              className="input-field"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleExport('PDF')}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Export as Excel
          </button>
          <button
            onClick={() => handleExport('CSV')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Export as CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <div
              key={type.value}
              className={`card cursor-pointer transition-all ${
                reportType === type.value
                  ? 'ring-2 ring-accent-gold bg-accent-gold/5'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setReportType(type.value)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-accent-gold/10 rounded-lg">
                  <Icon className="text-accent-gold" size={24} />
                </div>
                <h3 className="font-semibold text-text-primary">{type.label}</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {type.value === 'sales' && 'Revenue, discounts, and sales trends'}
                {type.value === 'members' && 'Member statistics and demographics'}
                {type.value === 'transactions' && 'Detailed transaction history'}
                {type.value === 'analytics' && 'Comprehensive business insights'}
              </p>
            </div>
          )
        })}
      </div>

      {reportType === 'sales' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Sales Report Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Total Revenue</p>
              <p className="text-2xl font-display text-text-primary">
                {formatCurrency(dashboardData?.metrics.total_revenue_actual || 0)}
              </p>
            </div>
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Total Discounts</p>
              <p className="text-2xl font-display text-accent-gold">
                {formatCurrency(dashboardData?.metrics.total_discount_given || 0)}
              </p>
            </div>
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Transactions</p>
              <p className="text-2xl font-display text-text-primary">
                {formatNumber(dashboardData?.metrics.total_transactions_this_period || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {reportType === 'members' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Members Report Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Total Members</p>
              <p className="text-2xl font-display text-text-primary">
                {formatNumber(dashboardData?.metrics.total_members || 0)}
              </p>
            </div>
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Active Members</p>
              <p className="text-2xl font-display text-success">
                {formatNumber(dashboardData?.metrics.active_members || 0)}
              </p>
            </div>
            <div className="p-4 bg-canvas rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Renewal Rate</p>
              <p className="text-2xl font-display text-text-primary">
                {((dashboardData?.metrics.renewal_rate || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {reportType === 'transactions' && transactions && (
        <div className="card">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Transactions Report Preview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.data.slice(0, 10).map((txn) => (
                  <tr key={txn.transaction_id} className="hover:bg-canvas transition-colors">
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(txn.timestamp)}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{txn.member_name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{txn.store_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">{formatCurrency(txn.final_amount)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-success">{formatCurrency(txn.discount_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            Showing 10 of {transactions.total} transactions. Export to see all records.
          </p>
        </div>
      )}

      {reportType === 'analytics' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Analytics Report Preview</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-canvas rounded-lg">
                <p className="text-sm text-text-secondary mb-1">Avg Transaction Value</p>
                <p className="text-2xl font-display text-text-primary">
                  {formatCurrency(dashboardData?.metrics.average_transaction_value || 0)}
                </p>
              </div>
              <div className="p-4 bg-canvas rounded-lg">
                <p className="text-sm text-text-secondary mb-1">Avg Savings per Member</p>
                <p className="text-2xl font-display text-accent-gold">
                  {formatCurrency(dashboardData?.metrics.average_savings_per_member || 0)}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Top Performing Stores</h4>
              <div className="space-y-2">
                {dashboardData?.metrics.top_stores.slice(0, 5).map((store, index) => (
                  <div key={store.store_id} className="flex items-center justify-between p-3 bg-canvas rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-display text-accent-gold">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{store.store_name}</p>
                        <p className="text-xs text-text-secondary">{store.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{formatCurrency(store.revenue)}</p>
                      <p className="text-xs text-text-secondary">{store.transaction_count} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
