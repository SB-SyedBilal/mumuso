'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { X, Mail, Phone, MapPin, Calendar, CreditCard, TrendingUp, Store, Smartphone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { formatCurrency, formatDate, formatDateRange, formatDateTime, formatMemberID, getStatusColor } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

interface MemberDetailDrawerProps {
  isOpen: boolean
  memberId: string | null
  onClose: () => void
}

export function MemberDetailDrawer({ isOpen, memberId, onClose }: MemberDetailDrawerProps) {
  const { data: member, isLoading } = useQuery({
    queryKey: ['member-detail', memberId],
    queryFn: () => adminApi.getMemberDetails(memberId!),
    enabled: !!memberId,
  })

  const { data: transactions } = useQuery({
    queryKey: ['member-transactions', memberId],
    queryFn: () => adminApi.getTransactions({ member_id: memberId!, limit: 50 }),
    enabled: !!memberId,
  })

  const daysRemaining = member ? differenceInDays(new Date(member.membership_end), new Date()) : 0
  const totalDays = member ? differenceInDays(new Date(member.membership_end), new Date(member.membership_start)) : 365
  const progressPercentage = member ? Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100)) : 0

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-3xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-surface shadow-xl">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-accent-gold">Loading member details...</div>
                      </div>
                    ) : member ? (
                      <>
                        <div className="bg-surface-dark px-6 py-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <Dialog.Title className="text-2xl font-display text-white">
                                {member.name}
                              </Dialog.Title>
                              <p className="mt-1 text-sm text-white/60 font-mono">{formatMemberID(member.member_id)}</p>
                              <div className="mt-2">
                                <span className={getStatusColor(member.status)}>
                                  {member.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                              onClick={onClose}
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                        </div>

                        <Tab.Group>
                          <Tab.List className="flex border-b border-gray-200 bg-canvas px-6">
                            {['Overview', 'Transactions', 'Payments', 'Devices'].map((tab) => (
                              <Tab key={tab} as={Fragment}>
                                {({ selected }) => (
                                  <button
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                      selected
                                        ? 'border-accent-gold text-accent-gold'
                                        : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                                  >
                                    {tab}
                                  </button>
                                )}
                              </Tab>
                            ))}
                          </Tab.List>

                          <Tab.Panels className="flex-1 p-6">
                            <Tab.Panel className="space-y-6">
                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-start gap-3">
                                    <Mail className="text-accent-gold mt-1" size={18} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Email</p>
                                      <p className="text-sm text-text-primary">{member.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <Phone className="text-accent-gold mt-1" size={18} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Phone</p>
                                      <p className="text-sm text-text-primary">{member.phone}</p>
                                    </div>
                                  </div>
                                  {(member as any).city && (
                                    <div className="flex items-start gap-3">
                                      <MapPin className="text-accent-gold mt-1" size={18} />
                                      <div>
                                        <p className="text-xs text-text-secondary">City</p>
                                        <p className="text-sm text-text-primary">{(member as any).city}</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-3">
                                    <Calendar className="text-accent-gold mt-1" size={18} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Joined</p>
                                      <p className="text-sm text-text-primary">{formatDate(member.membership_start)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Membership Timeline</h3>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between text-sm">
                                    <div>
                                      <p className="text-text-secondary">Activated</p>
                                      <p className="font-medium text-text-primary">{formatDate(member.membership_start)}</p>
                                    </div>
                                    <div className="flex-1 mx-4">
                                      <div className="h-2 bg-canvas rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-accent-gold transition-all"
                                          style={{ width: `${100 - progressPercentage}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-text-secondary">Expires</p>
                                      <p className="font-medium text-text-primary">{formatDate(member.membership_end)}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                      <p className="text-2xl font-display text-text-primary">{daysRemaining}</p>
                                      <p className="text-xs text-text-secondary">Days Remaining</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-2xl font-display text-text-primary">Rs. 2,000</p>
                                      <p className="text-xs text-text-secondary">Annual Plan</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-2xl font-display text-success">{member.auto_renew ? '✓' : '✗'}</p>
                                      <p className="text-xs text-text-secondary">Auto-Renew</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                                    <CreditCard className="text-accent-gold" size={24} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Total Saved</p>
                                      <p className="text-lg font-semibold text-text-primary">{formatCurrency(member.total_savings)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                                    <TrendingUp className="text-accent-gold" size={24} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Transactions</p>
                                      <p className="text-lg font-semibold text-text-primary">{member.transaction_count}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                                    <CreditCard className="text-accent-gold" size={24} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Avg Purchase</p>
                                      <p className="text-lg font-semibold text-text-primary">
                                        {formatCurrency(member.total_savings * 10 / member.transaction_count)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-canvas rounded-lg">
                                    <Store className="text-accent-gold" size={24} />
                                    <div>
                                      <p className="text-xs text-text-secondary">Favorite Store</p>
                                      <p className="text-sm font-medium text-text-primary">Dolmen Mall</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button className="flex-1 px-6 py-3 border-2 border-error text-error rounded-lg font-medium hover:bg-error hover:text-white transition-colors">
                                  Suspend Member
                                </button>
                                <button className="flex-1 px-6 py-3 bg-accent-gold text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                                  Extend Membership
                                </button>
                              </div>
                            </Tab.Panel>

                            <Tab.Panel>
                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Transaction History</h3>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-canvas">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Store</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary">Discount</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {transactions?.data.slice(0, 20).map((txn) => (
                                        <tr key={txn.transaction_id} className="hover:bg-canvas transition-colors">
                                          <td className="px-4 py-3 text-sm text-text-secondary">{formatDateTime(txn.timestamp)}</td>
                                          <td className="px-4 py-3 text-sm text-text-primary">{txn.store_name}</td>
                                          <td className="px-4 py-3 text-sm font-semibold text-text-primary">{formatCurrency(txn.final_amount)}</td>
                                          <td className="px-4 py-3 text-sm font-semibold text-success">{formatCurrency(txn.discount_amount)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </Tab.Panel>

                            <Tab.Panel>
                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Records</h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-4 bg-canvas rounded-lg">
                                    <div>
                                      <p className="text-sm font-medium text-text-primary">{formatDate(member.membership_start)}</p>
                                      <p className="text-xs text-text-secondary">Annual Membership</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-text-primary">Rs. 2,000</p>
                                      <span className="badge-success text-xs">Completed</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Tab.Panel>

                            <Tab.Panel>
                              <div className="card">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Registered Devices</h3>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-4 bg-canvas rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Smartphone className="text-accent-gold" size={24} />
                                      <div>
                                        <p className="text-sm font-medium text-text-primary">iPhone 14 Pro</p>
                                        <p className="text-xs text-text-secondary">Last active: {formatDateTime(new Date())}</p>
                                      </div>
                                    </div>
                                    <button
                                      className="px-4 py-2 text-sm text-text-secondary border border-gray-300 rounded-lg cursor-not-allowed opacity-50"
                                      disabled
                                      title="Coming soon"
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-text-secondary">Member not found</p>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
