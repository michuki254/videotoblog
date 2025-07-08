'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface SubscriptionData {
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  status: string
  isActive: boolean
  features: string[]
  limits: {
    videosPerMonth: number
    maxVideoDuration: number
    storageGB: number
  }
  usage: {
    videosThisMonth: number
    storageUsedGB: number
  }
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  subscriptionId?: string
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  isLoading: boolean
  refreshSubscription: () => Promise<void>
  canPerformAction: (action: 'convert_video' | 'create_pinterest' | 'use_integration') => {
    allowed: boolean
    reason?: string
  }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isSignedIn, user } = useUser()

  const fetchSubscription = async () => {
    if (!isSignedIn) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/subscriptions/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        console.error('Failed to fetch subscription')
        setSubscription(null)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSubscription = async () => {
    setIsLoading(true)
    await fetchSubscription()
  }

  const canPerformAction = (action: 'convert_video' | 'create_pinterest' | 'use_integration') => {
    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' }
    }

    const plan = subscription.plan
    const limits = subscription.limits
    const usage = subscription.usage

    switch (action) {
      case 'convert_video':
        if (limits.videosPerMonth === -1) return { allowed: true }
        
        if (usage.videosThisMonth >= limits.videosPerMonth) {
          return {
            allowed: false,
            reason: `You've reached your monthly limit of ${limits.videosPerMonth} video conversions. Upgrade your plan to convert more videos.`
          }
        }
        return { allowed: true }

      case 'create_pinterest':
        if (plan === 'FREE') {
          return {
            allowed: false,
            reason: 'Pinterest post creation is available for paid plans only. Upgrade to access this feature.'
          }
        }
        return { allowed: true }

      case 'use_integration':
        if (plan === 'FREE') {
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

  useEffect(() => {
    fetchSubscription()
  }, [isSignedIn, user])

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    refreshSubscription,
    canPerformAction,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
} 