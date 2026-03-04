'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RevenueChartProps {
  data: Array<{
    date: string
    count: number
    revenue: number
    discount: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    'Revenue (Without Discount)': item.revenue + item.discount,
    'Actual Revenue': item.revenue,
  }))

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-text-primary mb-6">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis dataKey="date" stroke="#6B6B6B" fontSize={12} />
          <YAxis stroke="#6B6B6B" fontSize={12} tickFormatter={(value) => `Rs ${value / 1000}k`} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Revenue (Without Discount)"
            stroke="#C8A96E"
            strokeWidth={2}
            dot={{ fill: '#C8A96E', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Actual Revenue"
            stroke="#4A9B7F"
            strokeWidth={2}
            dot={{ fill: '#4A9B7F', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
