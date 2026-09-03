'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

/**
 * AuthGuard Component - Protected Route Wrapper
 * 
 * Protects routes from unauthenticated access and enforces role-based access control
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Props:
 * - children: ReactNode - Content to render if authenticated and authorized
 * - requiredRoles: ('MANAGER' | 'STAFF')[] (optional) - Roles allowed to access this route
 * 
 * Behavior:
 * - If no requiredRoles specified, requires authentication only
 * - If requiredRoles specified, requires authentication AND one of the specified roles
 * - Displays loading state while useAuth hook is initializing
 * - Redirects unauthenticated users to /auth/login
 * - Redirects unauthorized users (wrong role) to /dashboard
 * - Renders children if authenticated and authorized
 */
export interface AuthGuardProps {
  children: ReactNode
  requiredRoles?: ('MANAGER' | 'STAFF')[]
}

export function AuthGuard({
  children,
  requiredRoles,
}: AuthGuardProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  /**
   * Sub-task 8.2: Implement redirection for unauthenticated users
   * - If isAuthenticated is false, redirect to /login
   * Validates: Requirement 5.1
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  /**
   * Sub-task 8.3: Implement role-based access control
   * - Accept optional requiredRoles prop
   * - If requiredRoles specified, check user.role is in array
   * - If user lacks required role, redirect to /dashboard
   * Validates: Requirements 5.2, 5.5
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && requiredRoles) {
      // Check if user has required role
      const hasRequiredRole = requiredRoles.includes(user.role)

      if (!hasRequiredRole) {
        // User lacks required role, redirect to dashboard
        router.push('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, router])

  /**
   * Display loading spinner while isLoading
   * Validates: Requirements 5.1, 5.4
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  /**
   * Sub-task 8.4: Implement authorized content rendering
   * - If authenticated and authorized, render children
   * Validates: Requirement 5.3
   */
  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles && user) {
    const hasRequiredRole = requiredRoles.includes(user.role)
    if (!hasRequiredRole) {
      return null
    }
  }

  return <>{children}</>
}
