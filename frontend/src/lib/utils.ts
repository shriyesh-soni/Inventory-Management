import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date, pattern: string = "MMM d, yyyy") {
  return format(new Date(date), pattern)
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a")
}

export function formatTimeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Stock level utility
export function getStockLevelStatus(onHand: number, reorderLevel: number): 'good' | 'low' | 'critical' {
  if (onHand <= 0) return 'critical'
  if (onHand <= reorderLevel) return 'low'
  return 'good'
}

// Movement type color helpers
export function getMovementTypeColor(kind: string) {
  const colors = {
    'RECEIPT': 'success',
    'ISSUE': 'destructive', 
    'TRANSFER': 'primary',
    'ADJUSTMENT': 'warning'
  }
  return colors[kind as keyof typeof colors] || 'muted'
}

// Role helpers
export function isManager(role: string) {
  return role === 'MANAGER'
}

export function canManageItems(role: string) {
  return role === 'MANAGER'
}

export function canRecordMovements(role: string) {
  return role === 'MANAGER' || role === 'STAFF'
}

// Number formatting
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}