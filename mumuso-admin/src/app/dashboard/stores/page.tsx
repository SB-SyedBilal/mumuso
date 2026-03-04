'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Store, Plus, Edit, MapPin, Phone } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { toast } from 'sonner'

export default function StoresPage() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => adminApi.getStores(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-text-primary mb-2">Stores</h1>
          <p className="text-text-secondary">Manage Mumuso store locations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Store
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-accent-gold">Loading stores...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => (
            <div key={store.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent-gold/10 rounded-lg">
                    <Store className="text-accent-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{store.name}</h3>
                    <p className="text-xs text-text-secondary font-mono">{store.store_id}</p>
                  </div>
                </div>
                {store.is_active ? (
                  <span className="badge-success">Active</span>
                ) : (
                  <span className="badge-error">Inactive</span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-text-secondary mt-1" />
                  <div>
                    <p className="text-sm text-text-primary">{store.address}</p>
                    <p className="text-sm text-text-secondary">{store.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-text-secondary" />
                  <p className="text-sm text-text-secondary">{store.phone}</p>
                </div>
              </div>

              {store.transaction_count !== undefined && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Transactions</span>
                    <span className="font-semibold text-text-primary">{store.transaction_count}</span>
                  </div>
                </div>
              )}

              <button className="mt-4 w-full btn-secondary flex items-center justify-center gap-2">
                <Edit size={18} />
                Edit Store
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
