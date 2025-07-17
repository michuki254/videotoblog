import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Generate or get session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

export function usePageTracking(postId?: string | null) {
  const pathname = usePathname()
  const startTime = useRef<number>(Date.now())
  const tracked = useRef(false)

  useEffect(() => {
    // Only track if we have a valid postId
    if (!postId || typeof postId !== 'string' || tracked.current) return

    const sessionId = getSessionId()
    startTime.current = Date.now()
    tracked.current = true

    // Track page view on mount
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            sessionId,
            duration: 0,
            converted: false,
          }),
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackPageView()

    // Track duration on unmount
    return () => {
      if (!postId || typeof postId !== 'string') return
      
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      
      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          postId,
          sessionId,
          duration,
          converted: false,
        })
        navigator.sendBeacon('/api/analytics/track', data)
      }
    }
  }, [postId, pathname])

  // Function to track conversions
  const trackConversion = async (conversionType: 'signup' | 'trial' | 'purchase' | 'download') => {
    if (!postId || typeof postId !== 'string') return

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          sessionId: getSessionId(),
          duration: Math.round((Date.now() - startTime.current) / 1000),
          converted: true,
          conversionType,
        }),
      })
    } catch (error) {
      console.error('Failed to track conversion:', error)
    }
  }

  return { trackConversion }
}