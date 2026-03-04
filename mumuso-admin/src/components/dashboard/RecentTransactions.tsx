import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Transaction {
  transaction_id: string
  member_id: string
  member_name: string
  store_name: string
  store_id: string
  discount_amount: number
  final_amount: number
  timestamp: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-text-primary mb-6">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-text-secondary text-center py-8">No recent transactions</p>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.transaction_id}
              className="flex items-center justify-between p-4 bg-canvas rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-text-primary">{transaction.member_name}</p>
                <p className="text-sm text-text-secondary">{transaction.store_name}</p>
                <p className="text-xs text-text-secondary font-mono mt-1">
                  {transaction.transaction_id}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-text-primary">
                  {formatCurrency(transaction.final_amount)}
                </p>
                <p className="text-sm text-success">
                  Saved {formatCurrency(transaction.discount_amount)}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {formatDateTime(transaction.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
