import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import type { ApiResponse, ApiError } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 * Note: Token Manager logic will be implemented in lib/auth.ts (Task 3)
 * For now, we define the interface that the interceptors will use
 */
interface ITokenManager {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setAccessToken(token: string): void
  setRefreshToken(token: string): void
  clearTokens(): void
  refreshAccessToken(): Promise<string>
}

/**
 * Queue for pending requests during token refresh
 * Prevents race conditions when multiple requests receive 401 errors
 * Validates: Requirement 14.5 - Queued 401 Requests During Refresh
 */
class RefreshTokenQueue {
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (err: any) => void
  }> = []

  isProcessing(): boolean {
    return this.isRefreshing
  }

  startRefresh(): void {
    this.isRefreshing = true
  }

  endRefresh(): void {
    this.isRefreshing = false
  }

  /**
   * Add a request to the queue
   */
  addToQueue(
    resolve: (token: string) => void,
    reject: (err: any) => void
  ): void {
    this.failedQueue.push({ resolve, reject })
  }

  /**
   * Process all queued requests
   * Called when token refresh succeeds
   */
  processQueue(token: string): void {
    this.failedQueue.forEach(({ resolve }) => {
      resolve(token)
    })
    this.failedQueue = []
  }

  /**
   * Reject all queued requests
   * Called when token refresh fails
   */
  rejectQueue(error: any): void {
    this.failedQueue.forEach(({ reject }) => {
      reject(error)
    })
    this.failedQueue = []
  }
}

/**
 * Placeholder Token Manager
 * This will be replaced with the actual Token Manager from lib/auth.ts (Task 3)
 * It's defined here to show the interface the interceptors expect
 */
let tokenManager: ITokenManager | null = null

/**
 * Set the Token Manager instance
 * Called from auth.ts after Token Manager is initialized
 */
export function setTokenManager(manager: ITokenManager): void {
  tokenManager = manager
}

/**
 * Create and configure Axios instance with request/response interceptors
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const refreshQueue = new RefreshTokenQueue()

  /**
   * Request Interceptor: Add Authorization Header
   * Validates: Requirement 2.1 - Authorization Header Inclusion
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (tokenManager) {
        const token = tokenManager.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  /**
   * Response Interceptor: Handle 401 Errors and Token Refresh
   * Validates: Requirements 2.2, 2.3, 2.4, 14.1, 14.5
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      // Handle 401 errors
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (!refreshQueue.isProcessing()) {
          originalRequest._retry = true
          refreshQueue.startRefresh()

          try {
            // Attempt token refresh
            if (tokenManager) {
              const newToken = await tokenManager.refreshAccessToken()

              // Token refresh succeeded - Requirement 2.3, 14.4
              // Update the authorization header with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`

              // Process queued requests
              refreshQueue.processQueue(newToken)
              refreshQueue.endRefresh()

              // Retry original request with new token
              return instance(originalRequest)
            }
          } catch (refreshError) {
            // Token refresh failed - Requirement 2.4, 14.3
            refreshQueue.rejectQueue(refreshError)
            refreshQueue.endRefresh()

            // Clear tokens and redirect to login
            if (tokenManager) {
              tokenManager.clearTokens()
            }

            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }

            return Promise.reject(refreshError)
          }
        } else {
          // Token refresh is in progress - queue this request
          return new Promise((resolve, reject) => {
            refreshQueue.addToQueue(
              (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(instance(originalRequest))
              },
              (err: any) => {
                reject(err)
              }
            )
          })
        }
      }

      // Pass through all errors without modification - Requirement 2.5
      return Promise.reject(error)
    }
  )

  return instance
}

// Create the Axios instance
const axiosInstance = createAxiosInstance()

/**
 * Typed API wrapper functions - Requirement 2.6
 * Export apiGet, apiPost, apiPut, apiDelete, apiPatch for use in components
 * All wrapper functions pass errors through without modification
 */

/**
 * GET request wrapper
 * @param url - Endpoint URL
 * @param config - Optional Axios config
 * @returns Promise with typed response data
 */
export async function apiGet<T = any>(
  url: string,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.get<T>(url, config)
    return response.data
  } catch (error) {
    // Pass error through without modification
    throw error
  }
}

/**
 * POST request wrapper
 * @param url - Endpoint URL
 * @param data - Request body data
 * @param config - Optional Axios config
 * @returns Promise with typed response data
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.post<T>(url, data, config)
    return response.data
  } catch (error) {
    // Pass error through without modification
    throw error
  }
}

/**
 * PUT request wrapper
 * @param url - Endpoint URL
 * @param data - Request body data
 * @param config - Optional Axios config
 * @returns Promise with typed response data
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.put<T>(url, data, config)
    return response.data
  } catch (error) {
    // Pass error through without modification
    throw error
  }
}

/**
 * PATCH request wrapper
 * @param url - Endpoint URL
 * @param data - Request body data
 * @param config - Optional Axios config
 * @returns Promise with typed response data
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.patch<T>(url, data, config)
    return response.data
  } catch (error) {
    // Pass error through without modification
    throw error
  }
}

/**
 * DELETE request wrapper
 * @param url - Endpoint URL
 * @param config - Optional Axios config
 * @returns Promise with typed response data
 */
export async function apiDelete<T = any>(
  url: string,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.delete<T>(url, config)
    return response.data
  } catch (error) {
    // Pass error through without modification
    throw error
  }
}

/**
 * Export the Axios instance for direct use if needed
 */
export { axiosInstance }

/**
 * Export token queue for testing and debugging
 */
export { RefreshTokenQueue }

/**
 * Export token manager interface for type safety
 */
export type { ITokenManager }
