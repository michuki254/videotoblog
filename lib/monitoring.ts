// Error monitoring with Sentry
import * as Sentry from '@sentry/nextjs'
import Settings from '@/models/Settings'

class ErrorMonitoring {
  private static instance: ErrorMonitoring
  private initialized = false
  private settings: any = null

  private constructor() {}

  static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring()
    }
    return ErrorMonitoring.instance
  }

  async initialize() {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Fetch settings from API (client-side)
      const response = await fetch('/api/settings/public')
      if (response.ok) {
        const data = await response.json()
        this.settings = data.settings
        
        if (this.settings?.analytics?.enableErrorReporting && this.settings?.analytics?.sentryDsn) {
          this.initializeSentry(this.settings.analytics.sentryDsn)
        }
      }
    } catch (error) {
      console.error('Failed to initialize error monitoring:', error)
    }

    this.initialized = true
  }

  private initializeSentry(dsn: string) {
    Sentry.init({
      dsn: dsn,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      beforeSend(event, hint) {
        // Filter out certain errors if needed
        if (event.exception) {
          const error = hint.originalException
          // Add custom filtering logic here
        }
        return event
      },
    })
  }

  // Set user context
  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  }

  // Clear user context
  clearUser() {
    if (!this.settings?.analytics?.enableErrorReporting) return
    Sentry.setUser(null)
  }

  // Capture exception
  captureException(error: Error, context?: Record<string, any>) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    if (context) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key])
        })
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  }

  // Capture message
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (!this.settings?.analytics?.enableErrorReporting) return
    Sentry.captureMessage(message, level)
  }

  // Add breadcrumb
  addBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: Sentry.SeverityLevel
    data?: Record<string, any>
  }) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    })
  }

  // Set context
  setContext(key: string, context: Record<string, any>) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    Sentry.setContext(key, context)
  }

  // Set tags
  setTag(key: string, value: string) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    Sentry.setTag(key, value)
  }

  // Start transaction for performance monitoring
  startTransaction(name: string, op: string) {
    if (!this.settings?.analytics?.enableErrorReporting) return null
    
    return Sentry.startTransaction({
      name,
      op,
    })
  }
}

export const errorMonitoring = ErrorMonitoring.getInstance()