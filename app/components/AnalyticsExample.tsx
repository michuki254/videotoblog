'use client'

import { useAnalytics, useInteractionTracking } from '@/hooks/useAnalytics'

// Example component showing how to use analytics
export function AnalyticsExample() {
  const { trackEvent, trackConversion, trackException } = useAnalytics()
  const { trackClick, trackFormSubmit } = useInteractionTracking()

  const handleButtonClick = () => {
    // Track a custom event
    trackEvent('button_click', 'engagement', 'cta_button')
    
    // Track a click interaction
    trackClick('cta_button', 'homepage')
  }

  const handleConversion = () => {
    // Track a conversion
    trackConversion('video_convert')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Your form logic here
      
      // Track successful form submission
      trackFormSubmit('contact_form', true)
    } catch (error) {
      // Track failed form submission
      trackFormSubmit('contact_form', false)
      
      // Also track the error
      trackException(error as Error)
    }
  }

  return (
    <div>
      <button onClick={handleButtonClick}>
        Click Me (Tracked)
      </button>
      
      <button onClick={handleConversion}>
        Convert Video (Tracked Conversion)
      </button>
      
      <form onSubmit={handleFormSubmit}>
        {/* Form fields */}
        <button type="submit">Submit (Tracked)</button>
      </form>
    </div>
  )
}