'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught React error:', error, errorInfo)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-100 shadow-xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
              <p className="text-xs text-gray-500">
                An unexpected interface rendering error occurred in this section.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-50 rounded-xl text-left border border-gray-100 max-h-28 overflow-y-auto">
                <p className="text-[11px] font-mono text-rose-600 font-medium break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = '/dashboard')}
                className="border-gray-200 text-gray-700 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Button>

              <Button
                size="sm"
                onClick={this.handleReset}
                className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
