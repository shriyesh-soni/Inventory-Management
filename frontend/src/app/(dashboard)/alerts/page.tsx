'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAlerts, useDismissAlert } from '@/hooks/use-alerts'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ArrowDownCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { LowStockAlert } from '@/types/api'

function AlertsContent() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isManager = user?.role === 'MANAGER'
  const [dismissingAlert, setDismissingAlert] = useState<LowStockAlert | null>(null)

  const { data: alertsResponse, isLoading, isFetching, refetch } = useAlerts()
  const dismissMutation = useDismissAlert()

  const alerts = alertsResponse?.data || []
  const activeCount = alertsResponse?.activeCount || alerts.length

  // Sort by urgency: highest deficit (reorderLevel - currentOnHand) first
  const sortedAlerts = [...alerts].sort((a, b) => {
    const deficitA = (a.item?.reorderLevel ?? 0) - (a.currentOnHand ?? 0)
    const deficitB = (b.item?.reorderLevel ?? 0) - (b.currentOnHand ?? 0)
    return deficitB - deficitA
  })

  const handleDismissConfirm = async () => {
    if (!dismissingAlert) return

    try {
      await dismissMutation.mutateAsync(dismissingAlert.itemId)
      addToast({
        title: 'Alert Dismissed',
        description: `Alert for "${dismissingAlert.item?.name}" has been acknowledged.`,
        type: 'success',
      })
      setDismissingAlert(null)
      refetch()
    } catch (err: any) {
      addToast({
        title: 'Failed to dismiss alert',
        description: err.response?.data?.message || err.message || 'Error dismissing alert',
        type: 'error',
      })
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 inline-flex">
              <AlertCircle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                Active Stock Alerts
                {activeCount > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold">
                    {activeCount} Critical
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Automated inventory replenishment monitoring and threshold breach notifications
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 border-gray-300 text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-rose-600' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Alerts'}</span>
          </Button>

          <Link href="/movements">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4" />
              <span>Record Inbound Receipt</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert Feed Content */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl p-6" />
          ))}
        </div>
      ) : sortedAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-emerald-200/70 p-12 text-center shadow-xs bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">All Stock Levels Healthy</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            No items are currently below their designated reorder threshold. The automated scanner runs continuously.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/items">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs">
                Inspect Items Catalog
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => {
            const onHand = alert.currentOnHand ?? 0
            const reorder = alert.item?.reorderLevel ?? 0
            const deficit = Math.max(0, reorder - onHand)
            const isZeroStock = onHand === 0

            return (
              <div
                key={alert.id}
                className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-600" />

                {/* Item Details */}
                <div className="space-y-2 pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                      {alert.item?.sku}
                    </span>
                    <Link
                      href={`/items/${alert.itemId}`}
                      className="font-bold text-base text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      {alert.item?.name}
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                    {isZeroStock && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Category: <span className="font-medium text-gray-700">{alert.item?.category?.name || 'Unassigned'}</span>
                    {alert.item?.supplier && (
                      <> • Supplier: <span className="font-medium text-gray-700">{alert.item.supplier.name}</span></>
                    )}
                  </p>

                  {/* Location breakdown badges */}
                  {alert.locations && alert.locations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-gray-400 font-medium">Locations:</span>
                      {alert.locations.map((loc) => (
                        <span
                          key={loc.locationId}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium"
                        >
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {loc.locationName}: <strong className="text-gray-900">{loc.onHand}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metrics & Action Buttons */}
                <div className="flex flex-wrap items-center gap-6 md:gap-8 self-end md:self-center pl-2 md:pl-0">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400">Current On-Hand</p>
                    <p className="text-2xl font-black text-rose-600">
                      {onHand.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-gray-500">{alert.item?.unit}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400">Reorder Threshold</p>
                    <p className="text-xl font-bold text-gray-900">
                      {reorder.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-gray-500">{alert.item?.unit}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/movements">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </Button>
                    </Link>

                    {isManager && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDismissingAlert(alert)}
                        className="border-gray-300 text-gray-600 hover:text-gray-900 text-xs"
                        title="Acknowledge and temporarily dismiss alert"
                      >
                        <BellOff className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dismiss Confirmation Dialog */}
      {dismissingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <BellOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Dismiss Low Stock Alert</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Dismissing this alert will acknowledge the warning for &quot;{dismissingAlert.item?.name}&quot;.
                  The alert will automatically re-trigger if subsequent stock movements cause further deficit.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDismissingAlert(null)}
                disabled={dismissMutation.isPending}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDismissConfirm}
                disabled={dismissMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {dismissMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dismissing...
                  </span>
                ) : (
                  'Dismiss Alert'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlertsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <AlertsContent />
      </MainLayout>
    </AuthGuard>
  )
}
