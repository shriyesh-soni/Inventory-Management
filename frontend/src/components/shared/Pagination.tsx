'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const isFirst = currentPage <= 1
  const isLast = currentPage >= safeTotalPages

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      {/* Total items info */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        {totalItems !== undefined && (
          <span>
            Total <strong className="text-gray-900">{totalItems.toLocaleString()}</strong> records
          </span>
        )}

        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5 ml-3 border-l border-gray-200 pl-3">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => onPageChange(1)}
          disabled={isFirst}
          className="border-gray-200 text-gray-600 disabled:opacity-40"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className="border-gray-200 text-xs text-gray-700 disabled:opacity-40 flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </Button>

        <span className="text-xs font-semibold text-gray-700 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-2xs">
          Page {currentPage} of {safeTotalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className="border-gray-200 text-xs text-gray-700 disabled:opacity-40 flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={isLast}
          className="border-gray-200 text-gray-600 disabled:opacity-40"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
