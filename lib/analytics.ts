// Analytics wrapper for Google Analytics and custom tracking
import Settings from '@/models/Settings'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

class Analytics {
  private static instance: Analytics
  private initialized = false
  private settings: any = null

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  async initialize() {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Fetch settings from API (client-side)
      const response = await fetch('/api/settings/public')
      if (response.ok) {
        const data = await response.json()
        this.settings = data.settings
        
        if (this.settings?.analytics?.enableTracking && this.settings?.analytics?.googleAnalyticsId) {
          this.initializeGoogleAnalytics(this.settings.analytics.googleAnalyticsId)
        }
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }

    this.initialized = true
  }

  private initializeGoogleAnalytics(measurementId: string) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function(...args: any[]) {
      window.dataLayer!.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
    })
  }

  // Track page views
  trackPageView(url?: string) {
    if (!this.settings?.analytics?.enableTracking || typeof window === 'undefined') return

    // Google Analytics
    if (window.gtag && this.settings?.analytics?.googleAnalyticsId) {
      window.gtag('config', this.settings.analytics.googleAnalyticsId, {
        page_path: url || window.location.pathname,
      })
    }

    // Custom page view tracking (already implemented in PageView model)
  }

  // Track custom events
  trackEvent(action: string, category: string, label?: string, value?: number) {
    if (!this.settings?.analytics?.enableTracking || typeof window === 'undefined') return

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  // Track conversions
  trackConversion(type: 'signup' | 'subscribe' | 'video_convert') {
    this.trackEvent('conversion', type)
  }

  // Track user timing
  trackTiming(category: string, variable: string, value: number, label?: string) {
    if (!this.settings?.analytics?.enableTracking || typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label,
      })
    }
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.settings?.analytics?.enableTracking || typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('set', { user_properties: properties })
    }
  }

  // Track exceptions/errors (for Google Analytics)
  trackException(description: string, fatal: boolean = false) {
    if (!this.settings?.analytics?.enableTracking || typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: description,
        fatal: fatal,
      })
    }
  }
}

export const analytics = Analytics.getInstance()