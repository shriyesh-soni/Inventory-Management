'use client'

import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Box,
  MapPin,
  FileText,
} from 'lucide-react'
import {
  useRecordReceipt,
  useRecordIssue,
  useRecordTransfer,
  useRecordAdjustment,
} from '@/hooks/use-movements'
import { useItems, useLocations } from '@/hooks/use-items'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { Item, Location } from '@/types/api'

// Validation Schemas
const receiptSchema = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  locationId: z.string().min(1, 'Please select a receiving location'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
})

const issueSchema = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  locationId: z.string().min(1, 'Please select a source location'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
})

const transferSchema = z
  .object({
    itemId: z.string().min(1, 'Please select an item'),
    sourceLocationId: z.string().min(1, 'Please select source location'),
    destinationLocationId: z.string().min(1, 'Please select destination location'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  })
  .refine((data) => data.sourceLocationId !== data.destinationLocationId, {
    message: 'Destination location must be different from source',
    path: ['destinationLocationId'],
  })

const adjustmentSchema = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  locationId: z.string().min(1, 'Please select location to adjust'),
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer')
    .refine((val) => val !== 0, 'Adjustment quantity cannot be 0'),
  reason: z.string().min(3, 'Detailed reason is required for adjustments').trim(),
})

type MovementTab = 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT'

export function MovementForms({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isManager = user?.role === 'MANAGER'

  const [activeTab, setActiveTab] = useState<MovementTab>('RECEIPT')

  // Load items and locations
  const { data: itemsResponse, isLoading: isLoadingItems } = useItems({ limit: 100, archived: 'false' })
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations()

  const items = itemsResponse?.data || []

  // Filter locations for staff if assigned
  const availableLocations = useMemo(() => {
    if (isManager || !user?.locationAssignments || user.locationAssignments.length === 0) {
      return locations
    }
    const assignedIds = new Set(user.locationAssignments.map((a) => a.locationId))
    return locations.filter((l) => assignedIds.has(l.id))
  }, [isManager, user, locations])

  // Mutations
  const receiptMutation = useRecordReceipt()
  const issueMutation = useRecordIssue()
  const transferMutation = useRecordTransfer()
  const adjustmentMutation = useRecordAdjustment()

  // Receipt Form
  const {
    register: regReceipt,
    handleSubmit: handleReceiptSubmit,
    reset: resetReceipt,
    watch: watchReceipt,
    formState: { errors: errorsReceipt, isSubmitting: isSubmittingReceipt },
  } = useForm({
    resolver: zodResolver(receiptSchema),
    defaultValues: { itemId: '', locationId: '', quantity: 1 },
  })

  // Issue Form
  const {
    register: regIssue,
    handleSubmit: handleIssueSubmit,
    reset: resetIssue,
    watch: watchIssue,
    formState: { errors: errorsIssue, isSubmitting: isSubmittingIssue },
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: { itemId: '', locationId: '', quantity: 1 },
  })

  // Transfer Form
  const {
    register: regTransfer,
    handleSubmit: handleTransferSubmit,
    reset: resetTransfer,
    watch: watchTransfer,
    formState: { errors: errorsTransfer, isSubmitting: isSubmittingTransfer },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: { itemId: '', sourceLocationId: '', destinationLocationId: '', quantity: 1 },
  })

  // Adjustment Form
  const {
    register: regAdj,
    handleSubmit: handleAdjSubmit,
    reset: resetAdj,
    watch: watchAdj,
    formState: { errors: errorsAdj, isSubmitting: isSubmittingAdj },
  } = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { itemId: '', locationId: '', quantity: -1, reason: '' },
  })

  // Selected item helpers
  const selectedReceiptItemId = watchReceipt('itemId')
  const selectedReceiptItem = items.find((i) => i.id === selectedReceiptItemId)

  const selectedIssueItemId = watchIssue('itemId')
  const selectedIssueLocId = watchIssue('locationId')
  const selectedIssueItem = items.find((i) => i.id === selectedIssueItemId)
  const issueLocationStock = selectedIssueItem?.locations?.find((l) => l.locationId === selectedIssueLocId)?.onHand ?? 0

  const selectedTransferItemId = watchTransfer('itemId')
  const selectedTransferSourceId = watchTransfer('sourceLocationId')
  const selectedTransferItem = items.find((i) => i.id === selectedTransferItemId)
  const transferSourceStock = selectedTransferItem?.locations?.find((l) => l.locationId === selectedTransferSourceId)?.onHand ?? 0

  const selectedAdjItemId = watchAdj('itemId')
  const selectedAdjLocId = watchAdj('locationId')
  const selectedAdjQty = watchAdj('quantity')
  const selectedAdjItem = items.find((i) => i.id === selectedAdjItemId)
  const adjLocationStock = selectedAdjItem?.locations?.find((l) => l.locationId === selectedAdjLocId)?.onHand ?? 0

  // Submission Handlers
  const onReceipt = async (data: any) => {
    try {
      await receiptMutation.mutateAsync({
        itemId: data.itemId,
        locationId: data.locationId,
        quantity: Number(data.quantity),
      })
      addToast({
        title: 'Stock Receipt Recorded',
        description: `Successfully added ${data.quantity} units of ${selectedReceiptItem?.name || 'item'}.`,
        type: 'success',
      })
      resetReceipt()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      addToast({
        title: 'Receipt Failed',
        description: err.response?.data?.message || err.message || 'Error recording receipt',
        type: 'error',
      })
    }
  }

  const onIssue = async (data: any) => {
    try {
      await issueMutation.mutateAsync({
        itemId: data.itemId,
        locationId: data.locationId,
        quantity: Number(data.quantity),
      })
      addToast({
        title: 'Stock Issue Recorded',
        description: `Successfully issued ${data.quantity} units of ${selectedIssueItem?.name || 'item'}.`,
        type: 'success',
      })
      resetIssue()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      addToast({
        title: 'Issue Failed',
        description: err.response?.data?.message || err.message || 'Error issuing stock',
        type: 'error',
      })
    }
  }

  const onTransfer = async (data: any) => {
    try {
      await transferMutation.mutateAsync({
        itemId: data.itemId,
        sourceLocationId: data.sourceLocationId,
        destinationLocationId: data.destinationLocationId,
        quantity: Number(data.quantity),
      })
      addToast({
        title: 'Stock Transfer Recorded',
        description: `Successfully transferred ${data.quantity} units.`,
        type: 'success',
      })
      resetTransfer()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      addToast({
        title: 'Transfer Failed',
        description: err.response?.data?.message || err.message || 'Error executing transfer',
        type: 'error',
      })
    }
  }

  const onAdjustment = async (data: any) => {
    try {
      await adjustmentMutation.mutateAsync({
        itemId: data.itemId,
        locationId: data.locationId,
        quantity: Number(data.quantity),
        reason: data.reason,
      })
      addToast({
        title: 'Stock Adjustment Recorded',
        description: `Adjustment of ${data.quantity > 0 ? '+' : ''}${data.quantity} units recorded.`,
        type: 'success',
      })
      resetAdj()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      addToast({
        title: 'Adjustment Failed',
        description: err.response?.data?.message || err.message || 'Error recording adjustment',
        type: 'error',
      })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 bg-gray-50/70 p-1.5 gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('RECEIPT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'RECEIPT'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Receipt (Inbound)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ISSUE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ISSUE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Issue (Outbound)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TRANSFER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'TRANSFER'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Internal Transfer</span>
        </button>

        {isManager && (
          <button
            type="button"
            onClick={() => setActiveTab('ADJUSTMENT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ADJUSTMENT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Audit Adjustment (Manager)</span>
          </button>
        )}
      </div>

      {/* Form Content Area */}
      <div className="p-6">
        {/* 1. RECEIPT FORM */}
        {activeTab === 'RECEIPT' && (
          <form onSubmit={handleReceiptSubmit(onReceipt)} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs">
                Record incoming stock from suppliers or production into a specific warehouse facility.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Item to Receive <span className="text-rose-500">*</span>
              </label>
              <select
                {...regReceipt('itemId')}
                disabled={isLoadingItems}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose Item SKU / Name --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name} — Current Total: {item.totalOnHand ?? 0} {item.unit}
                  </option>
                ))}
              </select>
              {errorsReceipt.itemId && (
                <p className="mt-1 text-xs text-rose-600">{errorsReceipt.itemId.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destination Location <span className="text-rose-500">*</span>
                </label>
                <select
                  {...regReceipt('locationId')}
                  disabled={isLoadingLocations}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Select Facility --</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errorsReceipt.locationId && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsReceipt.locationId.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Received ({selectedReceiptItem?.unit || 'units'}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  {...regReceipt('quantity')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {errorsReceipt.quantity && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsReceipt.quantity.message as string}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmittingReceipt || receiptMutation.isPending}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmittingReceipt || receiptMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording Receipt...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Record Stock Receipt
                </>
              )}
            </Button>
          </form>
        )}

        {/* 2. ISSUE FORM */}
        {activeTab === 'ISSUE' && (
          <form onSubmit={handleIssueSubmit(onIssue)} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-rose-800 bg-rose-50/70 p-3 rounded-xl border border-rose-200/60 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs">
                Record stock deductions for dispatch, sales orders, or consumption. Quantity cannot exceed available on-hand.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Item to Issue <span className="text-rose-500">*</span>
              </label>
              <select
                {...regIssue('itemId')}
                disabled={isLoadingItems}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="">-- Choose Item SKU / Name --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name} — Total On-Hand: {item.totalOnHand ?? 0} {item.unit}
                  </option>
                ))}
              </select>
              {errorsIssue.itemId && (
                <p className="mt-1 text-xs text-rose-600">{errorsIssue.itemId.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Source Location <span className="text-rose-500">*</span>
                </label>
                <select
                  {...regIssue('locationId')}
                  disabled={isLoadingLocations}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="">-- Select Source Facility --</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errorsIssue.locationId && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsIssue.locationId.message as string}
                  </p>
                )}
                {selectedIssueItemId && selectedIssueLocId && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Available at this location:{' '}
                    <span className="font-bold text-gray-900">{issueLocationStock}</span>{' '}
                    {selectedIssueItem?.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity to Issue ({selectedIssueItem?.unit || 'units'}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  {...regIssue('quantity')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                {errorsIssue.quantity && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsIssue.quantity.message as string}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmittingIssue || issueMutation.isPending}
              className="mt-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmittingIssue || issueMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording Issue...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Record Stock Issue
                </>
              )}
            </Button>
          </form>
        )}

        {/* 3. TRANSFER FORM */}
        {activeTab === 'TRANSFER' && (
          <form onSubmit={handleTransferSubmit(onTransfer)} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-800 bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 mb-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs">
                Move inventory stock between warehouse locations. The source and destination must be distinct.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Item to Transfer <span className="text-rose-500">*</span>
              </label>
              <select
                {...regTransfer('itemId')}
                disabled={isLoadingItems}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Choose Item SKU / Name --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name}
                  </option>
                ))}
              </select>
              {errorsTransfer.itemId && (
                <p className="mt-1 text-xs text-rose-600">
                  {errorsTransfer.itemId.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Source Location (From) <span className="text-rose-500">*</span>
                </label>
                <select
                  {...regTransfer('sourceLocationId')}
                  disabled={isLoadingLocations}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- From Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errorsTransfer.sourceLocationId && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsTransfer.sourceLocationId.message as string}
                  </p>
                )}
                {selectedTransferItemId && selectedTransferSourceId && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Available at origin:{' '}
                    <span className="font-bold text-gray-900">{transferSourceStock}</span>{' '}
                    {selectedTransferItem?.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destination Location (To) <span className="text-rose-500">*</span>
                </label>
                <select
                  {...regTransfer('destinationLocationId')}
                  disabled={isLoadingLocations}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- To Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errorsTransfer.destinationLocationId && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsTransfer.destinationLocationId.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantity to Transfer ({selectedTransferItem?.unit || 'units'}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                {...regTransfer('quantity')}
                className="w-full sm:w-1/2 px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errorsTransfer.quantity && (
                <p className="mt-1 text-xs text-rose-600">
                  {errorsTransfer.quantity.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmittingTransfer || transferMutation.isPending}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmittingTransfer || transferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing Transfer...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Execute Stock Transfer
                </>
              )}
            </Button>
          </form>
        )}

        {/* 4. ADJUSTMENT FORM (MANAGER ONLY) */}
        {activeTab === 'ADJUSTMENT' && isManager && (
          <form onSubmit={handleAdjSubmit(onAdjustment)} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 mb-2">
              <Sliders className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs">
                Audit write-downs, corrections, or damage reconciliation. Requires explicit justification and cannot reduce stock below 0.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Item to Adjust <span className="text-rose-500">*</span>
              </label>
              <select
                {...regAdj('itemId')}
                disabled={isLoadingItems}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">-- Choose Item SKU / Name --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name}
                  </option>
                ))}
              </select>
              {errorsAdj.itemId && (
                <p className="mt-1 text-xs text-rose-600">{errorsAdj.itemId.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Location <span className="text-rose-500">*</span>
                </label>
                <select
                  {...regAdj('locationId')}
                  disabled={isLoadingLocations}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errorsAdj.locationId && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsAdj.locationId.message as string}
                  </p>
                )}
                {selectedAdjItemId && selectedAdjLocId && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Current stock at location:{' '}
                    <span className="font-bold text-gray-900">{adjLocationStock}</span>{' '}
                    {selectedAdjItem?.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adjustment Delta (Positive or Negative) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. -5 for write-down, 10 for found"
                  {...regAdj('quantity')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                {errorsAdj.quantity && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errorsAdj.quantity.message as string}
                  </p>
                )}
                {Number(selectedAdjQty) < 0 && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    ⚠️ Negative value will reduce on-hand stock by {Math.abs(Number(selectedAdjQty))} units.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for Adjustment <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Annual physical count variance, damaged packaging during handling..."
                {...regAdj('reason')}
                className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              />
              {errorsAdj.reason && (
                <p className="mt-1 text-xs text-rose-600">{errorsAdj.reason.message as string}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmittingAdj || adjustmentMutation.isPending}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmittingAdj || adjustmentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording Adjustment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Stock Adjustment
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
