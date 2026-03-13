import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.')
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PK').format(num)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy')
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${format(new Date(start), 'dd/MM/yyyy')} - ${format(new Date(end), 'dd/MM/yyyy')}`
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

export function formatMemberID(id: string): string {
  if (id.startsWith('MUM') && id.length > 3 && !id.includes('-')) {
    return `MUM-${id.slice(3)}`
  }
  return id
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'badge-success'
    case 'expired':
    case 'suspended':
      return 'badge-error'
    case 'expiring_soon':
      return 'badge-warning'
    default:
      return 'badge'
  }
}
