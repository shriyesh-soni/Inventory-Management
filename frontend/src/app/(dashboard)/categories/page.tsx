'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { CategoryFormModal } from '@/components/categories/CategoryFormModal'
import { useCategories, useDeleteCategory } from '@/hooks/use-categories'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Box,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Category } from '@/types/api'

function CategoriesContent() {
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: categories = [], isLoading, refetch } = useCategories()
  const deleteMutation = useDeleteCategory()

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return

    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
      addToast({
        title: 'Category Deleted',
        description: `Category "${deletingCategory.name}" has been removed.`,
        type: 'success',
      })
      setDeletingCategory(null)
      refetch()
    } catch (err: any) {
      addToast({
        title: 'Failed to delete category',
        description:
          err.response?.data?.message ||
          err.message ||
          'Category could not be deleted',
        type: 'error',
      })
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 inline-flex">
              <Layers className="w-6 h-6" />
            </span>
            Product Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Group catalog SKUs into departments and product classifications
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">
                  Category Name
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  Items Assigned
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 text-sm">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-400">
                      <Layers className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-700 text-base">No categories found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {searchTerm
                          ? 'No categories match your search.'
                          : 'Create your first product category to organize inventory items.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const itemCount = c._count?.items ?? 0

                  return (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-500" />
                          <span>{c.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <Box className="w-3 h-3 text-gray-500" />
                          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleEdit(c)}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setDeletingCategory(c)}
                            className="text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialCategory={editingCategory}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Category</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Are you sure you want to delete category &quot;{deletingCategory.name}&quot;?
                  {(deletingCategory._count?.items ?? 0) > 0 && (
                    <span className="block font-semibold text-rose-600 mt-1">
                      Warning: This category currently has {deletingCategory._count?.items} associated items and cannot be deleted until all items are reassigned.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={deleteMutation.isPending}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={
                  (deletingCategory._count?.items ?? 0) > 0 || deleteMutation.isPending
                }
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Category'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <AuthGuard requiredRoles={['MANAGER']}>
      <MainLayout>
        <CategoriesContent />
      </MainLayout>
    </AuthGuard>
  )
}
