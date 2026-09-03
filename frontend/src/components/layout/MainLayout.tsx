'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from './Sidebar'
import { ChevronRight, Home } from 'lucide-react'

/**
 * MainLayout Component
 * 
 * Provides responsive grid layout with sidebar, breadcrumbs, and main content area
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 17, 18
 * 
 * Features:
 * - Responsive grid layout (sidebar + content)
 * - Breadcrumb navigation based on current route
 * - Children rendering in main content area
 * - Desktop (≥1024px): Sidebar always visible
 * - Tablet (768-1023px): Sidebar collapsible
 * - Mobile (<768px): Sidebar hidden by default, overlay when open
 */

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Generate breadcrumb items from current pathname
 * 
 * Sub-task 10.2: Breadcrumb path generation
 * Requirement 7.2, 18: Parse current route path and generate breadcrumb hierarchy
 * 
 * @param pathname - Current route path
 * @returns Array of breadcrumb items with label and href
 */
function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  // Split path into segments and filter empty ones
  const segments = pathname.split('/').filter(Boolean)
  
  // Start with home breadcrumb
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Dashboard', href: '/dashboard' }
  ]

  // Build breadcrumbs from path segments
  let currentPath = ''
  segments.forEach((segment) => {
    // Skip auth and dashboard root segment
    if (segment === 'auth' || segment === 'dashboard') {
      return
    }

    currentPath += `/${segment}`
    
    // Convert kebab-case to Title Case
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      label,
      href: currentPath
    })
  })

  return breadcrumbs
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  /**
   * Sub-task 10.2: Breadcrumb navigation
   * Parse current route path
   * Generate breadcrumb hierarchy
   * Display breadcrumbs above content
   * Requirement 7.2, 18: Generate breadcrumbs from current route
   */
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sub-task 10.1: Responsive grid layout */}
      {/* Sidebar - visible on desktop, collapsible on tablet, hidden on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb Navigation */}
        {/* Sub-task 10.2: Implement breadcrumb navigation */}
        <nav
          className="bg-white border-b border-gray-200 px-6 py-4"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <li key={crumb.href} className="flex items-center">
                  {/* Breadcrumb separator */}
                  {index > 0 && (
                    <ChevronRight
                      size={16}
                      className="text-gray-400 mx-2"
                      aria-hidden="true"
                    />
                  )}

                  {/* Breadcrumb link or text */}
                  {isLast ? (
                    // Current page - not a link
                    <span className="text-gray-700 font-medium">
                      {crumb.label}
                    </span>
                  ) : (
                    // Navigable breadcrumb
                    <Link
                      href={crumb.href}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Main Content Area */}
        {/* Sub-task 10.3: Children rendering in content area
            Accept children prop
            Render in main area
            Requirement 7.3, 17: Accept children and render in main content area
        */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
