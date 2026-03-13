'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Download, Eye, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDateRange, formatMemberID, getStatusColor } from '@/lib/utils'
import { MemberDetailDrawer } from '@/components/members/MemberDetailDrawer'

export default function MembersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      adminApi.getMembers({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  })

  const handleClearFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
    setPage(1)
  }

  const handleOpenMemberDetail = (memberId: string) => {
    setSelectedMemberId(memberId)
    setIsDrawerOpen(true)
  }

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
        <div className="space-y-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or member ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-40"
              >
                <option value="created_at">Join Date</option>
                <option value="name">Name</option>
                <option value="expiry_date">Expiry Date</option>
                <option value="total_saved">Total Saved</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field w-32"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {(searchInput || statusFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-gray-300 rounded-lg transition-colors"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
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
                    <tr 
                      key={member.id} 
                      className="hover:bg-canvas transition-colors cursor-pointer"
                      onClick={() => handleOpenMemberDetail(member.id)}
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-text-primary">{formatMemberID(member.member_id)}</span>
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
                          {formatDateRange(member.membership_start, member.membership_end)}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenMemberDetail(member.id)
                          }}
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

      <MemberDetailDrawer
        isOpen={isDrawerOpen}
        memberId={selectedMemberId}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedMemberId(null)
        }}
      />
    </div>
  )
}
