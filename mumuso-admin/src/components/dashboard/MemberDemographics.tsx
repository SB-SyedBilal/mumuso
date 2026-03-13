'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

interface MemberDemographicsProps {
  data: {
    age_groups: Array<{ range: string; count: number; percentage: number }>
    gender: Array<{ type: string; count: number; percentage: number }>
    join_source: Array<{ source: string; count: number; percentage: number }>
  }
}

export function MemberDemographics({ data }: MemberDemographicsProps) {
  const radarData = data.age_groups.map(group => ({
    age: group.range,
    value: group.count,
  }))

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-display text-text-primary mb-1">Member Demographics</h3>
        <p className="text-sm text-text-secondary">Age distribution and member insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#E5E1DB" />
            <PolarAngleAxis dataKey="age" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} />
            <Radar name="Members" dataKey="value" stroke="#C8A96E" fill="#C8A96E" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E1DB',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Gender Distribution</h4>
            <div className="space-y-2">
              {data.gender.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.type}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-canvas rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gold"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Join Source</h4>
            <div className="space-y-2">
              {data.join_source.map((item) => (
                <div key={item.source} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-canvas rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
