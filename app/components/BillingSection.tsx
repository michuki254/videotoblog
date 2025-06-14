'use client'

import { useState } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { formatPrice } from '@/lib/lemonsqueezy'

export default function BillingSection() {
  const { subscription, loading, error, refreshSubscription } = useSubscription()
  const [cancelling, setCancelling] = useState(false)

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) return

    setCancelling(true)
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.subscriptionId })
      })

      if (response.ok) {
        refreshSubscription()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/dashboard?view=upgrade'
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading billing information: {error}</p>
        <button 
          onClick={refreshSubscription}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No billing information available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscription.plan === 'FREE' 
              ? 'bg-gray-100 text-gray-800'
              : subscription.plan === 'BASIC'
              ? 'bg-blue-100 text-blue-800'
              : subscription.plan === 'PRO'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gold-100 text-gold-800'
          }`}>
            {subscription.plan}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium capitalize">{subscription.status}</p>
          </div>
          
          {subscription.billingInfo && (
            <>
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="font-medium">{formatPrice(subscription.billingInfo.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="font-medium">
                  {new Date(subscription.billingInfo.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
          
          {subscription.cancelAtPeriodEnd && (
            <div className="md:col-span-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  Your subscription will be cancelled at the end of the current billing period.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {subscription.plan === 'FREE' ? (
            <button
              onClick={handleUpgrade}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Plan
              </button>
              {!subscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage This Month</h3>
        
        <div className="space-y-4">
          {/* Video Conversions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Video Conversions</span>
              <span className="text-sm font-medium">
                {subscription.usage.videosThisMonth} / {
                  subscription.usage.videosLimit === -1 ? '∞' : subscription.usage.videosLimit
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: subscription.usage.videosLimit === -1 
                    ? '0%' 
                    : `${Math.min((subscription.usage.videosThisMonth / subscription.usage.videosLimit) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium">
                {subscription.usage.storageUsedGB.toFixed(1)} GB / {
                  subscription.usage.storageLimit === -1 ? '∞' : `${subscription.usage.storageLimit} GB`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: subscription.usage.storageLimit === -1 
                    ? '0%' 
                    : `${Math.min((subscription.usage.storageUsedGB / subscription.usage.storageLimit) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Usage Warnings */}
        {subscription.usage.videosLimit !== -1 && 
         subscription.usage.videosThisMonth >= subscription.usage.videosLimit * 0.8 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              You're approaching your monthly video conversion limit. Consider upgrading your plan.
            </p>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
        <p className="text-gray-600 text-sm">
          Billing history will be available once you have an active subscription.
        </p>
        {/* You can extend this to show actual billing history from LemonSqueezy */}
      </div>
    </div>
  )
} 