'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Download, Calendar, Filter } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDateTime, formatMemberID, formatNumber } from '@/lib/utils'
import { TransactionFilterDrawer, type TransactionFilters } from '@/components/transactions/TransactionFilterDrawer'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({
    datePreset: 'last_30_days',
    fromDate: '',
    toDate: '',
    storeId: '',
    discountType: 'all',
    minAmount: 0,
    maxAmount: 50000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, search, filters],
    queryFn: () =>
      adminApi.getTransactions({
        page,
        limit: 20,
        member_id: search || undefined,
        store_id: filters.storeId || undefined,
        start_date: filters.fromDate || undefined,
        end_date: filters.toDate || undefined,
      }),
  })

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => adminApi.getStores(),
  })

  const handleApplyFilters = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const totalTransactions = data?.total || 0
  const totalDiscount = data?.data.reduce((sum, t) => sum + t.discount_amount, 0) || 0
  const totalRevenue = data?.data.reduce((sum, t) => sum + t.final_amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">Transactions</h1>
          <p className="text-text-secondary">View all member transactions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Export Report
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search by member ID or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border border-accent-gold rounded-xl bg-white">
            <p className="text-xs font-medium text-text-secondary uppercase mb-1">Total Transactions</p>
            <p className="text-2xl font-semibold text-text-primary">{formatNumber(totalTransactions)}</p>
          </div>
          <div className="p-4 border border-accent-gold rounded-xl bg-white">
            <p className="text-xs font-medium text-text-secondary uppercase mb-1">Total Discounts</p>
            <p className="text-2xl font-semibold text-accent-gold">{formatCurrency(totalDiscount)}</p>
          </div>
          <div className="p-4 border border-accent-gold rounded-xl bg-white">
            <p className="text-xs font-medium text-text-secondary uppercase mb-1">Total Revenue</p>
            <p className="text-2xl font-semibold text-text-primary">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-accent-gold">Loading transactions...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-canvas">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Member</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Store</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.data.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-canvas transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-text-primary">{transaction.transaction_id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-text-primary">{transaction.member_name}</p>
                        <p className="text-xs text-text-secondary font-mono">{formatMemberID(transaction.member_id)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-text-primary">{transaction.store_name}</p>
                        <p className="text-xs text-text-secondary font-mono">{transaction.store_id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-primary">{formatCurrency(transaction.final_amount)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-success">{formatCurrency(transaction.discount_amount)}</p>
                        <p className="text-xs text-text-secondary">10% saved</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-text-secondary" />
                          <span className="text-sm text-text-secondary">{formatDateTime(transaction.timestamp)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.total > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-text-secondary">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= data.total}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        stores={stores?.map(s => ({ id: s.store_id, name: s.name })) || []}
      />
    </div>
  )
}
