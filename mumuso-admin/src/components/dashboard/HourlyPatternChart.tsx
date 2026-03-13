'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HourlyPatternChartProps {
  data: Array<{
    hour: string
    transactions: number
    revenue: number
  }>
}

export function HourlyPatternChart({ data }: HourlyPatternChartProps) {
  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-display text-text-primary mb-1">Hourly Transaction Pattern</h3>
        <p className="text-sm text-text-secondary">Peak shopping hours analysis</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#C8A96E" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DB" />
          <XAxis 
            dataKey="hour" 
            tick={{ fill: '#6B6B6B', fontSize: 11 }}
            interval={2}
          />
          <YAxis 
            tick={{ fill: '#6B6B6B', fontSize: 12 }}
            label={{ value: 'Transactions', angle: -90, position: 'insideLeft', style: { fill: '#6B6B6B' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E1DB',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'transactions') return [value, 'Transactions']
              return [`PKR ${(value / 1000).toFixed(1)}K`, 'Revenue']
            }}
          />
          <Area 
            type="monotone" 
            dataKey="transactions" 
            stroke="#C8A96E" 
            fillOpacity={1} 
            fill="url(#colorTransactions)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-canvas rounded-lg">
          <div className="text-xs text-text-secondary mb-1">Peak Hour</div>
          <div className="text-lg font-display text-text-primary">6-9 PM</div>
        </div>
        <div className="text-center p-3 bg-canvas rounded-lg">
          <div className="text-xs text-text-secondary mb-1">Avg/Hour</div>
          <div className="text-lg font-display text-text-primary">
            {Math.round(data.reduce((sum, d) => sum + d.transactions, 0) / data.length)}
          </div>
        </div>
        <div className="text-center p-3 bg-canvas rounded-lg">
          <div className="text-xs text-text-secondary mb-1">Total Today</div>
          <div className="text-lg font-display text-text-primary">
            {data.reduce((sum, d) => sum + d.transactions, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
