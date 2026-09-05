'use client'

import React from 'react'

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-6 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-16 flex items-center px-6 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 bg-gray-100 rounded ${
                  c === 0 ? 'w-1/3' : 'flex-1'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      style={{ height }}
      className="w-full bg-white rounded-2xl border border-gray-100 p-6 animate-pulse flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
      <div className="flex items-end gap-3 h-44 pt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t-lg"
            style={{ height: `${20 + (i % 5) * 18}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-6 bg-gray-100 rounded w-20" />
        </div>
      ))}
    </div>
  )
}
