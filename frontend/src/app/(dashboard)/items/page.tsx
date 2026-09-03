'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { ItemsTable } from '@/components/items/ItemsTable'
import { ItemForm } from '@/components/items/ItemForm'
import { ItemActionModal } from '@/components/items/ItemActions'
import { useItems, useCategories, useLocations } from '@/hooks/use-items'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
  Archive,
} from 'lucide-react'
import type { Item, ItemsQueryParams } from '@/types/api'

function ItemsContent() {
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'

  // Filter & pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [showBelowReorder, setShowBelowReorder] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const limit = 20

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [actionItem, setActionItem] = useState<Item | null>(null)
  const [actionType, setActionType] = useState<'archive' | 'restore' | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Queries
  const { data: categories = [] } = useCategories()
  const { data: locations = [] } = useLocations()

  const queryParams: ItemsQueryParams = {
    search: debouncedSearch || undefined,
    categoryId: selectedCategory || undefined,
    locationId: selectedLocation || undefined,
    archived: showArchived ? 'true' : 'false',
    belowReorder: showBelowReorder ? 'true' : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  }

  const { data, isLoading, isFetching, refetch } = useItems(queryParams)

  const items = data?.data || []
  const total = data?.total || 0

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val)
    setPage(1)
  }

  const handleLocationChange = (val: string) => {
    setSelectedLocation(val)
    setPage(1)
  }

  const handleArchivedToggle = () => {
    setShowArchived((prev) => !prev)
    setPage(1)
  }

  const handleBelowReorderToggle = () => {
    setShowBelowReorder((prev) => !prev)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setSelectedCategory('')
    setSelectedLocation('')
    setShowArchived(false)
    setShowBelowReorder(false)
    setSortBy('name')
    setSortOrder('asc')
    setPage(1)
  }

  const handleCreateClick = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (item: Item) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleArchiveClick = (item: Item) => {
    setActionItem(item)
    setActionType('archive')
  }

  const handleRestoreClick = (item: Item) => {
    setActionItem(item)
    setActionType('restore')
  }

  const hasActiveFilters =
    debouncedSearch !== '' ||
    selectedCategory !== '' ||
    selectedLocation !== '' ||
    showArchived ||
    showBelowReorder ||
    sortBy !== 'name' ||
    sortOrder !== 'asc'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Inventory Items
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product catalog, stock thresholds and supplier relationships
          </p>
        </div>

        {isManager && (
          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Item</span>
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by SKU, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3.5 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="px-3.5 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="sku">Sort by SKU</option>
              <option value="onHand">Sort by On-Hand</option>
              <option value="reorderLevel">Sort by Reorder</option>
            </select>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="border-gray-200"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Filter Toggle Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBelowReorderToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                showBelowReorder
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Below Reorder Level Only
            </button>

            <button
              type="button"
              onClick={handleArchivedToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                showArchived
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              {showArchived ? 'Showing Archived Items' : 'Include Archived Items'}
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 h-7"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <ItemsTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={(newPage) => setPage(newPage)}
        onEdit={handleEditClick}
        onArchive={handleArchiveClick}
        onRestore={handleRestoreClick}
      />

      {/* Create / Edit Modal */}
      <ItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialItem={editingItem}
        onSuccess={() => refetch()}
      />

      {/* Archive / Restore Confirmation Modal */}
      <ItemActionModal
        item={actionItem}
        action={actionType}
        onClose={() => {
          setActionItem(null)
          setActionType(null)
        }}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default function ItemsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ItemsContent />
      </MainLayout>
    </AuthGuard>
  )
}
