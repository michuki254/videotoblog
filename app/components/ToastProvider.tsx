'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#ffffff',
          color: '#333333',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '0.375rem',
          padding: '0.75rem 1rem',
        },
        success: {
          style: {
            borderLeft: '4px solid #10B981',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid #EF4444',
          },
          duration: 6000,
        },
      }}
    />
  )
}
