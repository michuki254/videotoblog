import { useCallback } from 'react'
import { analytics } from '@/lib/analytics'
import { errorMonitoring } from '@/lib/monitoring'

export function useAnalytics() {
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    analytics.trackEvent(action, category, label, value)
  }, [])

  const trackConversion = useCallback((type: 'signup' | 'subscribe' | 'video_convert') => {
    analytics.trackConversion(type)
  }, [])

  const trackTiming = useCallback((category: string, variable: string, value: number, label?: string) => {
    analytics.trackTiming(category, variable, value, label)
  }, [])

  const trackException = useCallback((error: Error | string, fatal: boolean = false) => {
    if (typeof error === 'string') {
      analytics.trackException(error, fatal)
      errorMonitoring.captureMessage(error, fatal ? 'error' : 'warning')
    } else {
      analytics.trackException(error.message, fatal)
      errorMonitoring.captureException(error)
    }
  }, [])

  const addBreadcrumb = useCallback((message: string, category?: string, data?: Record<string, any>) => {
    errorMonitoring.addBreadcrumb({
      message,
      category,
      data,
    })
  }, [])

  return {
    trackEvent,
    trackConversion,
    trackTiming,
    trackException,
    addBreadcrumb,
  }
}

// Hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now()
  const { trackTiming } = useAnalytics()

  const trackRenderTime = useCallback(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    trackTiming('Component Performance', 'render_time', renderTime, componentName)
  }, [componentName, startTime, trackTiming])

  return { trackRenderTime }
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const { trackEvent } = useAnalytics()

  const trackClick = useCallback((element: string, section: string) => {
    trackEvent('click', section, element)
  }, [trackEvent])

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submit', formName, success ? 'success' : 'failure')
  }, [trackEvent])

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search', 'site_search', query, resultsCount)
  }, [trackEvent])

  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
  }
}