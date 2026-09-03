import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, axiosInstance } from '@/lib/api'
import { ITEM_QUERY_KEYS } from './use-items'
import { DASHBOARD_QUERY_KEYS } from './use-dashboard'
import { LOCATION_QUERY_KEYS } from './use-locations'
import type { ImportResult } from '@/types/api'

export function useImportItems() {
  const queryClient = useQueryClient()

  return useMutation<ImportResult, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post<ImportResult>('/import/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useImportReceipts() {
  const queryClient = useQueryClient()

  return useMutation<ImportResult, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post<ImportResult>('/import/receipts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.movementChart })
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
    },
  })
}

export async function downloadStockExport() {
  const response = await axiosInstance.get('/export/stock', {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `stock-export-${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
