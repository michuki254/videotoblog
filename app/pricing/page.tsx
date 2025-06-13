'use client'

import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    planKey: 'FREE',
    href: '/convert',
    price: 0,
    description: 'Perfect for trying out our AI-powered conversion.',
    features: [
      '2 video conversions per month',
      'Up to 5 minutes per video',
      'Basic blog post generation',
      'Standard templates',
      'Community support',
    ],
    limitations: [
      'No Pinterest posts',
      'No platform integrations',
      'Limited storage (1GB)',
    ],
    featured: false,
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Basic',
    id: 'tier-basic',
    planKey: 'BASIC',
    href: '#',
    price: 9.99,
    description: 'Great for individual content creators.',
    features: [
      '20 video conversions per month',
      'Up to 30 minutes per video',
      'AI-powered blog generation',
      'Pinterest post creation',
      'WordPress integration',
      'Email support',
      '10GB storage',
    ],
    limitations: [],
    featured: false,
    cta: 'Start Basic',
    popular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    planKey: 'PRO',
    href: '#',
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
      '50GB storage',
    ],
    limitations: [],
    featured: true,
    cta: 'Start Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    planKey: 'ENTERPRISE',
    href: '#',
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
      '500GB storage',
    ],
    limitations: [],
    featured: false,
    cta: 'Contact Sales',
    popular: false,
  },
]

const features = [
  {
    name: 'AI Processing',
    tiers: { Free: 'Basic GPT-3.5', Professional: 'Advanced GPT-4', Enterprise: 'Custom Models' },
  },
  {
    name: 'Video Length',
    tiers: { Free: '10 minutes', Professional: '3 hours', Enterprise: 'Unlimited' },
  },
  {
    name: 'Monthly Conversions',
    tiers: { Free: '3', Professional: '50', Enterprise: 'Unlimited' },
  },
  {
    name: 'Screenshot Quality',
    tiers: { Free: 'Standard', Professional: 'HD', Enterprise: '4K + AI Enhanced' },
  },
  {
    name: 'Export Formats',
    tiers: { Free: 'Markdown', Professional: 'MD, HTML, DOCX', Enterprise: 'All + Custom' },
  },
  {
    name: 'Support',
    tiers: { Free: 'Community', Professional: 'Email', Enterprise: '24/7 Dedicated' },
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Content Creator',
    company: '@SarahTechReviews',
    quote: 'The Professional plan has been a game-changer for my YouTube channel. I can now repurpose all my videos into SEO-optimized blog posts that drive 40% more traffic to my website.',
    plan: 'Professional',
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Director',
    company: 'TechStart Inc',
    quote: 'Enterprise plan\'s API integration allowed us to automate our entire content workflow. We\'re now publishing 10x more blog content from our video library.',
    plan: 'Enterprise',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Blogger',
    company: 'Lifestyle Blog',
    quote: 'Started with the free plan and was so impressed with the quality that I upgraded to Professional within a week. The ROI has been incredible.',
    plan: 'Professional',
  },
]

const faqs = [
  {
    question: 'How does the AI video conversion work?',
    answer: 'Our AI system extracts audio from your video, generates a high-quality transcript, analyzes the content structure, captures relevant screenshots, and transforms everything into a well-formatted, SEO-optimized blog post that maintains your original message and tone.',
  },
  {
    question: 'What video formats and platforms do you support?',
    answer: 'We support YouTube URLs, direct video uploads (MP4, MOV, AVI, WMV), Vimeo links, and can even work with just audio files or transcripts. Videos can be up to 4K resolution.',
  },
  {
    question: 'Can I customize the output style and format?',
    answer: 'Yes! Professional and Enterprise plans offer extensive customization including tone adjustment (professional, casual, technical), content length control, custom templates, branding options, and multiple export formats.',
  },
  {
    question: 'What happens if I exceed my monthly conversion limit?',
    answer: 'You can purchase additional conversions à la carte ($2 per conversion for Professional users, $1 for Enterprise), or upgrade to a higher tier. We\'ll notify you when you\'re approaching your limit.',
  },
  {
    question: 'How accurate is the AI conversion?',
    answer: 'Our AI achieves 95%+ accuracy in content conversion. Professional plans use GPT-4 for enhanced understanding, while Enterprise customers can request custom model training for their specific domain or style.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes! We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied with the quality or features, we\'ll provide a full refund.',
  },
  {
    question: 'Can I cancel or change my plan anytime?',
    answer: 'Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle, and you keep access to your current plan until then.',
  },
  {
    question: 'Is there an API for developers?',
    answer: 'Yes! Professional plans include limited API access (1,000 calls/month), while Enterprise plans include full API access (10,000 calls/month) with comprehensive documentation and SDKs.',
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user, isSignedIn } = useUser()
  const router = useRouter()

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0
    return billingCycle === 'yearly' ? Math.round(basePrice * 0.8) : basePrice
  }

  const getSavings = (basePrice: number) => {
    if (basePrice === 0) return 0
    return Math.round(basePrice * 0.2 * 12)
  }

  const handleSubscribe = async (planKey: string) => {
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }

    if (planKey === 'FREE') {
      router.push('/dashboard')
      return
    }

    if (planKey === 'ENTERPRISE') {
      // Redirect to contact sales
      window.open('mailto:sales@videotoblog.ai?subject=Enterprise Plan Inquiry', '_blank')
      return
    }

    setIsLoading(planKey)

    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planKey,
          email: user?.emailAddresses[0]?.emailAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = data.checkoutUrl

    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="default" />
      
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-base font-semibold leading-7 text-indigo-600">Pricing Plans</h1>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the perfect plan for your content needs
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your videos into engaging blog posts with AI. Start free, upgrade when you need more.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-16 flex justify-center">
            <div className="relative flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={classNames(
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500',
                  'relative whitespace-nowrap rounded-lg py-2 px-6 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600'
                )}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={classNames(
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500',
                  'relative whitespace-nowrap rounded-lg py-2 px-6 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600'
                )}
              >
                Yearly billing
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.featured 
                    ? 'ring-2 ring-indigo-600 shadow-xl scale-105' 
                    : 'ring-1 ring-gray-200',
                  'rounded-3xl p-8 xl:p-10 relative bg-white'
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-x-4">
                  <h2
                    id={tier.id}
                    className={classNames(
                      tier.featured ? 'text-indigo-600' : 'text-gray-900',
                      'text-lg font-semibold leading-8'
                    )}
                  >
                    {tier.name}
                  </h2>
                </div>
                
                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    ${getPrice(tier.price)}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </p>
                
                {billingCycle === 'yearly' && tier.price > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${getSavings(tier.price)} per year
                  </p>
                )}

                <button
                  onClick={() => handleSubscribe(tier.planKey)}
                  disabled={isLoading === tier.planKey}
                  className={classNames(
                    tier.featured
                      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400'
                      : tier.price === 0
                      ? 'bg-gray-50 text-gray-900 ring-1 ring-inset ring-gray-200 hover:ring-gray-300 disabled:bg-gray-200'
                      : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 disabled:text-indigo-400',
                    'mt-6 w-full rounded-md py-3 px-6 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading === tier.planKey ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    tier.cta
                  )}
                </button>

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                  {tier.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-x-3 text-gray-400">
                      <XMarkIcon className="h-6 w-5 flex-none text-gray-300" aria-hidden="true" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-32">
            <div className="mx-auto max-w-4xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Compare Plans
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                See exactly what's included in each plan
              </p>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Free
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {feature.tiers.Free}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {feature.tiers.Professional}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {feature.tiers.Enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-32">
            <div className="mx-auto max-w-4xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                What Our Customers Say
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                See how VideoBlog AI has transformed content workflows
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {testimonial.plan}
                      </span>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-indigo-600">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mx-auto max-w-4xl mt-32">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-16">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-8">
                  <dt className="text-lg font-semibold leading-7 text-gray-900 mb-3">
                    {faq.question}
                  </dt>
                  <dd className="text-base leading-7 text-gray-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* CTA Section */}
          <div className="mt-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl">
            <div className="px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to transform your content strategy?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
                  Join thousands of content creators who use VideoBlog AI to maximize their reach and engagement.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/convert"
                    className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Start free trial
                  </Link>
                  <Link href="#" className="text-sm font-semibold leading-6 text-white">
                    Contact sales <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
