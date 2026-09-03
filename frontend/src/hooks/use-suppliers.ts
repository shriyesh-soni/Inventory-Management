import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type { Supplier } from '@/types/api'

export interface SupplierPayload {
  name: string
  contact?: string
  email?: string
  phone?: string
}

export const SUPPLIER_QUERY_KEYS = {
  all: ['suppliers'] as const,
  list: ['suppliers', 'list'] as const,
}

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: SUPPLIER_QUERY_KEYS.list,
    queryFn: () => apiGet<Supplier[]>('/suppliers'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SupplierPayload) => apiPost<Supplier>('/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierPayload> }) =>
      apiPut<Supplier>(`/suppliers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
