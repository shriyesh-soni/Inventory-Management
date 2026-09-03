import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'
import type { Location, Item } from '@/types/api'

export const LOCATION_QUERY_KEYS = {
  all: ['locations'] as const,
  list: ['locations', 'list'] as const,
  stock: (id: string) => ['locations', 'stock', id] as const,
}

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: LOCATION_QUERY_KEYS.list,
    queryFn: () => apiGet<Location[]>('/locations'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLocationStock(locationId: string) {
  return useQuery<Item[]>({
    queryKey: LOCATION_QUERY_KEYS.stock(locationId),
    queryFn: () => apiGet<Item[]>(`/locations/${locationId}/stock`),
    enabled: Boolean(locationId),
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => apiPost<Location>('/locations', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
