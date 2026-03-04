'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Download, Calendar } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, search],
    queryFn: () =>
      adminApi.getTransactions({
        page,
        limit: 20,
        member_id: search || undefined,
      }),
  })

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
                        <p className="text-xs text-text-secondary font-mono">{transaction.member_id}</p>
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
    </div>
  )
}
