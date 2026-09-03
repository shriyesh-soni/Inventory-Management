'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { useCreateItem, useUpdateItem, useCategories, useSuppliers } from '@/hooks/use-items'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { Item } from '@/types/api'

const itemFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long').trim(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 chars max').trim(),
  description: z.string().max(500, 'Description must be 500 chars max').optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required (e.g. pcs, kg, box)').max(20).trim(),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level must be >= 0'),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().optional().or(z.literal('')),
})

export type ItemFormData = z.infer<typeof itemFormSchema>

interface ItemFormProps {
  isOpen: boolean
  onClose: () => void
  initialItem?: Item | null
  onSuccess?: () => void
}

export function ItemForm({ isOpen, onClose, initialItem, onSuccess }: ItemFormProps) {
  const { addToast } = useToast()
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers()

  const createItemMutation = useCreateItem()
  const updateItemMutation = useUpdateItem()

  const isEditing = Boolean(initialItem?.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      unit: 'pcs',
      reorderLevel: 10,
      categoryId: '',
      supplierId: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        reset({
          sku: initialItem.sku,
          name: initialItem.name,
          description: initialItem.description || '',
          unit: initialItem.unit,
          reorderLevel: initialItem.reorderLevel ?? 0,
          categoryId: initialItem.categoryId,
          supplierId: initialItem.supplierId || '',
        })
      } else {
        reset({
          sku: '',
          name: '',
          description: '',
          unit: 'pcs',
          reorderLevel: 10,
          categoryId: categories[0]?.id || '',
          supplierId: '',
        })
      }
    }
  }, [isOpen, initialItem, reset, categories])

  if (!isOpen) return null

  const onSubmit = async (data: ItemFormData) => {
    try {
      const payload = {
        sku: data.sku,
        name: data.name,
        description: data.description || undefined,
        unit: data.unit,
        reorderLevel: Number(data.reorderLevel),
        categoryId: data.categoryId,
        supplierId: data.supplierId || undefined,
      }

      if (isEditing && initialItem) {
        await updateItemMutation.mutateAsync({
          id: initialItem.id,
          data: payload,
        })
        addToast({
          title: 'Item Updated',
          description: `Item "${data.name}" has been successfully updated.`,
          type: 'success',
        })
      } else {
        await createItemMutation.mutateAsync(payload)
        addToast({
          title: 'Item Created',
          description: `Item "${data.name}" has been created.`,
          type: 'success',
        })
      }

      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : err.message || 'Operation failed')

      addToast({
        title: isEditing ? 'Failed to update item' : 'Failed to create item',
        description: errorMessage,
        type: 'error',
      })
    }
  }

  const isPending = isSubmitting || createItemMutation.isPending || updateItemMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Edit Inventory Item' : 'Create New Item'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? 'Update specifications, category and replenishment levels'
                : 'Add a new tracked SKU to your stock catalog'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-xs font-semibold text-gray-700 mb-1">
                SKU / Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="sku"
                type="text"
                placeholder="e.g. SKU-1001"
                disabled={isPending}
                {...register('sku')}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              {errors.sku && (
                <p className="mt-1 text-xs text-rose-600">{errors.sku.message}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-xs font-semibold text-gray-700 mb-1">
                Unit of Measure <span className="text-rose-500">*</span>
              </label>
              <input
                id="unit"
                type="text"
                placeholder="e.g. pcs, kg, box"
                disabled={isPending}
                {...register('unit')}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              {errors.unit && (
                <p className="mt-1 text-xs text-rose-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Industrial Hydraulic Filter"
              disabled={isPending}
              {...register('name')}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Category & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-xs font-semibold text-gray-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="categoryId"
                disabled={isPending || isLoadingCategories}
                {...register('categoryId')}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-rose-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <label htmlFor="supplierId" className="block text-xs font-semibold text-gray-700 mb-1">
                Supplier (Optional)
              </label>
              <select
                id="supplierId"
                disabled={isPending || isLoadingSuppliers}
                {...register('supplierId')}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">No Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reorder Level */}
          <div>
            <label htmlFor="reorderLevel" className="block text-xs font-semibold text-gray-700 mb-1">
              Reorder Threshold Level <span className="text-rose-500">*</span>
            </label>
            <input
              id="reorderLevel"
              type="number"
              min="0"
              placeholder="10"
              disabled={isPending}
              {...register('reorderLevel')}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Low-stock alert will trigger whenever available total on-hand drops to or below this number.
            </p>
            {errors.reorderLevel && (
              <p className="mt-1 text-xs text-rose-600">{errors.reorderLevel.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Additional SKU technical specifications, bin placement notes, etc."
              disabled={isPending}
              {...register('description')}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Item'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
