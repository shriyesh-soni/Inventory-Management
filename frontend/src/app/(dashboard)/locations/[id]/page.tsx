'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { useLocations, useLocationStock } from '@/hooks/use-locations'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  ArrowLeft,
  Search,
  Package,
  Layers,
  ArrowLeftRight,
  ExternalLink,
  Users,
  EyeOff,
  Eye,
  CheckCircle2,
} from 'lucide-react'

function LocationDetailContent() {
  const params = useParams()
  const router = useRouter()
  const locationId = (params?.id as string) || ''
  const [searchTerm, setSearchTerm] = useState('')
  const [hideZeroStock, setHideZeroStock] = useState(false)

  const { data: locations = [] } = useLocations()
  const currentLocation = locations.find((l) => l.id === locationId)

  const { data: stockItems = [], isLoading } = useLocationStock(locationId)

  const filteredItems = stockItems.filter((item: any) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (hideZeroStock && (item.onHand ?? 0) <= 0) return false
    return true
  })

  const totalStockUnits = stockItems.reduce((acc: number, curr: any) => acc + (curr.onHand || 0), 0)

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.push('/locations')}
            className="border-gray-200"
            title="Back to Locations"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              {currentLocation?.name || 'Warehouse Facility'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live on-hand inventory position and stock breakdown at this location
            </p>
          </div>
        </div>

        <Link href="/movements">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-xs">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Record Movement Here</span>
          </Button>
        </Link>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Total Stocked Units</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalStockUnits.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Distinct SKUs Present</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {stockItems.length} Products
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Staff Assigned</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {currentLocation?._count?.assignments ?? 0} Operators
          </p>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter stock by SKU, product name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setHideZeroStock((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
            hideZeroStock
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {hideZeroStock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{hideZeroStock ? 'Zero Stock Hidden' : 'Hide Zero Stock'}</span>
        </button>
      </div>

      {/* Stock Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Category
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Quantity On-Hand
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    Loading location inventory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-400">
                      <Package className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-700 text-base">No items found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        No inventory matches your filters at this facility.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/items/${item.id}`)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-gray-700 group-hover:text-emerald-700">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        <Layers className="w-3 h-3 text-gray-400" />
                        {item.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-sm text-gray-900">
                      {item.onHand?.toLocaleString() ?? 0}{' '}
                      <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/items/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View SKU</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function LocationDetailPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <LocationDetailContent />
      </MainLayout>
    </AuthGuard>
  )
}
