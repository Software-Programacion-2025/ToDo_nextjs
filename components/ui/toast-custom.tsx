"use client"

import { useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg ${getBackgroundColor()}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-auto p-1 h-6 w-6"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Hook para manejar toasts
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000) // Auto-close after 5 seconds
  }

  const hideToast = () => setToast(null)

  return {
    toast,
    showToast,
    hideToast,
  }
}