// Error monitoring with Sentry
import * as Sentry from '@sentry/nextjs'

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
    try {
      Sentry.init({
        dsn: dsn,
        environment: process.env.NODE_ENV,
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
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }

  // Set user context
  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    try {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      })
    } catch (error) {
      console.error('Failed to set Sentry user:', error)
    }
  }

  // Clear user context
  clearUser() {
    if (!this.settings?.analytics?.enableErrorReporting) return
    try {
      Sentry.setUser(null)
    } catch (error) {
      console.error('Failed to clear Sentry user:', error)
    }
  }

  // Capture exception
  captureException(error: Error, context?: Record<string, any>) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    try {
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
    } catch (err) {
      console.error('Failed to capture Sentry exception:', err)
    }
  }

  // Capture message
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (!this.settings?.analytics?.enableErrorReporting) return
    try {
      Sentry.captureMessage(message, level)
    } catch (error) {
      console.error('Failed to capture Sentry message:', error)
    }
  }

  // Add breadcrumb
  addBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: Sentry.SeverityLevel
    data?: Record<string, any>
  }) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    
    try {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category,
        level: breadcrumb.level || 'info',
        data: breadcrumb.data,
        timestamp: Date.now() / 1000,
      })
    } catch (error) {
      console.error('Failed to add Sentry breadcrumb:', error)
    }
  }

  // Set context
  setContext(key: string, context: Record<string, any>) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    try {
      Sentry.setContext(key, context)
    } catch (error) {
      console.error('Failed to set Sentry context:', error)
    }
  }

  // Set tags
  setTag(key: string, value: string) {
    if (!this.settings?.analytics?.enableErrorReporting) return
    try {
      Sentry.setTag(key, value)
    } catch (error) {
      console.error('Failed to set Sentry tag:', error)
    }
  }
}

export const errorMonitoring = ErrorMonitoring.getInstance()