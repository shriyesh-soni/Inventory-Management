'use client'

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { TokenManager } from '@/lib/auth'
import type { ApiResponse, AuthResponse, User } from '@/types/api'

/**
 * Auth Context Value Interface
 * Provides authentication state and functions for the application
 * Validates: Requirements 4.1, 4.2, 4.3, 4.6
 */
export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

/**
 * Create the Auth Context
 * Initially undefined - will be set by AuthContextProvider
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Auth Context Provider Component
 * 
 * Manages authentication state and provides context to child components
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 13.4
 * 
 * Responsibilities:
 * - Initialize with null user and isLoading true
 * - Call `/auth/me` endpoint on mount to fetch current user
 * - Update state based on response
 * - Provide login function that calls POST `/auth/login`
 * - Provide logout function that clears tokens and resets state
 * - Expose data via useAuth hook
 */
export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch current user on mount
   * Requirement 4.1: Call `/auth/me` endpoint on mount to fetch current user
   * Requirement 13.4: Auth Context Provider SHALL load initial user state
   */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if we have an access token before attempting to fetch
        const token = TokenManager.getAccessToken()
        if (!token) {
          // No token available, set unauthenticated state
          setUser(null)
          setIsLoading(false)
          return
        }

        // Call GET /auth/me endpoint to fetch current user
        const response = await apiGet<ApiResponse<User>>('/auth/me')
        if (response.data) {
          setUser(response.data)
          setError(null)
        } else {
          setUser(null)
          setError('Failed to load user')
        }
      } catch (err) {
        // If /auth/me fails, user is not authenticated
        // This is expected when no valid token exists
        setUser(null)
        // Clear any invalid tokens
        TokenManager.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  /**
   * Login function
   * Requirement 4.2: Accept email and password parameters
   * Requirement 4.3: Call POST `/auth/login` endpoint
   * Requirement 4.2: Store tokens via Token Manager
   * Requirement 4.2: Update user state with response data
   * Validates: Requirements 2.1, 9.3, 9.4
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call POST /auth/login endpoint with email and password
      const response = await apiPost<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      })

      if (!response.data) {
        throw new Error('Invalid response format from login endpoint')
      }

      const { accessToken, refreshToken, user: userData } = response.data

      // Store tokens via Token Manager - Requirement 3.1
      TokenManager.setAccessToken(accessToken)
      TokenManager.setRefreshToken(refreshToken)

      // Update user state with response data - Requirement 4.2
      setUser(userData)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      setUser(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout function
   * Requirement 4.3: Clear tokens via Token Manager
   * Requirement 4.3: Reset user state to null
   */
  const logout = useCallback(() => {
    // Clear tokens via Token Manager - Requirement 3.5
    TokenManager.clearTokens()

    // Reset user state to null - Requirement 4.3
    setUser(null)
    setError(null)
  }, [])

  /**
   * Compute isAuthenticated from user state
   * Requirement: isAuthenticated should be true when user is not null
   */
  const isAuthenticated = user !== null

  /**
   * Memoize context value to prevent unnecessary re-renders
   * Requirement 4.4: Memoize to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      error,
      login,
      logout,
    }),
    [user, isLoading, isAuthenticated, error, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 * Requirement 4.4: Export hook that returns auth context value
 * Requirement 4.4: Throw error if used outside AuthContextProvider
 * Requirement 4.4: Memoize to prevent unnecessary re-renders
 * Validates: Requirement 4.6
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }

  return context
}
