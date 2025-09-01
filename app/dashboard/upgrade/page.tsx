'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '../../components/DashboardSidebar'
import { CheckIcon, XMarkIcon, SparklesIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/20/solid'

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      icon: '🎯',
      color: 'gray',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out our AI-powered conversion.',
      features: [
        { text: '2 video conversions per month', included: true },
        { text: 'Up to 5 minutes per video', included: true },
        { text: 'Basic blog post generation', included: true },
        { text: 'Standard templates', included: true },
        { text: 'Community support', included: true },
        { text: 'Pinterest posts', included: false },
        { text: 'Platform integrations', included: false },
        { text: 'Storage space', included: true, note: '1GB' }
      ],
      popular: false,
      cta: 'Current Plan',
      badge: null
    },
    {
      id: 'BASIC',
      name: 'Basic',
      icon: '⚡',
      color: 'blue',
      price: { monthly: 9.99, yearly: 95.88 }, // 20% discount
      description: 'Great for individual content creators.',
      features: [
        { text: '20 video conversions per month', included: true },
        { text: 'Up to 30 minutes per video', included: true },
        { text: 'AI-powered blog generation', included: true },
        { text: 'Pinterest post creation', included: true },
        { text: 'WordPress integration', included: true },
        { text: 'Email support', included: true },
        { text: 'Priority support', included: false },
        { text: 'Storage space', included: true, note: '10GB' }
      ],
      popular: false,
      cta: 'Get Started',
      badge: null
    },
    {
      id: 'PRO',
      name: 'Pro',
      icon: '🚀',
      color: 'purple',
      price: { monthly: 29.99, yearly: 287.88 }, // 20% discount
      description: 'Ideal for growing businesses and teams.',
      features: [
        { text: '100 video conversions per month', included: true },
        { text: 'Up to 2 hours per video', included: true },
        { text: 'Advanced AI features', included: true },
        { text: 'All platform integrations', included: true },
        { text: 'Custom templates', included: true },
        { text: 'Priority support', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Storage space', included: true, note: '50GB' }
      ],
      popular: true,
      cta: 'Upgrade to Pro',
      badge: 'MOST POPULAR'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      icon: '👑',
      color: 'gold',
      price: { monthly: 99.99, yearly: 959.88 }, // 20% discount
      description: 'For large teams and organizations.',
      features: [
        { text: 'Unlimited video conversions', included: true },
        { text: 'No video duration limits', included: true },
        { text: 'Advanced AI with custom models', included: true },
        { text: 'All platform integrations', included: true },
        { text: 'Custom branding & templates', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Advanced analytics & reporting', included: true },
        { text: 'Storage space', included: true, note: 'Unlimited' }
      ],
      popular: false,
      cta: 'Contact Sales',
      badge: 'ENTERPRISE'
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

    // Double-check: if user has active subscription, don't proceed
    if (currentSubscription && 
        (currentSubscription.status === 'active' || currentSubscription.status === 'on_trial') &&
        currentSubscription.plan !== 'FREE') {
      alert('You already have an active subscription.')
      return
    }

    if (planId === 'FREE') {
      return // Already on free plan
    }

    // Special handling for Enterprise plan
    if (planId === 'ENTERPRISE') {
      // Open contact form or email
      window.location.href = `mailto:sales@videotoblog.com?subject=Enterprise Plan Inquiry&body=Hi, I'm interested in the Enterprise plan for VideotoBlog. My email is ${user.emailAddresses[0].emailAddress}.`
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
        console.error('Checkout error response:', data)
        const errorMessage = data.error || 'Failed to create checkout session. Please try again.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('An error occurred while connecting to the payment provider. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <DashboardSidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            user={user ? {
              firstName: user.firstName || undefined,
              emailAddresses: user.emailAddresses,
              imageUrl: user.imageUrl || undefined
            } : undefined}
          />
          <div className="flex-1 lg:ml-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          user={user ? {
            firstName: user.firstName || undefined,
            emailAddresses: user.emailAddresses,
            imageUrl: user.imageUrl || undefined
          } : undefined}
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
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
          <div className="relative">
            <div className="relative">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-blue-600 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
              <div className="absolute inset-0 bg-grid-white/[0.2] [mask-image:radial-gradient(white,transparent_70%)]"></div>
              <div className="relative mx-auto max-w-7xl text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                  <span className="block">Choose Your Perfect Plan</span>
                </h1>
                <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto mb-6">
                  Transform your videos into engaging blog posts with our AI-powered platform. 
                  Select the plan that fits your content creation needs.
                </p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center mb-8">
                  <span className={`text-sm font-medium mr-3 ${billingPeriod === 'monthly' ? 'text-white' : 'text-indigo-200'}`}>
                    Monthly
                  </span>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ml-3 ${billingPeriod === 'yearly' ? 'text-white' : 'text-indigo-200'}`}>
                    Yearly
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                      Save 20%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Current Subscription Banner */}
            {currentSubscription && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <SparklesIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        Current Subscription
                      </h2>
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {currentSubscription.plan}
                        </span>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                          currentSubscription.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : currentSubscription.status === 'on_trial'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {currentSubscription.status === 'on_trial' ? 'On Trial' : currentSubscription.status}
                        </span>
                      </div>
                    </div>
                    {currentSubscription.currentPeriodEnd && (
                      <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                        <div className="font-medium">
                          {currentSubscription.status === 'on_trial' ? 'Trial ends' : 'Renews'}
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {currentSubscription && 
                   (currentSubscription.status === 'active' || currentSubscription.status === 'on_trial') &&
                   currentSubscription.plan !== 'FREE' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>
                          You have an active subscription. To change plans, please contact support or cancel your current subscription first.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {plans.map((plan, index) => {
                  const isCurrentPlan = currentSubscription?.plan === plan.id
                  const hasActiveSubscription = currentSubscription && 
                    (currentSubscription.status === 'active' || currentSubscription.status === 'on_trial') &&
                    currentSubscription.plan !== 'FREE'
                  const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly

                  return (
                    <div
                      key={plan.id}
                      className="relative group"
                    >
                      {/* Badge */}
                      {plan.badge && (
                        <div className="absolute -top-5 left-0 right-0 flex justify-center">
                          <span className="inline-flex items-center rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                            <StarIcon className="h-3 w-3 mr-1" />
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      
                      <div className={`h-full rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                        plan.popular 
                          ? 'border-purple-600 shadow-2xl' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                      } ${isCurrentPlan ? 'ring-4 ring-indigo-600 ring-opacity-50' : ''}`}>
                        {/* Card Header */}
                        <div className={`p-4 sm:p-6 ${
                          plan.color === 'purple' 
                            ? 'bg-purple-600 text-white' 
                            : plan.color === 'blue'
                            ? 'bg-blue-600 text-white'
                            : plan.color === 'gold'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-3xl sm:text-4xl">{plan.icon}</span>
                              <h3 className={`text-lg sm:text-xl font-bold mt-2 ${plan.color === 'gray' ? 'text-gray-900' : ''}`}>
                                {plan.name}
                              </h3>
                            </div>
                            {isCurrentPlan && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                plan.color === 'gray' ? 'bg-gray-200 text-gray-700' : 'bg-white/20 text-white'
                              }`}>
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${plan.color === 'gray' ? 'text-gray-600' : 'text-white/90'}`}>
                            {plan.description}
                          </p>
                          <div className="mt-6">
                            {billingPeriod === 'yearly' && price > 0 ? (
                              <div>
                                <span className={`text-2xl sm:text-3xl font-bold ${plan.color === 'gray' ? 'text-gray-900' : ''}`}>
                                  ${(price / 12).toFixed(2)}
                                </span>
                                <span className={`text-sm ml-2 ${plan.color === 'gray' ? 'text-gray-600' : 'text-white/80'}`}>
                                  /month
                                </span>
                                <div className={`text-sm mt-1 ${plan.color === 'gray' ? 'text-gray-500' : 'text-white/70'}`}>
                                  Billed ${price} yearly
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className={`text-2xl sm:text-3xl font-bold ${plan.color === 'gray' ? 'text-gray-900' : ''}`}>
                                  ${price}
                                </span>
                                {price > 0 && (
                                  <span className={`text-sm ml-2 ${plan.color === 'gray' ? 'text-gray-600' : 'text-white/80'}`}>
                                    /month
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="p-4 sm:p-6 bg-white">
                          <ul className="space-y-2 sm:space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start">
                                {feature.included ? (
                                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <XMarkIcon className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {feature.text}
                                  {feature.note && (
                                    <span className="font-semibold text-gray-900"> • {feature.note}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <div className="mt-6">
                            {isCurrentPlan ? (
                              <div className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-xl text-center font-medium">
                                Current Plan
                              </div>
                            ) : hasActiveSubscription && plan.id !== 'FREE' ? (
                              <button
                                disabled={true}
                                className="w-full py-3 px-4 rounded-xl font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
                              >
                                Already Subscribed
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={upgrading === plan.id || plan.id === 'FREE'}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                  plan.popular
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                                    : plan.color === 'blue'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : plan.color === 'gold'
                                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                              >
                                {upgrading === plan.id ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                  </div>
                                ) : (
                                  <span className="flex items-center justify-center">
                                    {plan.cta}
                                    {plan.id !== 'FREE' && (
                                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Features Comparison */}
              <div className="mt-12 sm:mt-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Compare Plans</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">See which features are included in each plan</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                          {plans.map((plan) => (
                            <th key={plan.id} className="px-6 py-4 text-center">
                              <div className="text-lg font-bold text-gray-900">{plan.name}</div>
                              <div className="text-sm text-gray-500">${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {['Video conversions', 'Video duration', 'AI features', 'Platform integrations', 'Support level', 'Storage space'].map((feature, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                            {plans.map((plan) => {
                              const featureData = plan.features.find(f => 
                                f.text.toLowerCase().includes(feature.toLowerCase()) ||
                                (feature === 'Video conversions' && f.text.includes('conversions')) ||
                                (feature === 'Video duration' && f.text.includes('minutes')) ||
                                (feature === 'AI features' && f.text.includes('AI')) ||
                                (feature === 'Platform integrations' && f.text.includes('integration')) ||
                                (feature === 'Support level' && f.text.includes('support')) ||
                                (feature === 'Storage space' && f.text.includes('storage'))
                              )
                              return (
                                <td key={plan.id} className="px-6 py-4 text-center">
                                  {featureData?.included ? (
                                    <div>
                                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                      {featureData.note && (
                                        <span className="text-xs text-gray-500 mt-1 block">{featureData.note}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              <div className="mt-12 bg-gray-100 rounded-xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
                    <p className="text-gray-600 text-sm">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                    <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, and PayPal through our secure payment processor.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                    <p className="text-gray-600 text-sm">Yes! All paid plans come with a 7-day free trial. No credit card required to start.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
                    <p className="text-gray-600 text-sm">Absolutely. You can cancel your subscription at any time with no cancellation fees.</p>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-16 text-center">
                <p className="text-gray-600">
                  Need help choosing the right plan? 
                  <a href="/support" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                    Contact our sales team
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      .bg-grid-white\\/\\[0\\.2\\] {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.2)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
      }
    `}</style>
  </div>
  )
} 