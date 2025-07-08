import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import {
  createCheckout,
  getCustomer,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  listSubscriptions,
  getVariant,
  listProducts,
} from '@lemonsqueezy/lemonsqueezy.js'
import crypto from 'crypto'

// Initialize LemonSqueezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('LemonSqueezy Error:', error),
})

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      '2 video conversions per month',
      'Basic blog post generation',
      'Standard templates',
      'Community support'
    ],
    limits: {
      videosPerMonth: 2,
      maxVideoDuration: 300, // 5 minutes
      storageGB: 1,
    }
  },
  BASIC: {
    name: 'Basic',
    price: 9.99,
    variantId: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID!,
    features: [
      '20 video conversions per month',
      'AI-powered blog generation',
      'Pinterest post creation',
      'WordPress integration',
      'Email support'
    ],
    limits: {
      videosPerMonth: 20,
      maxVideoDuration: 1800, // 30 minutes
      storageGB: 10,
    }
  },
  PRO: {
    name: 'Pro',
    price: 29.99,
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID!,
    features: [
      '100 video conversions per month',
      'Advanced AI features',
      'All platform integrations',
      'Custom templates',
      'Priority support',
      'Analytics dashboard'
    ],
    limits: {
      videosPerMonth: 100,
      maxVideoDuration: 7200, // 2 hours
      storageGB: 50,
    }
  }
}

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Create checkout session for subscription
export async function createSubscriptionCheckout(
  variantId: string,
  customEmail?: string,
  customData?: Record<string, any>
) {
  try {
    console.log('LemonSqueezy checkout params:', {
      storeId: process.env.LEMONSQUEEZY_STORE_ID,
      variantId,
      email: customEmail,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`
    })

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: true,
          logo: true,
        },
        checkoutData: {
          email: customEmail,
          custom: customData,
        },
        productOptions: {
          name: 'VideotoBlog Subscription',
          description: 'AI-powered video to blog conversion platform',
          media: [
            'https://your-domain.com/logo.png' // Replace with your logo
          ],
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for subscribing to VideotoBlog!',
        },
      }
    )

    console.log('LemonSqueezy response:', JSON.stringify(checkout, null, 2))
    return checkout.data
  } catch (error: any) {
    console.error('Error creating checkout - Full error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    if (error?.response) {
      console.error('Error response:', error.response.data)
      console.error('Error status:', error.response.status)
    }
    throw new Error(`Failed to create checkout session: ${error?.message || 'Unknown error'}`)
  }
}

// Get customer subscription details
export async function getCustomerSubscription(customerId: string) {
  try {
    const subscriptions = await listSubscriptions({
      filter: {
        userEmail: customerId, // LemonSqueezy uses userEmail for filtering
      },
    })

    return subscriptions.data?.data[0] || null
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Cancel subscription
export async function cancelUserSubscription(subscriptionId: string) {
  try {
    const cancelled = await cancelSubscription(subscriptionId)
    return cancelled.data?.data
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

// Update subscription
export async function updateUserSubscription(
  subscriptionId: string,
  variantId: string
) {
  try {
    const updated = await updateSubscription(subscriptionId, {
      variantId: parseInt(variantId),
    })
    return updated.data?.data
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await getSubscription(subscriptionId)
    return subscription.data?.data
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return null
  }
}

// Check if user has active subscription
export function hasActiveSubscription(subscription: any): boolean {
  if (!subscription) return false
  
  const status = subscription.attributes?.status
  return status === 'active' || status === 'past_due'
}

// Get user's current plan
export function getUserPlan(subscription: any): SubscriptionPlan {
  if (!subscription || !hasActiveSubscription(subscription)) {
    return 'FREE'
  }

  const variantId = subscription.attributes?.variant_id?.toString()
  
  for (const [planKey, planData] of Object.entries(SUBSCRIPTION_PLANS)) {
    if ('variantId' in planData && planData.variantId === variantId) {
      return planKey as SubscriptionPlan
    }
  }

  return 'FREE'
}

// Check if user can perform action based on their plan
export function canPerformAction(
  subscription: any,
  action: 'convert_video' | 'create_pinterest' | 'use_integration',
  currentUsage?: {
    videosThisMonth?: number
    storageUsedGB?: number
  }
): { allowed: boolean; reason?: string } {
  const plan = getUserPlan(subscription)
  const planLimits = SUBSCRIPTION_PLANS[plan].limits

  switch (action) {
    case 'convert_video':
      if (planLimits.videosPerMonth === -1) return { allowed: true }
      
      const videosUsed = currentUsage?.videosThisMonth || 0
      if (videosUsed >= planLimits.videosPerMonth) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${planLimits.videosPerMonth} video conversions. Upgrade your plan to convert more videos.`
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

// Webhook signature verification
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  return signature === expectedSignature
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
} 