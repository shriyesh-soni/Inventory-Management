'use client'

import React, { useState, useEffect } from 'react'
import { X, Layers, Loader2 } from 'lucide-react'
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/api'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: Category | null
  onSuccess?: () => void
}

export function CategoryFormModal({
  isOpen,
  onClose,
  initialCategory,
  onSuccess,
}: CategoryFormModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const isEditing = Boolean(initialCategory?.id)

  useEffect(() => {
    if (isOpen) {
      setName(initialCategory?.name || '')
      setError('')
    }
  }, [isOpen, initialCategory])

  if (!isOpen) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      if (isEditing && initialCategory) {
        await updateMutation.mutateAsync({
          id: initialCategory.id,
          name: name.trim(),
        })
        addToast({
          title: 'Category Updated',
          description: `Category has been renamed to "${name.trim()}".`,
          type: 'success',
        })
      } else {
        await createMutation.mutateAsync(name.trim())
        addToast({
          title: 'Category Created',
          description: `Category "${name.trim()}" has been created.`,
          type: 'success',
        })
      }

      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || 'Operation failed'
      setError(errMsg)
      addToast({
        title: isEditing ? 'Failed to update category' : 'Failed to create category',
        description: errMsg,
        type: 'error',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEditing ? 'Edit Category' : 'Create Product Category'}
              </h2>
              <p className="text-xs text-gray-500">
                Organize inventory SKUs under unified departments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="catName" className="block text-xs font-semibold text-gray-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="catName"
              type="text"
              placeholder="e.g. Mechanical Components / Electrical / Raw Materials"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              disabled={isPending}
              className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
