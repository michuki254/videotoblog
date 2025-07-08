'use client'

import { useState } from 'react'
import { useSubscription } from './SubscriptionProvider'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/lemonsqueezy'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import toast from 'react-hot-toast'

export default function SubscriptionManager() {
  const { subscription, isLoading, refreshSubscription } = useSubscription()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No subscription data available</p>
      </div>
    )
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan]
  const progressPercentage = subscription.limits.videosPerMonth === -1 
    ? 0 
    : (subscription.usage.videosThisMonth / subscription.limits.videosPerMonth) * 100

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    setActionLoading('cancel')
    
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast.success('Subscription cancelled successfully')
      await refreshSubscription()

    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = (planKey: string) => {
    // Redirect to pricing page with selected plan
    window.location.href = `/pricing?plan=${planKey}`
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h4>
              <p className="text-gray-600">
                {subscription.plan === 'FREE' ? 'Free Plan' : `$${formatPrice(currentPlan.price)}/month`}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscription.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscription.isActive ? 'Active' : subscription.status}
              </span>
            </div>
          </div>

          {subscription.currentPeriodEnd && (
            <p className="text-sm text-gray-600 mb-4">
              {subscription.cancelAtPeriodEnd 
                ? `Expires on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              }
            </p>
          )}

          {/* Usage Progress */}
          {subscription.limits.videosPerMonth !== -1 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Video Conversions This Month</span>
                <span>{subscription.usage.videosThisMonth} / {subscription.limits.videosPerMonth}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progressPercentage >= 90 ? 'bg-red-500' : 
                    progressPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Storage Usage */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Storage Used</span>
              <span>{subscription.usage.storageUsedGB.toFixed(2)} GB / {subscription.limits.storageGB} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((subscription.usage.storageUsedGB / subscription.limits.storageGB) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.plan !== 'ENTERPRISE' && subscription.isActive && (
              <button
                onClick={() => handleUpgrade('PRO')}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Upgrade Plan
              </button>
            )}
            
            {subscription.plan !== 'FREE' && subscription.isActive && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Your subscription is cancelled and will end on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing History */}
      {subscription.plan !== 'FREE' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              For detailed billing history and invoices, please visit your{' '}
              <a href="https://app.lemonsqueezy.com/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                LemonSqueezy billing portal
              </a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 