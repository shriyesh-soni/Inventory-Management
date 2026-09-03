'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { LocationFormModal } from '@/components/locations/LocationFormModal'
import { useLocations } from '@/hooks/use-locations'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Plus,
  Search,
  Users,
  ArrowRight,
  TrendingUp,
  Building,
  Layers,
} from 'lucide-react'

function LocationsContent() {
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: locations = [], isLoading, refetch } = useLocations()

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 inline-flex">
              <MapPin className="w-6 h-6" />
            </span>
            Warehouse & Storage Locations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage facilities, warehouse bays, assigned staff, and per-location stock positions
          </p>
        </div>

        {isManager && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search warehouse locations by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Locations Grid Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl p-6" />
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400">
          <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 text-base">No locations found</p>
          <p className="text-xs text-gray-500 mt-1">
            {searchTerm
              ? 'No facilities match your search criteria.'
              : 'Add your first warehouse location to begin tracking physical inventory.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => {
            const assignmentCount = loc._count?.assignments ?? 0
            const movementCount = loc._count?.movements ?? 0

            return (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      Active Facility
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 mt-4 leading-tight group-hover:text-emerald-700 transition-colors">
                    {loc.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{assignmentCount} Staff Assigned</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                      <span>{movementCount} Movements</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/locations/${loc.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all"
                    >
                      <span>View Location Stock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Location Modal */}
      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default function LocationsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <LocationsContent />
      </MainLayout>
    </AuthGuard>
  )
}
