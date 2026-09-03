'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useAlerts } from '@/hooks/use-alerts'
import {
  Home,
  Box,
  ArrowLeftRight,
  MapPin,
  Layers,
  AlertCircle,
  Users,
  Building2,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

export function Sidebar() {
  const { user, logout, isLoading } = useAuth()
  const { data: alertsData } = useAlerts()
  const alertCount = alertsData?.activeCount ?? 0
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Navigation menus
  const managerMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Items', href: '/items', icon: Box },
    { label: 'Movements', href: '/movements', icon: ArrowLeftRight },
    { label: 'Locations', href: '/locations', icon: MapPin },
    { label: 'Categories', href: '/categories', icon: Layers },
    { label: 'Suppliers', href: '/suppliers', icon: Building2 },
    { label: 'Alerts', href: '/alerts', icon: AlertCircle },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Import / Export', href: '/import-export', icon: FileSpreadsheet },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const staffMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Items', href: '/items', icon: Box },
    { label: 'Movements', href: '/movements', icon: ArrowLeftRight },
    { label: 'Locations', href: '/locations', icon: MapPin },
    { label: 'Alerts', href: '/alerts', icon: AlertCircle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const menuItems = user?.role === 'MANAGER' ? managerMenuItems : staffMenuItems

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 shadow-md"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static
          left-0 top-0 h-screen
          w-64 bg-gray-900 text-gray-100
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 z-40' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r border-gray-800
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">StockControl</h1>
              <p className="text-gray-400 text-xs">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href)
              const IconComponent = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-3.5 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${
                        active
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.label === 'Alerts' && alertCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold leading-none text-white bg-rose-600 rounded-full shadow-xs">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-800 px-4 py-4 mt-auto">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
