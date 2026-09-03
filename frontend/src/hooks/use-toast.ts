'use client'

/**
 * Re-export useToast hook from toast-provider
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4
 * 
 * The useToast hook provides:
 * - addToast(toast) function to display toast notifications
 * - removeToast(id) function to remove specific toasts
 * - toasts array for accessing current toasts
 * - Auto-dismiss after 5 seconds (configurable duration)
 */
export { useToast } from '@/components/providers/toast-provider'
