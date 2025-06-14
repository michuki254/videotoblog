import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export interface SubscriptionData {
  hasSubscription: boolean
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  status: string
  subscriptionId?: string
  customerId?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  usage: {
    videosThisMonth: number
    videosLimit: number
    storageUsedGB: number
    storageLimit: number
  }
  billingInfo?: {
    nextBillingDate: string
    amount: number
    currency: string
    interval: string
  }
}

export function useSubscription() {
  const { user, isLoaded } = useUser()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = async () => {
    if (!isLoaded || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/subscriptions/status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      setSubscription(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [isLoaded, user])

  const refreshSubscription = () => {
    fetchSubscription()
  }

  const canPerformAction = (action: 'convert_video' | 'create_pinterest' | 'use_integration') => {
    if (!subscription) return { allowed: false, reason: 'Loading subscription data...' }

    switch (action) {
      case 'convert_video':
        if (subscription.usage.videosLimit === -1) return { allowed: true }
        
        if (subscription.usage.videosThisMonth >= subscription.usage.videosLimit) {
          return {
            allowed: false,
            reason: `You've reached your monthly limit of ${subscription.usage.videosLimit} video conversions. Upgrade your plan to convert more videos.`
          }
        }
        return { allowed: true }

      case 'create_pinterest':
        if (subscription.plan === 'FREE') {
          return {
            allowed: false,
            reason: 'Pinterest post creation is available for paid plans only. Upgrade to access this feature.'
          }
        }
        return { allowed: true }

      case 'use_integration':
        if (subscription.plan === 'FREE') {
          return {
            allowed: false,
            reason: 'Platform integrations are available for paid plans only. Upgrade to publish directly to your platforms.'
          }
        }
        return { allowed: true }

      default:
        return { allowed: true }
    }
  }

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    canPerformAction,
    isSubscribed: subscription?.hasSubscription || false,
    isPaidPlan: subscription?.plan !== 'FREE'
  }
} 