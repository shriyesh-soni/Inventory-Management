'use client'

import React, { useState } from 'react'
import { X, MapPin, Loader2 } from 'lucide-react'
import { useCreateLocation } from '@/hooks/use-locations'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface LocationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LocationFormModal({
  isOpen,
  onClose,
  onSuccess,
}: LocationFormModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { addToast } = useToast()
  const createMutation = useCreateLocation()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Location name is required')
      return
    }

    try {
      await createMutation.mutateAsync(name.trim())
      addToast({
        title: 'Location Created',
        description: `Facility "${name.trim()}" has been registered.`,
        type: 'success',
      })
      setName('')
      setError('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to create location'
      setError(errMsg)
      addToast({
        title: 'Failed to create location',
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
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Warehouse Location</h2>
              <p className="text-xs text-gray-500">Register a new storage or fulfillment hub</p>
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
            <label htmlFor="locName" className="block text-xs font-semibold text-gray-700 mb-1">
              Location Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="locName"
              type="text"
              placeholder="e.g. Main Distribution Center / Bay 4"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              disabled={createMutation.isPending}
              className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Location'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
