'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '../../components/DashboardSidebar'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

interface SubscriptionData {
  plan: string
  status: string
  subscriptionId?: string
  currentPeriodEnd?: string
}

export default function DashboardUpgradePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out our AI-powered conversion.',
      features: [
        '2 video conversions per month',
        'Up to 5 minutes per video',
        'Basic blog post generation',
        'Standard templates',
        'Community support'
      ],
      limitations: [
        'No Pinterest posts',
        'No platform integrations',
        'Limited storage (1GB)'
      ],
      popular: false,
      cta: 'Current Plan'
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 9.99,
      description: 'Great for individual content creators.',
      features: [
        '20 video conversions per month',
        'Up to 30 minutes per video',
        'AI-powered blog generation',
        'Pinterest post creation',
        'WordPress integration',
        'Email support',
        '10GB storage'
      ],
      limitations: [],
      popular: false,
      cta: 'Start Basic'
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 29.99,
      description: 'Ideal for growing businesses and teams.',
      features: [
        '100 video conversions per month',
        'Up to 2 hours per video',
        'Advanced AI features',
        'All platform integrations',
        'Custom templates',
        'Priority support',
        'Analytics dashboard',
        '50GB storage'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Pro'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 99.99,
      description: 'Dedicated solution for large-scale operations.',
      features: [
        'Unlimited video conversions',
        'Unlimited video duration',
        'Custom AI model training',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations',
        '500GB storage'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
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

    if (planId === 'FREE') {
      return // Already on free plan
    }

    if (planId === 'ENTERPRISE') {
      window.open('mailto:sales@videotoblog.ai?subject=Enterprise Plan Inquiry', '_blank')
      return
    }

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
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Upgrade Plan</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Plan</h1>
              <p className="mt-2 text-gray-600">
                Choose the perfect plan for your video-to-blog conversion needs
              </p>
            </div>

            {/* Current Plan Status */}
            {currentSubscription && (
              <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = currentSubscription?.plan === plan.id
                const isDowngrade = currentSubscription?.plan === 'ENTERPRISE' && plan.id !== 'ENTERPRISE' ||
                                   currentSubscription?.plan === 'PRO' && plan.id === 'BASIC' ||
                                   currentSubscription?.plan === 'PRO' && plan.id === 'FREE' ||
                                   currentSubscription?.plan === 'BASIC' && plan.id === 'FREE'

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-lg shadow-sm border overflow-hidden relative ${
                      plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                        {plan.price > 0 && <span className="text-gray-600">/month</span>}
                      </div>

                      <ul className="space-y-2 mb-6 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <XMarkIcon className="h-4 w-4 text-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-400">{limitation}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan ? (
                        <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-center font-medium text-sm">
                          Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgrading === plan.id}
                          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
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
                              {isDowngrade ? 'Downgrade to' : plan.cta}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Help Section */}
            <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help Choosing?</h2>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Basic Plan</h3>
                  <p className="text-gray-600">Perfect for individuals and small creators who need regular video-to-blog conversions</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pro Plan</h3>
                  <p className="text-gray-600">Ideal for content creators and businesses with higher volume needs and advanced features</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enterprise Plan</h3>
                  <p className="text-gray-600">For large organizations requiring unlimited usage and custom integrations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 