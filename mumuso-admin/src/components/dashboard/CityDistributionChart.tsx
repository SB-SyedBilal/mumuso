'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CityDistributionChartProps {
  data: Array<{
    city: string
    members: number
    transactions: number
    revenue: number
  }>
}

const COLORS = ['#C8A96E', '#4A9B7F', '#C08040', '#8B7355', '#A0826D', '#B89968', '#6B8E7F', '#9A7B5C']

export function CityDistributionChart({ data }: CityDistributionChartProps) {
  const chartData = data.map(item => ({
    city: item.city,
    revenue: Math.round(item.revenue / 1000),
  }))

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-display text-text-primary mb-1">Revenue by City</h3>
        <p className="text-sm text-text-secondary">Geographic distribution of sales</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DB" />
          <XAxis 
            dataKey="city" 
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            label={{ value: 'Revenue (PKR 1000s)', angle: -90, position: 'insideLeft', style: { fill: '#6B6B6B' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E1DB',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) => [`PKR ${value}K`, 'Revenue']}
          />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.slice(0, 4).map((city, index) => (
          <div key={city.city} className="text-center p-3 bg-canvas rounded-lg">
            <div className="text-xs text-text-secondary mb-1">{city.city}</div>
            <div className="text-lg font-display text-text-primary">
              {city.members}
            </div>
            <div className="text-xs text-text-secondary">Members</div>
          </div>
        ))}
      </div>
    </div>
  )
}
