'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Building2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { Item } from '@/types/api'

export interface ItemsTableProps {
  items: Item[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onEdit?: (item: Item) => void
  onArchive?: (item: Item) => void
  onRestore?: (item: Item) => void
}

function StockStatusBadge({ item }: { item: Item }) {
  if (item.isArchived) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        Archived
      </span>
    )
  }

  const onHand = item.totalOnHand ?? 0
  const reorder = item.reorderLevel ?? 0

  if (onHand > reorder) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Good
      </span>
    )
  }

  if (onHand === reorder) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3" />
        Low
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <AlertTriangle className="w-3 h-3" />
      Critical
    </span>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-3 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-6 bg-gray-200 rounded-full" />
            <div className="w-20 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ItemsTable({
  items,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onEdit,
  onArchive,
  onRestore,
}: ItemsTableProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'

  const totalPages = Math.ceil(total / limit) || 1
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <th scope="col" className="px-6 py-3.5">
                SKU
              </th>
              <th scope="col" className="px-6 py-3.5">
                Item Name
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                On-Hand
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Reorder Threshold
              </th>
              <th scope="col" className="px-6 py-3.5 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <TableSkeleton rows={limit > 10 ? 8 : 5} />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-400">
                    <Package className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-semibold text-gray-700 text-base">No items found</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Try adjusting your search criteria or create a new inventory item to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const onHand = item.totalOnHand ?? 0
                const isBelow = onHand <= (item.reorderLevel ?? 0)

                return (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/items/${item.id}`)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* SKU */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-gray-700 group-hover:text-blue-600">
                      {item.sku}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 leading-tight">
                        {item.name}
                      </div>
                      {item.supplier && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          <span>{item.supplier.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        <Layers className="w-3 h-3 text-gray-400" />
                        {item.category?.name || 'Unassigned'}
                      </span>
                    </td>

                    {/* On-Hand */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-sm">
                      <span className={isBelow && !item.isArchived ? 'text-rose-600' : 'text-gray-900'}>
                        {onHand.toLocaleString()}
                      </span>{' '}
                      <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                    </td>

                    {/* Reorder Level */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500">
                      {item.reorderLevel?.toLocaleString() ?? 0} {item.unit}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StockStatusBadge item={item} />
                    </td>

                    {/* Actions */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/items/${item.id}`}>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {isManager && (
                          <>
                            {onEdit && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => onEdit(item)}
                                className="text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Edit item"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}

                            {item.isArchived ? (
                              onRestore && (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => onRestore(item)}
                                  className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                                  title="Restore item"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )
                            ) : (
                              onArchive && (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => onArchive(item)}
                                  className="text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                                  title="Archive item"
                                >
                                  <Archive className="w-4 h-4" />
                                </Button>
                              )
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{total}</span> items
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="border-gray-200 text-xs flex items-center gap-1"
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
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="border-gray-200 text-xs flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
