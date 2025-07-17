'use client'

import React, { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { analytics } from '@/lib/analytics'
import { errorMonitoring } from '@/lib/monitoring'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useUser()

  // Initialize analytics and monitoring
  useEffect(() => {
    const init = async () => {
      await analytics.initialize()
      await errorMonitoring.initialize()
    }
    init()
  }, [])

  // Track page views
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    analytics.trackPageView(url)
  }, [pathname, searchParams])

  // Set user context when user changes
  useEffect(() => {
    if (user) {
      // Set user for analytics
      analytics.setUserProperties({
        user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        created_at: user.createdAt,
      })

      // Set user for error monitoring
      errorMonitoring.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || undefined,
      })
    } else {
      errorMonitoring.clearUser()
    }
  }, [user])

  return <>{children}</>
}

// Error boundary for catching React errors
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Report to error monitoring
    errorMonitoring.captureException(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. The error has been reported.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}