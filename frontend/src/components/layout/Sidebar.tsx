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
import { LogoMark } from '@/components/shared/Logo'

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
          className="p-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static
          left-0 top-0 h-screen
          w-[252px] bg-white
          overflow-y-auto overflow-x-hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 z-40' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r border-gray-200
        `}
      >
        {/* Header / Logo */}
        <div className="px-5 h-16 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <LogoMark size={32} />
          <div className="leading-none">
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">StockControl</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Inventory System</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item.href)
              const IconComponent = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center justify-between
                      px-3 py-2 rounded-lg text-[13px] font-medium
                      transition-all duration-150
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.label === 'Alerts' && alertCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-rose-500 rounded-full">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile + Logout */}
        <div className="border-t border-gray-100 px-3 py-3 mt-auto shrink-0">
          {user && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
