import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'
import { ITEM_QUERY_KEYS } from './use-items'
import { DASHBOARD_QUERY_KEYS } from './use-dashboard'
import type { StockMovement, PaginatedResponse } from '@/types/api'

export interface ReceiptPayload {
  itemId: string
  locationId: string
  quantity: number
}

export interface IssuePayload {
  itemId: string
  locationId: string
  quantity: number
}

export interface TransferPayload {
  itemId: string
  sourceLocationId: string
  destinationLocationId: string
  quantity: number
}

export interface AdjustmentPayload {
  itemId: string
  locationId: string
  quantity: number
  reason: string
}

export const MOVEMENT_QUERY_KEYS = {
  all: ['movements'] as const,
  itemMovements: (itemId: string, page = 1, limit = 10) =>
    ['movements', 'item', itemId, { page, limit }] as const,
}

export function useItemMovements(itemId: string, page = 1, limit = 25) {
  return useQuery<PaginatedResponse<StockMovement>>({
    queryKey: MOVEMENT_QUERY_KEYS.itemMovements(itemId, page, limit),
    queryFn: () =>
      apiGet<PaginatedResponse<StockMovement>>(
        `/items/${itemId}/movements?page=${page}&limit=${limit}`
      ),
    enabled: Boolean(itemId),
  })
}

export function useRecordReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReceiptPayload) =>
      apiPost<StockMovement>('/movements/receipt', data),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.movementChart })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByLocation })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByCategory })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_QUERY_KEYS.all })
    },
  })
}

export function useRecordIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IssuePayload) =>
      apiPost<StockMovement>('/movements/issue', data),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.movementChart })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByLocation })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByCategory })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_QUERY_KEYS.all })
    },
  })
}

export function useRecordTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransferPayload) =>
      apiPost<StockMovement>('/movements/transfer', data),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.movementChart })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByLocation })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByCategory })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_QUERY_KEYS.all })
    },
  })
}

export function useRecordAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdjustmentPayload) =>
      apiPost<StockMovement>('/movements/adjustment', data),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.movementChart })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByLocation })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stockByCategory })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_QUERY_KEYS.all })
    },
  })
}
