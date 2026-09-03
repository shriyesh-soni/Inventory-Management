'use client'

import React from 'react'
import { Box, AlertCircle, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { DashboardStats } from '@/types/api'

export interface KpiCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'red' | 'green' | 'purple'
  subtitle?: string
  trend?: { direction: 'up' | 'down'; percentage: number }
  isLoading?: boolean
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/40',
    accent: 'from-blue-500/20 to-transparent',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/40',
    accent: 'from-rose-500/20 to-transparent',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    accent: 'from-emerald-500/20 to-transparent',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/40',
    accent: 'from-purple-500/20 to-transparent',
  },
}

export function KpiCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  isLoading = false,
}: KpiCardProps) {
  const styles = colorStyles[color] || colorStyles.blue

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${styles.accent} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        {subtitle && <span className="text-gray-500">{subtitle}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend.percentage}%
          </span>
        )}
      </div>
    </div>
  )
}

interface KpiCardsProps {
  stats?: DashboardStats
  isLoading?: boolean
}

export function KpiCards({ stats, isLoading = false }: KpiCardsProps) {
  const cards: KpiCardProps[] = [
    {
      title: 'Active Items',
      value: stats?.activeItems ?? 0,
      icon: <Box className="w-6 h-6" />,
      color: 'blue',
      subtitle: 'Catalog inventory items',
    },
    {
      title: 'Below Reorder',
      value: stats?.itemsBelowReorder ?? 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'red',
      subtitle: 'Requires replenishment',
    },
    {
      title: 'Movements Today',
      value: stats?.movementsToday ?? 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green',
      subtitle: 'Transactions recorded today',
    },
    {
      title: 'This Week',
      value: stats?.distinctItemsThisWeek ?? 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple',
      subtitle: 'Distinct items moved in 7d',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} isLoading={isLoading} />
      ))}
    </div>
  )
}
