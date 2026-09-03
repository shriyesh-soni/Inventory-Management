'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { ItemForm } from '@/components/items/ItemForm'
import { ItemActionModal } from '@/components/items/ItemActions'
import {
  useItem,
  useItemTimeline,
  useItemMovements,
  useAddItemNote,
} from '@/hooks/use-items'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Edit2,
  Archive,
  RotateCcw,
  Box,
  Layers,
  Building2,
  Clock,
  MapPin,
  TrendingUp,
  MessageSquare,
  History,
  Send,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Loader2,
  Calendar,
  User as UserIcon,
} from 'lucide-react'
import { format } from 'date-fns'

function ItemDetailContent() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''
  const { user } = useAuth()
  const { addToast } = useToast()
  const isManager = user?.role === 'MANAGER'

  // Modals & form state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [actionType, setActionType] = useState<'archive' | 'restore' | null>(null)
  const [noteContent, setNoteContent] = useState('')

  // Data queries
  const { data: item, isLoading: isLoadingItem, isError, refetch: refetchItem } = useItem(id)
  const { data: timeline = [], isLoading: isLoadingTimeline, refetch: refetchTimeline } = useItemTimeline(id)
  const { data: movementsData, isLoading: isLoadingMovements } = useItemMovements(id, 1, 5)

  const addNoteMutation = useAddItemNote()

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    try {
      await addNoteMutation.mutateAsync({ id, content: noteContent.trim() })
      setNoteContent('')
      addToast({
        title: 'Note Added',
        description: 'Your note was recorded on the item timeline.',
        type: 'success',
      })
      refetchTimeline()
    } catch (err: any) {
      addToast({
        title: 'Failed to add note',
        description: err.response?.data?.message || err.message || 'Error recording note',
        type: 'error',
      })
    }
  }

  if (isLoadingItem) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-48 w-full bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Item Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">
          The requested inventory item could not be retrieved or has been permanently removed.
        </p>
        <Link href="/items">
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Return to Items Catalog
          </Button>
        </Link>
      </div>
    )
  }

  const onHand = item.totalOnHand ?? 0
  const reorder = item.reorderLevel ?? 0
  const isBelowReorder = onHand <= reorder
  const recentMovements = movementsData?.data || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => router.push('/items')}
            className="border-gray-200 hover:bg-gray-100"
            title="Back to Items"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {item.name}
              </h1>
              {item.isArchived ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                  Archived
                </span>
              ) : isBelowReorder ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Below Reorder
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-gray-500 mt-1">SKU: {item.sku}</p>
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Item</span>
            </Button>

            {item.isArchived ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionType('restore')}
                className="flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Item</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionType('archive')}
                className="flex items-center gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Item</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 1. Item Specifications Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-600" />
          Item Specifications & Stock Position
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Total On-Hand</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                isBelowReorder && !item.isArchived ? 'text-rose-600' : 'text-gray-900'
              }`}
            >
              {onHand.toLocaleString()}{' '}
              <span className="text-xs font-normal text-gray-500">{item.unit}</span>
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Reorder Threshold</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">
              {reorder.toLocaleString()}{' '}
              <span className="text-xs font-normal text-gray-500">{item.unit}</span>
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Category</p>
            <p className="text-sm font-semibold mt-2 text-gray-900 truncate flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {item.category?.name || 'Unassigned'}
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Supplier</p>
            <p className="text-sm font-semibold mt-2 text-gray-900 truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              {item.supplier?.name || 'None'}
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Created On</p>
            <p className="text-xs font-semibold mt-2 text-gray-900">
              {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500">Last Modified</p>
            <p className="text-xs font-semibold mt-2 text-gray-900">
              {item.updatedAt ? format(new Date(item.updatedAt), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        {item.description && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">Description & Notes</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}
      </div>

      {/* 2. Stock by Location & Recent Movements in 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Location Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Stock by Location</h3>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {item.locations?.length || 0} Facilities
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">On-Hand</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!item.locations || item.locations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400">
                      No stock reported at any location.
                    </td>
                  </tr>
                ) : (
                  item.locations.map((loc) => (
                    <tr key={loc.locationId} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        {loc.locationName}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">
                        {loc.onHand.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {loc.onHand > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Zero Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Movements Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Recent Movements</h3>
            </div>
            <Link
              href="/movements"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Movements →
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingMovements ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Loading movements...
                    </td>
                  </tr>
                ) : recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No stock movements recorded yet for this item.
                    </td>
                  </tr>
                ) : (
                  recentMovements.map((m) => {
                    const isReceipt = m.kind === 'RECEIPT'
                    const isIssue = m.kind === 'ISSUE'
                    const isTransfer = m.kind === 'TRANSFER'

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                          {format(new Date(m.createdAt), 'MMM d, HH:mm')}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isReceipt
                                ? 'bg-emerald-50 text-emerald-700'
                                : isIssue
                                ? 'bg-rose-50 text-rose-700'
                                : isTransfer
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {m.kind}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900 whitespace-nowrap">
                          {isReceipt ? '+' : isIssue ? '-' : ''}
                          {m.quantity}
                        </td>
                        <td className="py-3 px-3 text-gray-700 truncate max-w-[100px]">
                          {m.location?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-gray-500 truncate max-w-[100px]">
                          {m.recordedBy?.name || 'User'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Audit Timeline & Notes Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Audit History & Notes Timeline</h2>
              <p className="text-xs text-gray-500">
                Immutable audit trail of specification changes and operational notes
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {timeline.length} Entries
          </span>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/70">
          <label htmlFor="noteText" className="block text-xs font-semibold text-gray-700">
            Add Operational Note to Item Timeline
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              id="noteText"
              rows={2}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="e.g. Received shipment inspection report, packaging damaged on 2 units..."
              className="flex-1 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
            <Button
              type="submit"
              disabled={!noteContent.trim() || addNoteMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white self-end shrink-0 flex items-center gap-1.5 h-10 px-4"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Post Note</span>
            </Button>
          </div>
        </form>

        {/* Timeline Entries List */}
        <div className="space-y-4 pt-2">
          {isLoadingTimeline ? (
            <div className="py-8 text-center text-gray-400">Loading timeline history...</div>
          ) : timeline.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No audit logs or notes recorded yet for this item.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
              {timeline.map((entry) => {
                const isAudit = entry.type === 'AUDIT_LOG'
                const isNote = entry.type === 'NOTE'

                return (
                  <div key={entry.id} className="relative group">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isNote ? 'bg-purple-500' : 'bg-blue-500'
                      }`}
                    />

                    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isNote
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isNote ? 'NOTE ADDED' : `AUDIT: ${entry.field || 'CHANGE'}`}
                          </span>
                          <span className="text-xs font-semibold text-gray-800">
                            {entry.user?.name || 'System User'}
                          </span>
                          <span className="text-[11px] text-gray-400">({entry.user?.role})</span>
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(entry.createdAt), 'MMM d, yyyy • HH:mm:ss')}
                        </span>
                      </div>

                      {isNote ? (
                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {entry.content}
                        </p>
                      ) : (
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Previous:</span>
                            <span className="line-through text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                              {entry.oldValue || '(none)'}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {entry.newValue}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ItemForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialItem={item}
        onSuccess={() => {
          refetchItem()
          refetchTimeline()
        }}
      />

      {/* Archive / Restore Modal */}
      <ItemActionModal
        item={item}
        action={actionType}
        onClose={() => setActionType(null)}
        onSuccess={() => {
          refetchItem()
          refetchTimeline()
        }}
      />
    </div>
  )
}

export default function ItemDetailPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ItemDetailContent />
      </MainLayout>
    </AuthGuard>
  )
}
