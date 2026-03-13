'use client'

import { useQuery } from '@tanstack/react-query'
import { mockAdminApi } from '@/lib/api/mockClient'
import { CityDistributionChart } from '@/components/dashboard/CityDistributionChart'
import { CategoryRevenueChart } from '@/components/dashboard/CategoryRevenueChart'
import { HourlyPatternChart } from '@/components/dashboard/HourlyPatternChart'
import { MemberDemographics } from '@/components/dashboard/MemberDemographics'

export default function AnalyticsPage() {
  const { data: cityData, isLoading: cityLoading } = useQuery({
    queryKey: ['city-distribution'],
    queryFn: () => mockAdminApi.getCityDistribution(),
  })

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-revenue'],
    queryFn: () => mockAdminApi.getRevenueByCategory(),
  })

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ['hourly-pattern'],
    queryFn: () => mockAdminApi.getHourlyTransactionPattern(),
  })

  const { data: demographicsData, isLoading: demographicsLoading } = useQuery({
    queryKey: ['demographics'],
    queryFn: () => mockAdminApi.getMemberDemographics(),
  })

  if (cityLoading || categoryLoading || hourlyLoading || demographicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-accent-gold">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-text-primary mb-2">Advanced Analytics</h1>
        <p className="text-text-secondary">
          Deep insights into your loyalty program performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cityData && <CityDistributionChart data={cityData} />}
        {categoryData && <CategoryRevenueChart data={categoryData} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hourlyData && <HourlyPatternChart data={hourlyData} />}
        {demographicsData && <MemberDemographics data={demographicsData} />}
      </div>
    </div>
  )
}
