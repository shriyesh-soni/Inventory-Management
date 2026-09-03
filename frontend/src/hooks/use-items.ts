import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiPatch } from '@/lib/api'
import type {
  Item,
  Category,
  Location,
  Supplier,
  PaginatedResponse,
  ItemsQueryParams,
  ItemForm,
  TimelineEntry,
  StockMovement,
} from '@/types/api'

export const ITEM_QUERY_KEYS = {
  all: ['items'] as const,
  list: (params?: ItemsQueryParams) => ['items', 'list', params] as const,
  detail: (id: string) => ['items', 'detail', id] as const,
  timeline: (id: string) => ['items', 'timeline', id] as const,
  movements: (id: string, page?: number, limit?: number) =>
    ['items', 'movements', id, { page, limit }] as const,
  categories: ['categories'] as const,
  locations: ['locations'] as const,
  suppliers: ['suppliers'] as const,
}

export function useItems(params?: ItemsQueryParams) {
  return useQuery<PaginatedResponse<Item>>({
    queryKey: ITEM_QUERY_KEYS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
      if (params?.locationId) searchParams.append('locationId', params.locationId)
      if (params?.archived) searchParams.append('archived', params.archived)
      if (params?.belowReorder) searchParams.append('belowReorder', params.belowReorder)
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const queryStr = searchParams.toString()
      const url = `/items${queryStr ? `?${queryStr}` : ''}`
      return apiGet<PaginatedResponse<Item>>(url)
    },
    staleTime: 60 * 1000,
  })
}

export function useItem(id: string) {
  return useQuery<Item>({
    queryKey: ITEM_QUERY_KEYS.detail(id),
    queryFn: () => apiGet<Item>(`/items/${id}`),
    enabled: Boolean(id),
  })
}

export function useItemTimeline(id: string) {
  return useQuery<TimelineEntry[]>({
    queryKey: ITEM_QUERY_KEYS.timeline(id),
    queryFn: () => apiGet<TimelineEntry[]>(`/items/${id}/timeline`),
    enabled: Boolean(id),
  })
}

export function useItemMovements(id: string, page = 1, limit = 5) {
  return useQuery<PaginatedResponse<StockMovement>>({
    queryKey: ITEM_QUERY_KEYS.movements(id, page, limit),
    queryFn: () => apiGet<PaginatedResponse<StockMovement>>(`/items/${id}/movements?page=${page}&limit=${limit}`),
    enabled: Boolean(id),
  })
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ITEM_QUERY_KEYS.categories,
    queryFn: () => apiGet<Category[]>('/categories'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ITEM_QUERY_KEYS.locations,
    queryFn: () => apiGet<Location[]>('/locations'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ITEM_QUERY_KEYS.suppliers,
    queryFn: () => apiGet<Supplier[]>('/suppliers'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ItemForm) => apiPost<Item>('/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemForm> }) =>
      apiPut<Item>(`/items/${id}`, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.detail(updatedItem.id) })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.timeline(updatedItem.id) })
    },
  })
}

export function useArchiveItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiPatch<Item>(`/items/${id}/archive`),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.detail(item.id) })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.timeline(item.id) })
    },
  })
}

export function useRestoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiPatch<Item>(`/items/${id}/restore`),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.detail(item.id) })
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.timeline(item.id) })
    },
  })
}

export function useAddItemNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiPost(`/items/${id}/notes`, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.timeline(variables.id) })
    },
  })
}
