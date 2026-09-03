'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Inbox } from 'lucide-react'
import type { MovementChartData } from '@/types/api'

export interface MovementChartProps {
  data?: MovementChartData[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomMovementTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const receipts = payload.find((p) => p.dataKey === 'receipts')?.value ?? 0
    const issues = payload.find((p) => p.dataKey === 'issues')?.value ?? 0

    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs space-y-2 border border-gray-800">
        <p className="font-semibold text-sm text-gray-200">{label}</p>
        <div className="space-y-1.5 pt-1 border-t border-gray-800">
          <div className="flex items-center justify-between gap-6 text-blue-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Receipts (In):
            </span>
            <span className="font-bold text-white">{receipts.toLocaleString()} units</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-rose-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Issues (Out):
            </span>
            <span className="font-bold text-white">{issues.toLocaleString()} units</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

function EmptyChartState() {
  return (
    <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <Inbox className="w-8 h-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">No movement history data available</p>
    </div>
  )
}

function MovementChartSkeleton() {
  return (
    <div className="h-[300px] w-full bg-gray-50 rounded-xl p-4 animate-pulse flex flex-col justify-between">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-40 w-full bg-gray-200/60 rounded my-auto" />
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function MovementChart({ data = [], isLoading = false }: MovementChartProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const showLoading = isLoading || !mounted
  const totalReceipts = data.reduce((acc, curr) => acc + (curr.receipts || 0), 0)
  const totalIssues = data.reduce((acc, curr) => acc + (curr.issues || 0), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">8-Week Movement Volume</h3>
            <p className="text-xs text-gray-500">Weekly trend of stock receipts vs stock issues</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
            <ArrowUpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Total In: {totalReceipts.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium">
            <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Out: {totalIssues.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="w-full min-h-[320px]">
        {showLoading ? (
          <MovementChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                width={45}
              />
              <Tooltip content={<CustomMovementTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                name="Receipts"
                dataKey="receipts"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#2563EB' }}
              />
              <Line
                type="monotone"
                name="Issues"
                dataKey="issues"
                stroke="#E11D48"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#E11D48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
