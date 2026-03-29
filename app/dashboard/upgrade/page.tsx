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
      color: '#767676',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out our AI-powered conversion',
      features: [
        { text: '2 video conversions per month', included: true },
        { text: 'Up to 5 minutes per video', included: true },
        { text: 'Basic blog post generation', included: true },
        { text: 'Standard templates', included: true },
        { text: 'Community support', included: true },
        { text: 'Pinterest posts', included: false },
        { text: 'Platform integrations', included: false },
        { text: 'Storage space: 1GB', included: true }
      ],
      popular: false,
      cta: 'Current Plan',
      badge: null
    },
    {
      id: 'BASIC',
      name: 'Basic',
      icon: '⚡',
      color: '#00A699',
      price: { monthly: 9.99, yearly: 95.88 },
      description: 'Great for individual content creators',
      features: [
        { text: '20 video conversions per month', included: true },
        { text: 'Up to 30 minutes per video', included: true },
        { text: 'AI-powered blog generation', included: true },
        { text: 'Pinterest post creation', included: true },
        { text: 'WordPress integration', included: true },
        { text: 'Email support', included: true },
        { text: 'Priority support', included: false },
        { text: 'Storage space: 10GB', included: true }
      ],
      popular: false,
      cta: 'Get Started',
      badge: null
    },
    {
      id: 'PRO',
      name: 'Pro',
      icon: '🚀',
      color: '#FF385C',
      price: { monthly: 29.99, yearly: 287.88 },
      description: 'Ideal for growing businesses and teams',
      features: [
        { text: '100 video conversions per month', included: true },
        { text: 'Up to 2 hours per video', included: true },
        { text: 'Advanced AI features', included: true },
        { text: 'All platform integrations', included: true },
        { text: 'Custom templates', included: true },
        { text: 'Priority support', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Storage space: 50GB', included: true }
      ],
      popular: true,
      cta: 'Upgrade to Pro',
      badge: 'MOST POPULAR'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      icon: '👑',
      color: '#FC642D',
      price: { monthly: 99.99, yearly: 959.88 },
      description: 'For large teams and organizations',
      features: [
        { text: 'Unlimited video conversions', included: true },
        { text: 'No video duration limits', included: true },
        { text: 'Advanced AI with custom models', included: true },
        { text: 'All platform integrations', included: true },
        { text: 'Custom branding & templates', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Advanced analytics & reporting', included: true },
        { text: 'Storage space: Unlimited', included: true }
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

    if (currentSubscription &&
        (currentSubscription.status === 'active' || currentSubscription.status === 'on_trial') &&
        currentSubscription.plan !== 'FREE') {
      alert('You already have an active subscription.')
      return
    }

    if (planId === 'FREE') {
      return
    }

    if (planId === 'ENTERPRISE') {
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
      <div className="min-h-screen bg-white">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
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
    <div className="min-h-screen bg-white">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-[#484848] mb-4">
                Choose your perfect plan
              </h1>
              <p className="text-xl text-[#767676] max-w-3xl mx-auto mb-8">
                Transform your videos into engaging blog posts with our AI-powered platform
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center bg-[#FAFAFA] rounded-xl p-1 shadow-md">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-[#484848] shadow-md'
                      : 'text-[#767676] hover:text-[#484848]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                    billingPeriod === 'yearly'
                      ? 'bg-white text-[#484848] shadow-md'
                      : 'text-[#767676] hover:text-[#484848]'
                  }`}
                >
                  Yearly
                  <span className="ml-2 inline-flex items-center rounded-full bg-[#00A699] px-2 py-0.5 text-xs font-bold text-white">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Current Subscription Banner */}
            {currentSubscription && (
              <div className="mb-12 bg-[#FAFAFA] rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#484848] flex items-center">
                      <SparklesIcon className="h-5 w-5 text-[#FF385C] mr-2" />
                      Current Subscription
                    </h2>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-[#484848]">
                        {currentSubscription.plan}
                      </span>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                        currentSubscription.status === 'active'
                          ? 'bg-[#00A699] text-white'
                          : currentSubscription.status === 'on_trial'
                          ? 'bg-[#FC642D] text-white'
                          : 'bg-gray-200 text-[#767676]'
                      }`}>
                        {currentSubscription.status === 'on_trial' ? 'On Trial' : currentSubscription.status}
                      </span>
                    </div>
                  </div>
                  {currentSubscription.currentPeriodEnd && (
                    <div className="mt-4 sm:mt-0 text-sm text-[#767676]">
                      <div className="font-semibold">
                        {currentSubscription.status === 'on_trial' ? 'Trial ends' : 'Renews'}
                      </div>
                      <div className="text-[#484848] font-bold">
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
                  <div className="mt-4 p-4 bg-[#FC642D]/10 rounded-xl shadow-sm">
                    <p className="text-sm text-[#484848] flex items-start">
                      <svg className="h-5 w-5 text-[#FC642D] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        You have an active subscription. To change plans, please contact support or cancel your current subscription first.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {plans.map((plan) => {
                const isCurrentPlan = currentSubscription?.plan === plan.id
                const hasActiveSubscription = currentSubscription &&
                  (currentSubscription.status === 'active' || currentSubscription.status === 'on_trial') &&
                  currentSubscription.plan !== 'FREE'
                const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly

                return (
                  <div
                    key={plan.id}
                    className="relative"
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                        <span className="inline-flex items-center rounded-lg bg-[#FF385C] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className={`h-full rounded-2xl transition-all duration-300 overflow-hidden ${
                      plan.popular
                        ? 'shadow-2xl ring-2 ring-[#FF385C]/30'
                        : 'shadow-lg hover:shadow-xl'
                    } ${isCurrentPlan ? 'ring-4 ring-[#00A699]/30' : ''}`}>
                      {/* Card Header */}
                      <div className="p-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl">{plan.icon}</span>
                          {isCurrentPlan && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00A699] text-white">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-[#484848] mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-[#767676] mb-4">
                          {plan.description}
                        </p>
                        <div className="mt-4">
                          {billingPeriod === 'yearly' && price > 0 ? (
                            <div>
                              <span className="text-4xl font-bold text-[#484848]">
                                ${(price / 12).toFixed(2)}
                              </span>
                              <span className="text-lg text-[#767676] ml-2">
                                /month
                              </span>
                              <div className="text-sm text-[#767676] mt-1">
                                Billed ${price} yearly
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-4xl font-bold text-[#484848]">
                                ${price}
                              </span>
                              {price > 0 && (
                                <span className="text-lg text-[#767676] ml-2">
                                  /month
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="p-6 bg-[#FAFAFA]">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              {feature.included ? (
                                <CheckIcon className="h-5 w-5 text-[#00A699] mr-3 mt-0.5 flex-shrink-0" />
                              ) : (
                                <XMarkIcon className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${feature.included ? 'text-[#484848]' : 'text-[#767676]'}`}>
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        {isCurrentPlan ? (
                          <div className="w-full bg-gray-100 text-[#767676] py-3 px-4 rounded-xl text-center font-bold">
                            Current Plan
                          </div>
                        ) : hasActiveSubscription && plan.id !== 'FREE' ? (
                          <button
                            disabled={true}
                            className="w-full py-3 px-4 rounded-xl font-bold bg-gray-200 text-[#767676] cursor-not-allowed"
                          >
                            Already Subscribed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={upgrading === plan.id || plan.id === 'FREE'}
                            style={{ backgroundColor: plan.id === 'FREE' ? '#767676' : plan.color }}
                            className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {upgrading === plan.id ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                              </div>
                            ) : (
                              plan.cta
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FAQs */}
            <div className="bg-[#FAFAFA] rounded-2xl shadow-lg p-8 mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#484848]">Frequently Asked Questions</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div>
                  <h3 className="font-bold text-[#484848] mb-2">Can I change plans anytime?</h3>
                  <p className="text-[#767676]">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-2">What payment methods do you accept?</h3>
                  <p className="text-[#767676]">We accept all major credit cards, debit cards, and PayPal through our secure payment processor.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-2">Is there a free trial?</h3>
                  <p className="text-[#767676]">Yes! All paid plans come with a 7-day free trial. No credit card required to start.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-2">Can I cancel my subscription?</h3>
                  <p className="text-[#767676]">Absolutely. You can cancel your subscription at any time with no cancellation fees.</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center">
              <p className="text-[#767676]">
                Need help choosing the right plan?
                <a href="/support" className="ml-1 font-semibold text-[#FF385C] hover:text-[#E0314F]">
                  Contact our sales team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
