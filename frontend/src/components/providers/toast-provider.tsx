'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 11)
      const newToast = { ...toast, id }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      const duration = toast.duration ?? 5000
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 ${
            toast.type === 'success'
              ? 'border-success bg-success/5'
              : toast.type === 'error'
              ? 'border-destructive bg-destructive/5'
              : toast.type === 'warning'
              ? 'border-warning bg-warning/5'
              : 'border-border bg-background'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-1">
              {toast.title && (
                <h4 className="text-sm font-semibold text-foreground">
                  {toast.title}
                </h4>
              )}
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-3 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}