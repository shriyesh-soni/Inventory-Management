'use client'

/**
 * Re-export useAuth hook from auth-provider
 * Validates: Requirements 4.4, 4.6
 * 
 * The useAuth hook provides:
 * - Access to current authentication state (user, isLoading, isAuthenticated, error)
 * - login(email, password) function to authenticate user
 * - logout() function to clear authentication
 * - Must be used within an AuthContextProvider
 * - Throws error if used outside provider
 * - Memoized to prevent unnecessary re-renders
 */
export { useAuth } from '@/components/providers/auth-provider'
export type { AuthContextValue } from '@/components/providers/auth-provider'