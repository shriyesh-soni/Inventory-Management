'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Create QueryClient with default options
 * - Stale time: 5 minutes (300000ms)
 * - Cache time: 10 minutes (600000ms)
 * - Retry strategy: exponential backoff, max 3 retries
 * - Base retry delay: 1000ms
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (300000ms)
      gcTime: 10 * 60 * 1000, // 10 minutes (600000ms)
      retry: 3, // Max 3 retries
      retryDelay: attemptIndex => 1000 * Math.pow(2, attemptIndex), // Exponential backoff: 1000ms, 2000ms, 4000ms
    },
  },
})

/**
 * QueryClientProvider wrapper component
 * Wraps the application with the QueryClient provider and includes DevTools in development
 */
export function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
