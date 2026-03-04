'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Download, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

export default function MembersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter],
    queryFn: () =>
      adminApi.getMembers({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">Members</h1>
          <p className="text-text-secondary">Manage loyalty program members</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="expiring_soon">Expiring Soon</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-accent-gold">Loading members...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-canvas">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Member ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Membership</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Savings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.data.map((member) => (
                    <tr key={member.id} className="hover:bg-canvas transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-text-primary">{member.member_id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-text-primary">{member.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-text-secondary">{member.email}</p>
                        <p className="text-sm text-text-secondary">{member.phone}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={getStatusColor(member.status)}>
                          {member.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-text-secondary">
                          {formatDate(member.membership_start)} - {formatDate(member.membership_end)}
                        </p>
                        {member.auto_renew && (
                          <span className="text-xs text-success">Auto-renew enabled</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-text-primary">{formatCurrency(member.total_savings)}</p>
                        <p className="text-xs text-text-secondary">{member.transaction_count} transactions</p>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/members/${member.id}`)}
                          className="p-2 hover:bg-accent-gold/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} className="text-accent-gold" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.total > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-text-secondary">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total} members
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
