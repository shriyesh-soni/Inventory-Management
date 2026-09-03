'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Layers, MapPin, Inbox } from 'lucide-react'
import type { CategoryBreakdown, LocationBreakdown } from '@/types/api'

export interface StockChartsProps {
  categoryData?: CategoryBreakdown[]
  locationData?: LocationBreakdown[]
  isLoading?: boolean
}

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]

const LOCATION_COLORS = [
  '#2563EB', // Blue-600
  '#059669', // Emerald-600
  '#7C3AED', // Purple-600
  '#D97706', // Amber-600
  '#DB2777', // Pink-600
  '#0891B2', // Cyan-600
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  unitLabel?: string
  countLabel?: string
}

function CustomBarTooltip({ active, payload, unitLabel = 'units', countLabel = 'items' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const title = data.categoryName || data.locationName || ''
    const totalStock = data.totalStock ?? 0
    const itemCount = data.itemCount ?? 0

    return (
      <div className="bg-gray-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-gray-800">
        <p className="font-semibold text-sm text-gray-100">{title}</p>
        <div className="flex items-center justify-between gap-4 text-gray-300">
          <span>Total Stock:</span>
          <span className="font-bold text-white">
            {totalStock.toLocaleString()} {unitLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-gray-400">
          <span>Distinct {countLabel}:</span>
          <span className="font-medium text-gray-200">{itemCount}</span>
        </div>
      </div>
    )
  }
  return null
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="h-[280px] w-full flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <Inbox className="w-8 h-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] w-full bg-gray-50 rounded-xl p-4 animate-pulse flex flex-col justify-between">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="space-y-3 my-auto">
        <div className="h-6 w-full bg-gray-200/80 rounded" />
        <div className="h-6 w-5/6 bg-gray-200/80 rounded" />
        <div className="h-6 w-4/6 bg-gray-200/80 rounded" />
        <div className="h-6 w-3/6 bg-gray-200/80 rounded" />
      </div>
      <div className="h-3 w-48 bg-gray-200 rounded self-end" />
    </div>
  )
}

export function StockCharts({
  categoryData = [],
  locationData = [],
  isLoading = false,
}: StockChartsProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const showLoading = isLoading || !mounted

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown Chart */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Stock by Category</h3>
              <p className="text-xs text-gray-500">Current on-hand inventory across categories</p>
            </div>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {categoryData.length} {categoryData.length === 1 ? 'Category' : 'Categories'}
          </span>
        </div>

        <div className="flex-1 w-full min-h-[300px]">
          {showLoading ? (
            <ChartSkeleton />
          ) : categoryData.length === 0 ? (
            <EmptyChartState message="No stock category data available" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<CustomBarTooltip unitLabel="units" countLabel="items" />} />
                <Bar dataKey="totalStock" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.categoryId || index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Location Breakdown Chart */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Stock by Location</h3>
              <p className="text-xs text-gray-500">Distribution of stock across storage facilities</p>
            </div>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {locationData.length} {locationData.length === 1 ? 'Location' : 'Locations'}
          </span>
        </div>

        <div className="flex-1 w-full min-h-[300px]">
          {showLoading ? (
            <ChartSkeleton />
          ) : locationData.length === 0 ? (
            <EmptyChartState message="No stock location data available" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={locationData}
                layout="horizontal"
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="locationName"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  width={45}
                />
                <Tooltip content={<CustomBarTooltip unitLabel="units" countLabel="items" />} />
                <Bar dataKey="totalStock" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {locationData.map((entry, index) => (
                    <Cell
                      key={`cell-loc-${entry.locationId || index}`}
                      fill={LOCATION_COLORS[index % LOCATION_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
