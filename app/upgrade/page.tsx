'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface SubscriptionData {
  plan: string
  status: string
  subscriptionId?: string
  currentPeriodEnd?: string
}

export default function UpgradePage() {
  const { user, isLoaded } = useUser()
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const plans = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: 9.99,
      features: [
        '20 video conversions per month',
        'AI-powered blog generation',
        'Pinterest post creation',
        'WordPress integration',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 29.99,
      features: [
        '100 video conversions per month',
        'Advanced AI features',
        'All platform integrations',
        'Custom templates',
        'Priority support',
        'Analytics dashboard'
      ],
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 99.99,
      features: [
        'Unlimited video conversions',
        'Custom AI model training',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      popular: false
    }
  ]

  useEffect(() => {
    if (isLoaded && user) {
      fetchCurrentSubscription()
    }
  }, [isLoaded, user])

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/status')
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return

    setUpgrading(planId)
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          email: user.emailAddresses[0].emailAddress,
        }),
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Failed to create checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to manage your subscription.</p>
          <Link
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your video-to-blog conversion needs
          </p>
        </div>

        {currentSubscription && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {currentSubscription.plan}
                </span>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                  currentSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : currentSubscription.status === 'on_trial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentSubscription.status === 'on_trial' ? 'On Trial' : currentSubscription.status}
                </span>
              </div>
              {currentSubscription.currentPeriodEnd && (
                <div className="text-sm text-gray-600">
                  {currentSubscription.status === 'on_trial' ? 'Trial ends' : 'Renews'}: {' '}
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan === plan.id
            const isDowngrade = currentSubscription?.plan === 'ENTERPRISE' && plan.id !== 'ENTERPRISE' ||
                               currentSubscription?.plan === 'PRO' && plan.id === 'BASIC'

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden relative ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-md text-center font-medium">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading === plan.id}
                      className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                          : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                      }`}
                    >
                      {upgrading === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          {isDowngrade ? 'Downgrade to' : 'Upgrade to'} {plan.name}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/account"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Account Settings
          </Link>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Basic Plan</h3>
              <p className="text-gray-600 text-sm">Perfect for individuals and small creators who need regular video-to-blog conversions</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pro Plan</h3>
              <p className="text-gray-600 text-sm">Ideal for content creators and businesses with higher volume needs and advanced features</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Enterprise Plan</h3>
              <p className="text-gray-600 text-sm">For large organizations requiring unlimited usage and custom integrations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 