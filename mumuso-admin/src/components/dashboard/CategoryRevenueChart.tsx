'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CategoryRevenueChartProps {
  data: Array<{
    category: string
    revenue: number
    percentage: number
    growth: number
  }>
}

const COLORS = ['#C8A96E', '#4A9B7F', '#C08040', '#8B7355', '#A0826D', '#B89968']

export function CategoryRevenueChart({ data }: CategoryRevenueChartProps) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.revenue,
    percentage: item.percentage,
  }))

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-display text-text-primary mb-1">Revenue by Category</h3>
        <p className="text-sm text-text-secondary">Product category performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E1DB',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number) => `PKR ${(value / 1000).toFixed(0)}K`}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {data.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between p-3 bg-canvas rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <div className="text-sm font-medium text-text-primary">{category.category}</div>
                  <div className="text-xs text-text-secondary">
                    PKR {(category.revenue / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                category.growth >= 0 ? 'text-success' : 'text-error'
              }`}>
                {category.growth >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{Math.abs(category.growth)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
