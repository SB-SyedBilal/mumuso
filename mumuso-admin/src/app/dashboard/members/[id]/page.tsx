'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

export default function MemberDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', params.id],
    queryFn: () => adminApi.getMemberDetails(params.id),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) =>
      adminApi.updateMemberStatus(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', params.id] })
      toast.success('Member status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update member status')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-accent-gold">Loading member details...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="card bg-error/10 border border-error">
        <p className="text-error">Member not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Members
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">{member.name}</h1>
          <p className="text-text-secondary font-mono">{member.member_id}</p>
        </div>
        <span className={getStatusColor(member.status)}>
          {member.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="text-accent-gold" size={20} />
            <p className="text-sm text-text-secondary">Email</p>
          </div>
          <p className="text-text-primary font-medium">{member.email}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="text-accent-gold" size={20} />
            <p className="text-sm text-text-secondary">Phone</p>
          </div>
          <p className="text-text-primary font-medium">{member.phone}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="text-accent-gold" size={20} />
            <p className="text-sm text-text-secondary">Total Savings</p>
          </div>
          <p className="text-text-primary font-display text-2xl">{formatCurrency(member.total_savings)}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-accent-gold" size={20} />
            <p className="text-sm text-text-secondary">Transactions</p>
          </div>
          <p className="text-text-primary font-display text-2xl">{member.transaction_count}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Membership Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Membership Period</p>
            <p className="text-text-primary font-medium">
              {formatDate(member.membership_start)} - {formatDate(member.membership_end)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Auto-Renewal</p>
            <p className="text-text-primary font-medium">
              {member.auto_renew ? (
                <span className="text-success">Enabled</span>
              ) : (
                <span className="text-error">Disabled</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Actions</h3>
        <div className="flex gap-4">
          {member.status === 'active' && (
            <button
              onClick={() =>
                updateStatusMutation.mutate({ status: 'suspended', reason: 'Manual suspension' })
              }
              className="px-6 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
              disabled={updateStatusMutation.isPending}
            >
              Suspend Member
            </button>
          )}
          {member.status === 'suspended' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'active' })}
              className="px-6 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
              disabled={updateStatusMutation.isPending}
            >
              Activate Member
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
