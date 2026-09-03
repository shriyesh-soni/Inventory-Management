'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { StockCharts } from '@/components/dashboard/StockCharts'
import { MovementChart } from '@/components/dashboard/MovementChart'
import {
  useDashboardStats,
  useStockByCategory,
  useStockByLocation,
  useMovementChart,
} from '@/hooks/use-dashboard'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ArrowLeftRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react'

function DashboardContent() {
  const { user } = useAuth()
  const { addToast } = useToast()

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useDashboardStats()

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    isError: isCategoryError,
    error: categoryError,
    refetch: refetchCategory,
    isFetching: isFetchingCategory,
  } = useStockByCategory()

  const {
    data: locationData,
    isLoading: isLoadingLocation,
    isError: isLocationError,
    error: locationError,
    refetch: refetchLocation,
    isFetching: isFetchingLocation,
  } = useStockByLocation()

  const {
    data: movementData,
    isLoading: isLoadingMovement,
    isError: isMovementError,
    error: movementError,
    refetch: refetchMovement,
    isFetching: isFetchingMovement,
  } = useMovementChart()

  const hasErrors = isStatsError || isCategoryError || isLocationError || isMovementError
  const isRefreshing =
    isFetchingStats || isFetchingCategory || isFetchingLocation || isFetchingMovement
  const errorToastShownRef = React.useRef(false)

  // Trigger toast only once on failure
  useEffect(() => {
    if (hasErrors && !errorToastShownRef.current) {
      errorToastShownRef.current = true
      const errorMsg =
        (statsError as any)?.message ||
        (categoryError as any)?.message ||
        (locationError as any)?.message ||
        (movementError as any)?.message ||
        'Failed to fetch one or more dashboard metrics'
      addToast({
        title: 'Error loading dashboard',
        description: errorMsg,
        type: 'error',
      })
    } else if (!hasErrors) {
      errorToastShownRef.current = false
    }
  }, [hasErrors, statsError, categoryError, locationError, movementError, addToast])

  const handleRefreshAll = () => {
    errorToastShownRef.current = false
    refetchStats()
    refetchCategory()
    refetchLocation()
    refetchMovement()
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time inventory overview and operational stock activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </Button>

          {user?.role === 'MANAGER' && (
            <Link href="/items">
              <Button size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                <PlusCircle className="w-4 h-4" />
                <span>Manage Items</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Global Error Banner if any critical failure */}
      {hasErrors && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load some dashboard widgets</p>
              <p className="text-xs text-rose-600 mt-0.5">
                Some statistics could not be loaded from the server. Check your connection or retry.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshAll}
            className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0 text-xs"
          >
            Retry All
          </Button>
        </div>
      )}

      {/* 1. KPI Cards Section */}
      <section aria-labelledby="kpi-section-title">
        <h2 id="kpi-section-title" className="sr-only">
          Key Performance Indicators
        </h2>
        <KpiCards stats={stats} isLoading={isLoadingStats} />
      </section>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/movements"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200/80 hover:border-blue-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Record Movement</p>
              <p className="text-[11px] text-gray-500">Receipts & Issues</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/alerts"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200/80 hover:border-amber-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Low Stock Alerts</p>
              <p className="text-[11px] text-gray-500">
                {stats?.itemsBelowReorder ?? 0} items critical
              </p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/locations"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200/80 hover:border-emerald-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Location Stock</p>
              <p className="text-[11px] text-gray-500">{locationData?.length ?? 0} facilities</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/import-export"
          className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200/80 hover:border-purple-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Import / Export</p>
              <p className="text-[11px] text-gray-500">CSV bulk operations</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. Stock Breakdown Visualizations (Category & Location) */}
      <section aria-labelledby="stock-breakdown-title" className="space-y-3">
        <StockCharts
          categoryData={categoryData}
          locationData={locationData}
          isLoading={isLoadingCategory || isLoadingLocation}
        />
      </section>

      {/* 3. Movement Volume 8-Week Trend */}
      <section aria-labelledby="movement-chart-title">
        <MovementChart data={movementData} isLoading={isLoadingMovement} />
      </section>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </AuthGuard>
  )
}
