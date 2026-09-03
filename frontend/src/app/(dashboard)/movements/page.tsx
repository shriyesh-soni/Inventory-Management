'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { MovementForms } from '@/components/movements/MovementForms'
import { useItems } from '@/hooks/use-items'
import { Button } from '@/components/ui/button'
import {
  ArrowLeftRight,
  History,
  Search,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react'

function MovementsContent() {
  const [selectedItemId, setSelectedItemId] = useState('')
  const { data: itemsResponse } = useItems({ limit: 100, archived: 'false' })
  const items = itemsResponse?.data || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 inline-flex">
              <ArrowLeftRight className="w-6 h-6" />
            </span>
            Record Stock Movement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Log inventory receipts, outbound issues, facility transfers, and audit adjustments
          </p>
        </div>
      </div>

      {/* Main Movement Form Component */}
      <MovementForms />

      {/* Item Movement History Quick Selector */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Search Item Movement Logs</h2>
              <p className="text-xs text-gray-500">
                View complete ledger of transactions and transfers for any SKU
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="">-- Select an Item to View Movement Ledger --</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.sku}] {item.name}
              </option>
            ))}
          </select>

          {selectedItemId && (
            <Link href={`/movements/${selectedItemId}`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 h-10 shrink-0">
                <span>Open Item History</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MovementsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <MovementsContent />
      </MainLayout>
    </AuthGuard>
  )
}
