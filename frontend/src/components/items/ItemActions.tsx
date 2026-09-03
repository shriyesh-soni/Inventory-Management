'use client'

import React, { useState } from 'react'
import { AlertTriangle, Archive, RotateCcw, Loader2 } from 'lucide-react'
import { useArchiveItem, useRestoreItem } from '@/hooks/use-items'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { Item } from '@/types/api'

interface ItemActionModalProps {
  item: Item | null
  action: 'archive' | 'restore' | null
  onClose: () => void
  onSuccess?: () => void
}

export function ItemActionModal({
  item,
  action,
  onClose,
  onSuccess,
}: ItemActionModalProps) {
  const { addToast } = useToast()
  const archiveMutation = useArchiveItem()
  const restoreMutation = useRestoreItem()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!item || !action) return null

  const isArchive = action === 'archive'

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      if (isArchive) {
        await archiveMutation.mutateAsync(item.id)
        addToast({
          title: 'Item Archived',
          description: `Item "${item.name}" has been archived.`,
          type: 'success',
        })
      } else {
        await restoreMutation.mutateAsync(item.id)
        addToast({
          title: 'Item Restored',
          description: `Item "${item.name}" has been restored to active inventory.`,
          type: 'success',
        })
      }
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Action failed'
      addToast({
        title: isArchive ? 'Failed to archive item' : 'Failed to restore item',
        description: errorMessage,
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isArchive ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isArchive ? (
              <Archive className="w-6 h-6" />
            ) : (
              <RotateCcw className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isArchive ? 'Archive Inventory Item' : 'Restore Item'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {isArchive
                ? `Are you sure you want to archive "${item.name}" (${item.sku})? It will be hidden from standard views and new stock movements will be restricted.`
                : `Restore "${item.name}" (${item.sku}) back to active status?`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={
              isArchive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : isArchive ? (
              'Archive Item'
            ) : (
              'Restore Item'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
