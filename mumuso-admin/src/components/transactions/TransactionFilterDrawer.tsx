'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Calendar } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

interface TransactionFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: TransactionFilters) => void
  stores: Array<{ id: string; name: string }>
}

export interface TransactionFilters {
  datePreset: string
  fromDate: string
  toDate: string
  storeId: string
  discountType: string
  minAmount: number
  maxAmount: number
}

const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
]

export function TransactionFilterDrawer({ isOpen, onClose, onApplyFilters, stores }: TransactionFilterDrawerProps) {
  const [datePreset, setDatePreset] = useState('last_30_days')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [storeId, setStoreId] = useState('')
  const [discountType, setDiscountType] = useState('all')
  const [minAmount, setMinAmount] = useState(0)
  const [maxAmount, setMaxAmount] = useState(50000)

  useEffect(() => {
    if (datePreset !== 'custom') {
      const dates = calculateDateRange(datePreset)
      setFromDate(dates.from)
      setToDate(dates.to)
    }
  }, [datePreset])

  const calculateDateRange = (preset: string) => {
    const now = new Date()
    let from = now
    let to = now

    switch (preset) {
      case 'today':
        from = now
        to = now
        break
      case 'yesterday':
        from = subDays(now, 1)
        to = subDays(now, 1)
        break
      case 'last_7_days':
        from = subDays(now, 7)
        to = now
        break
      case 'last_30_days':
        from = subDays(now, 30)
        to = now
        break
      case 'this_month':
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case 'last_month':
        from = startOfMonth(subMonths(now, 1))
        to = endOfMonth(subMonths(now, 1))
        break
    }

    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    }
  }

  const handleApply = () => {
    onApplyFilters({
      datePreset,
      fromDate,
      toDate,
      storeId,
      discountType,
      minAmount,
      maxAmount,
    })
    onClose()
  }

  const handleClearAll = () => {
    setDatePreset('last_30_days')
    setStoreId('')
    setDiscountType('all')
    setMinAmount(0)
    setMaxAmount(50000)
  }

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
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col bg-surface shadow-xl">
                    <div className="bg-surface-dark px-6 py-4">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-semibold text-white">
                          Filters
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                          onClick={onClose}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Date Range
                        </label>
                        <select
                          value={datePreset}
                          onChange={(e) => setDatePreset(e.target.value)}
                          className="input-field"
                        >
                          {datePresets.map((preset) => (
                            <option key={preset.value} value={preset.value}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {datePreset === 'custom' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              From
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
                              To
                            </label>
                            <input
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="input-field"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Store
                        </label>
                        <select
                          value={storeId}
                          onChange={(e) => setStoreId(e.target.value)}
                          className="input-field"
                        >
                          <option value="">All Stores</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                          Discount Type
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="all"
                              checked={discountType === 'all'}
                              onChange={(e) => setDiscountType(e.target.value)}
                              className="w-4 h-4 text-accent-gold"
                            />
                            <span className="ml-2 text-sm text-text-primary">All</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="membership"
                              checked={discountType === 'membership'}
                              onChange={(e) => setDiscountType(e.target.value)}
                              className="w-4 h-4 text-accent-gold"
                            />
                            <span className="ml-2 text-sm text-text-primary">Membership (10%)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="promotional"
                              checked={discountType === 'promotional'}
                              onChange={(e) => setDiscountType(e.target.value)}
                              className="w-4 h-4 text-accent-gold"
                            />
                            <span className="ml-2 text-sm text-text-primary">Promotional</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Transaction Amount
                        </label>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-text-secondary mb-1">Min</label>
                              <input
                                type="number"
                                value={minAmount}
                                onChange={(e) => setMinAmount(Number(e.target.value))}
                                className="input-field"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-secondary mb-1">Max</label>
                              <input
                                type="number"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(Number(e.target.value))}
                                className="input-field"
                                placeholder="50,000"
                              />
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50000"
                            step="100"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
                      <button
                        onClick={handleClearAll}
                        className="flex-1 px-4 py-3 border border-gray-300 text-text-primary rounded-lg font-medium hover:bg-canvas transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-3 bg-accent-gold text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
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
