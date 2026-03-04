import { Store } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface StoreData {
  store_id: string
  store_name: string
  city: string
  transaction_count: number
  total_discount_given: number
  revenue: number
  last_transaction: string
}

interface TopStoresProps {
  stores: StoreData[]
}

export function TopStores({ stores }: TopStoresProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-text-primary mb-6">Top Performing Stores</h3>
      <div className="space-y-4">
        {stores.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No store data available</p>
        ) : (
          stores.slice(0, 5).map((store, index) => (
            <div
              key={store.store_id}
              className="flex items-center gap-4 p-4 bg-canvas rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-accent-gold/10 rounded-lg">
                <span className="font-display text-lg text-accent-gold font-semibold">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-text-secondary" />
                  <p className="font-medium text-text-primary">{store.store_name}</p>
                </div>
                <p className="text-sm text-text-secondary">{store.city}</p>
                <p className="text-xs text-text-secondary font-mono mt-1">{store.store_id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">
                  {formatCurrency(store.revenue)}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatNumber(store.transaction_count)} transactions
                </p>
                <p className="text-xs text-success">
                  {formatCurrency(store.total_discount_given)} discounts
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
