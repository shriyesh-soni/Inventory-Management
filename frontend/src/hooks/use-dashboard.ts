import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type {
  DashboardStats,
  CategoryBreakdown,
  LocationBreakdown,
  MovementChartData,
} from '@/types/api'

export const DASHBOARD_QUERY_KEYS = {
  stats: ['dashboard', 'stats'] as const,
  stockByCategory: ['dashboard', 'stock-by-category'] as const,
  stockByLocation: ['dashboard', 'stock-by-location'] as const,
  movementChart: ['dashboard', 'movement-chart'] as const,
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_QUERY_KEYS.stats,
    queryFn: () => apiGet<DashboardStats>('/dashboard/stats'),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useStockByCategory() {
  return useQuery<CategoryBreakdown[]>({
    queryKey: DASHBOARD_QUERY_KEYS.stockByCategory,
    queryFn: () => apiGet<CategoryBreakdown[]>('/dashboard/stock-by-category'),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useStockByLocation() {
  return useQuery<LocationBreakdown[]>({
    queryKey: DASHBOARD_QUERY_KEYS.stockByLocation,
    queryFn: () => apiGet<LocationBreakdown[]>('/dashboard/stock-by-location'),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}

export function useMovementChart() {
  return useQuery<MovementChartData[]>({
    queryKey: DASHBOARD_QUERY_KEYS.movementChart,
    queryFn: () => apiGet<MovementChartData[]>('/dashboard/movement-chart'),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}
