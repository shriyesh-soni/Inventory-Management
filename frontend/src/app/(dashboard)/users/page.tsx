'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { UserFormModal } from '@/components/users/UserFormModal'
import { LocationAssignmentModal } from '@/components/users/LocationAssignmentModal'
import { useUsers } from '@/hooks/use-users'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserPlus,
  Search,
  MapPin,
  Shield,
  UserCheck,
  Building,
} from 'lucide-react'
import { format } from 'date-fns'
import type { User } from '@/types/api'

function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedUserForLocations, setSelectedUserForLocations] = useState<User | null>(null)

  const { data: usersData, isLoading, refetch } = useUsers()
  const usersList: User[] = Array.isArray(usersData)
    ? usersData
    : (usersData as any)?.data && Array.isArray((usersData as any).data)
    ? (usersData as any).data
    : []

  const filteredUsers = usersList.filter((u: User) => {
    const term = searchTerm.toLowerCase()
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 inline-flex">
              <Users className="w-6 h-6" />
            </span>
            User & Access Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system users, administrator privileges, and warehouse facility assignments
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create User</span>
        </Button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">
                  User Details
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Role
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Assigned Warehouses
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Joined Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-gray-400">
                      <Users className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="font-semibold text-gray-700 text-base">No users found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try adjusting your search criteria or register a new team member.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUserMgr = u.role === 'MANAGER'
                  const assignments = u.locationAssignments || []

                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isUserMgr
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>

                      {/* Assigned Locations */}
                      <td className="px-6 py-4">
                        {isUserMgr ? (
                          <span className="text-xs text-gray-500 italic">
                            All Facilities (Global Manager)
                          </span>
                        ) : assignments.length === 0 ? (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                            No locations assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assignments.map((a) => (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                              >
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {a.location?.name || 'Facility'}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserForLocations(u)}
                          className="border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                        >
                          <Building className="w-3.5 h-3.5 text-gray-500" />
                          <span>Manage Access</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <UserFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Location Assignment Modal */}
      <LocationAssignmentModal
        user={selectedUserForLocations}
        isOpen={Boolean(selectedUserForLocations)}
        onClose={() => setSelectedUserForLocations(null)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <AuthGuard requiredRoles={['MANAGER']}>
      <MainLayout>
        <UsersContent />
      </MainLayout>
    </AuthGuard>
  )
}
