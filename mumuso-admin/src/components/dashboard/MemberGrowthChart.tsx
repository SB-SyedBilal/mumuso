'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MemberGrowthChartProps {
  data: Array<{
    month: string
    new: number
    churned: number
    net: number
  }>
}

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-text-primary mb-6">Member Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis dataKey="month" stroke="#6B6B6B" fontSize={12} />
          <YAxis stroke="#6B6B6B" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="new" fill="#4A9B7F" name="New Members" />
          <Bar dataKey="churned" fill="#C0544A" name="Churned" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
