import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import type { User, RegisterForm, ApiResponse, AuthResponse } from '@/types/api'

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: ['users', 'list'] as const,
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: USER_QUERY_KEYS.list,
    queryFn: async () => {
      const res = await apiGet<{ data: User[] } | User[]>('/users')
      if (res && 'data' in res && Array.isArray(res.data)) {
        return res.data
      }
      return Array.isArray(res) ? res : []
    },
    staleTime: 60 * 1000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterForm) =>
      apiPost<ApiResponse<AuthResponse>>('/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all })
    },
  })
}

export function useAssignLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, locationId }: { userId: string; locationId: string }) =>
      apiPost(`/users/${userId}/locations`, { locationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

export function useRemoveLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, locationId }: { userId: string; locationId: string }) =>
      apiDelete(`/users/${userId}/locations/${locationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}
