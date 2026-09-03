'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { useItem } from '@/hooks/use-items'
import { useItemMovements } from '@/hooks/use-movements'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Sliders,
  History,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Package,
  Calendar,
  User as UserIcon,
} from 'lucide-react'
import { format } from 'date-fns'

function MovementHistoryContent() {
  const params = useParams()
  const router = useRouter()
  const itemId = (params?.itemId as string) || ''
  const [page, setPage] = useState(1)
  const limit = 25

  const { data: item, isLoading: isLoadingItem } = useItem(itemId)
  const { data: movementsResponse, isLoading: isLoadingMovements } = useItemMovements(
    itemId,
    page,
    limit
  )

  const movements = movementsResponse?.data || []
  const total = movementsResponse?.total || 0
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.push('/movements')}
            className="border-gray-200"
            title="Back to Movement Center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <History className="w-6 h-6 text-purple-600" />
              Stock Movement History
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {item ? (
                <>
                  Tracking transactions for{' '}
                  <span className="font-semibold text-gray-900">{item.name}</span> ({item.sku})
                </>
              ) : (
                'Loading item information...'
              )}
            </p>
          </div>
        </div>

        {item && (
          <Link href={`/items/${item.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <span>View Item Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Movements Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Movement Type
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Location / Route
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Recorded By
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Reason / Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingMovements ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                    Loading movement records...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-400">
                      <Package className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-700 text-base">No movements recorded</p>
                      <p className="text-xs text-gray-500 mt-1">
                        There are no receipt, issue, transfer, or adjustment logs on file for this SKU.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isReceipt = m.kind === 'RECEIPT'
                  const isIssue = m.kind === 'ISSUE'
                  const isTransfer = m.kind === 'TRANSFER'
                  const isAdj = m.kind === 'ADJUSTMENT'

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        {format(new Date(m.createdAt), 'MMM d, yyyy • HH:mm:ss')}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isReceipt
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isIssue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isTransfer
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isReceipt && <ArrowDownCircle className="w-3.5 h-3.5" />}
                          {isIssue && <ArrowUpCircle className="w-3.5 h-3.5" />}
                          {isTransfer && <ArrowLeftRight className="w-3.5 h-3.5" />}
                          {isAdj && <Sliders className="w-3.5 h-3.5" />}
                          {m.kind}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-sm">
                        <span
                          className={
                            isReceipt
                              ? 'text-emerald-700'
                              : isIssue
                              ? 'text-rose-700'
                              : 'text-gray-900'
                          }
                        >
                          {isReceipt ? '+' : isIssue ? '-' : ''}
                          {m.quantity.toLocaleString()}
                        </span>{' '}
                        <span className="text-xs font-normal text-gray-400">
                          {item?.unit || 'units'}
                        </span>
                      </td>

                      {/* Location / Route */}
                      <td className="px-6 py-4 text-xs font-medium text-gray-800">
                        {isTransfer ? (
                          <span className="flex items-center gap-1 text-gray-600">
                            <span>Origin</span> → <span className="font-bold text-gray-900">{m.location?.name}</span>
                          </span>
                        ) : (
                          m.location?.name || 'N/A'
                        )}
                      </td>

                      {/* User */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{m.recordedBy?.name || 'System'}</span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {m.reason || '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Total <span className="font-semibold text-gray-900">{total}</span> movements recorded
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isLoadingMovements}
                className="text-xs border-gray-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <span className="text-xs font-medium text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isLoadingMovements}
                className="text-xs border-gray-200"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MovementHistoryPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <MovementHistoryContent />
      </MainLayout>
    </AuthGuard>
  )
}
