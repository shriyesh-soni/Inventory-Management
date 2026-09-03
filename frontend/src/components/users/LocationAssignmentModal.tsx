'use client'

import React, { useState } from 'react'
import { X, MapPin, Check, Loader2 } from 'lucide-react'
import { useLocations } from '@/hooks/use-locations'
import { useAssignLocation, useRemoveLocation } from '@/hooks/use-users'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import type { User, Location } from '@/types/api'

interface LocationAssignmentModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LocationAssignmentModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: LocationAssignmentModalProps) {
  const { addToast } = useToast()
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations()
  const assignMutation = useAssignLocation()
  const removeMutation = useRemoveLocation()
  const [loadingLocId, setLoadingLocId] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const assignedLocationIds = new Set(
    user.locationAssignments?.map((a) => a.locationId) || []
  )

  const handleToggle = async (location: Location) => {
    const isAssigned = assignedLocationIds.has(location.id)
    setLoadingLocId(location.id)

    try {
      if (isAssigned) {
        await removeMutation.mutateAsync({
          userId: user.id,
          locationId: location.id,
        })
        addToast({
          title: 'Location Removed',
          description: `Removed assignment to "${location.name}".`,
          type: 'success',
        })
      } else {
        await assignMutation.mutateAsync({
          userId: user.id,
          locationId: location.id,
        })
        addToast({
          title: 'Location Assigned',
          description: `Assigned "${location.name}" to ${user.name}.`,
          type: 'success',
        })
      }
      if (onSuccess) onSuccess()
    } catch (err: any) {
      addToast({
        title: 'Assignment Update Failed',
        description: err.response?.data?.message || err.message || 'Error updating assignment',
        type: 'error',
      })
    } finally {
      setLoadingLocId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Facility Access: {user.name}
              </h2>
              <p className="text-xs text-gray-500">
                Toggle warehouse locations this staff operator is authorized to manage
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

        {/* Locations List */}
        <div className="p-6 max-h-96 overflow-y-auto divide-y divide-gray-100">
          {isLoadingLocations ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              Loading available facilities...
            </div>
          ) : locations.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No warehouse locations defined in the system.
            </div>
          ) : (
            locations.map((loc) => {
              const isAssigned = assignedLocationIds.has(loc.id)
              const isPending = loadingLocId === loc.id

              return (
                <div
                  key={loc.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isAssigned
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {loc._count?.movements ?? 0} total movements
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isAssigned ? 'default' : 'outline'}
                    disabled={isPending}
                    onClick={() => handleToggle(loc)}
                    className={`text-xs min-w-[90px] ${
                      isAssigned
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAssigned ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Assigned
                      </span>
                    ) : (
                      'Assign'
                    )}
                  </Button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button onClick={onClose} className="bg-gray-900 text-white hover:bg-gray-800 text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
