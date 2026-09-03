'use client'

import { QueryClientProviderWrapper } from '@/lib/query-client'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
}