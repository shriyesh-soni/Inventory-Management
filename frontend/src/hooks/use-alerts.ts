import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch } from '@/lib/api'
import type { LowStockAlert } from '@/types/api'

export interface AlertsResponse {
  data: LowStockAlert[]
  activeCount: number
}

export const ALERT_QUERY_KEYS = {
  all: ['alerts'] as const,
  list: ['alerts', 'list'] as const,
}

export function useAlerts() {
  return useQuery<AlertsResponse>({
    queryKey: ALERT_QUERY_KEYS.list,
    queryFn: () => apiGet<AlertsResponse>('/alerts'),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Polling every 60 seconds
  })
}

export function useDismissAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => apiPatch(`/alerts/${itemId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
