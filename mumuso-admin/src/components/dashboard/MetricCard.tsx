import { LucideIcon } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number
  icon: LucideIcon
  subtitle?: string
  badge?: {
    text: string
    variant: 'success' | 'error' | 'warning'
  }
  isCurrency?: boolean
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
  isCurrency = false,
}: MetricCardProps) {
  const badgeClasses = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-accent-gold/10 rounded-lg">
          <Icon className="text-accent-gold" size={24} />
        </div>
        {badge && (
          <span className={badgeClasses[badge.variant]}>{badge.text}</span>
        )}
      </div>
      <h3 className="text-text-secondary text-sm font-medium mb-2">{title}</h3>
      <p className="font-display text-4xl text-text-primary mb-2">
        {isCurrency ? formatCurrency(value) : formatNumber(value)}
      </p>
      {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
    </div>
  )
}
