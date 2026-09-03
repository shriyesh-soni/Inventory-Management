'use client'

import { apiPost } from './api'
import type { ApiResponse } from '@/types/api'

export interface User {
  id: string
  email: string
  name: string
  role: 'MANAGER' | 'STAFF'
  createdAt: string
  updatedAt: string
  locationAssignments?: Array<{
    id: string
    locationId: string
    assignedAt: string
    location: {
      id: string
      name: string
    }
  }>
}

/**
 * TokenManager: Handles token storage, retrieval, and refresh
 * Implements: ITokenManager interface from lib/api.ts
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * Provides:
 * - localStorage-based token persistence for both access and refresh tokens
 * - Token retrieval with null-safe handling
 * - Token refresh via /auth/refresh endpoint
 * - Token clearing on logout
 * - SSR-safe implementation with typeof window check
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token'
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token'

  /**
   * Get the stored access token from localStorage
   * Requirement 3.2: Return null if token does not exist
   * Requirement 3.4: Must be null-safe
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    const token = localStorage.getItem(TokenManager.ACCESS_TOKEN_KEY)
    return token || null
  }

  /**
   * Get the stored refresh token from localStorage
   * Requirement 3.2: Return null if token does not exist
   * Requirement 3.4: Must be null-safe
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    const token = localStorage.getItem(TokenManager.REFRESH_TOKEN_KEY)
    return token || null
  }

  /**
   * Store access token in localStorage
   * Requirement 3.1: Store with key 'auth_access_token'
   */
  static setAccessToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, token)
  }

  /**
   * Store refresh token in localStorage
   * Requirement 3.1: Store with key 'auth_refresh_token'
   */
  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, token)
  }

  /**
   * Clear all tokens from localStorage on logout
   * Requirement 3.5: Clear both access and refresh tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') {
      return
    }
    localStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY)
    localStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY)
  }

  /**
   * Refresh the access token by calling the /auth/refresh endpoint
   * Requirement 3.3: Call POST /auth/refresh to obtain new access token
   * Requirement 3.3: Update stored token on success
   * Validates: Requirements 2.2, 2.3, 14.1, 14.2
   */
  static async refreshAccessToken(): Promise<string> {
    try {
      const response = await apiPost<ApiResponse<{ accessToken: string }>>(
        '/auth/refresh'
      )

      // Extract the new access token from response
      const newAccessToken = response.data.accessToken

      // Update stored token on success - Requirement 3.3
      TokenManager.setAccessToken(newAccessToken)

      return newAccessToken
    } catch (error) {
      // If refresh fails, error will be caught by API client interceptor
      // which will handle clearing tokens and redirect to login
      throw error
    }
  }
}

export class AuthService {
  private static readonly TOKEN_KEY = 'accessToken'
  private static readonly USER_KEY = 'user'

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AuthService.TOKEN_KEY)
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AuthService.TOKEN_KEY, token)
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.TOKEN_KEY)
    }
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userJson = localStorage.getItem(AuthService.USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user))
    }
  }

  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.USER_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return !!AuthService.getToken() && !!AuthService.getUser()
  }

  static isManager(): boolean {
    const user = AuthService.getUser()
    return user?.role === 'MANAGER'
  }

  static isStaff(): boolean {
    const user = AuthService.getUser()
    return user?.role === 'STAFF'
  }

  static canManageItems(): boolean {
    return AuthService.isManager()
  }

  static canManageUsers(): boolean {
    return AuthService.isManager()
  }

  static canRecordMovements(): boolean {
    return AuthService.isAuthenticated() // Both manager and staff can record movements
  }

  static canAccessLocation(locationId: string): boolean {
    const user = AuthService.getUser()
    if (!user) return false
    
    // Managers can access all locations
    if (user.role === 'MANAGER') return true
    
    // Staff can only access assigned locations
    return user.locationAssignments?.some(assignment => 
      assignment.locationId === locationId
    ) ?? false
  }

  static getAssignedLocationIds(): string[] {
    const user = AuthService.getUser()
    if (!user || user.role === 'MANAGER') return []
    
    return user.locationAssignments?.map(assignment => assignment.locationId) ?? []
  }

  static logout(): void {
    AuthService.removeToken()
    AuthService.removeUser()
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}

/**
 * Register TokenManager with API client
 * This enables the API interceptors to use the TokenManager for:
 * - Adding Authorization headers to requests (Requirement 2.1)
 * - Refreshing tokens on 401 errors (Requirement 2.2, 2.3, 2.4)
 * 
 * Must be called after both TokenManager and api client are loaded
 * This happens automatically when this module is imported
 */
if (typeof window !== 'undefined') {
  // Lazy import to avoid circular dependencies
  // The import happens at module load time
  try {
    import('./api').then(({ setTokenManager }) => {
      setTokenManager({
        getAccessToken: () => TokenManager.getAccessToken(),
        getRefreshToken: () => TokenManager.getRefreshToken(),
        setAccessToken: (token: string) => TokenManager.setAccessToken(token),
        setRefreshToken: (token: string) => TokenManager.setRefreshToken(token),
        clearTokens: () => TokenManager.clearTokens(),
        refreshAccessToken: () => TokenManager.refreshAccessToken(),
      })
    })
  } catch (error) {
    // Silently fail if API module is not available
    // This can happen in test environments or edge cases
    console.debug('Failed to register TokenManager with API client', error)
  }
}