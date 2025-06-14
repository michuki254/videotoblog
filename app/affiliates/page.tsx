'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join Our Affiliate Program
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Earn 30% commission on every referral. Help creators transform their videos into engaging blog posts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://hullmedia.lemonsqueezy.com/affiliates"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Join Affiliate Program
                <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-2" />
              </a>
              <Link
                href="/pricing"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Our Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Join Our Affiliate Program?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Partner with us to earn substantial commissions while helping creators succeed with AI-powered content transformation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">30% Commission</h3>
            <p className="text-gray-600">Earn recurring 30% commission on all subscription plans</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">30-Day Cookies</h3>
            <p className="text-gray-600">Get credit for conversions up to 30 days after the initial click</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Track clicks, conversions, and earnings in real-time</p>
          </div>

          <div className="text-center">
            <div className="bg-pink-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShareIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Materials</h3>
            <p className="text-gray-600">Access banners, copy, and promotional assets</p>
          </div>
        </div>

        {/* Commission Structure */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Commission Structure</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Plan</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">$3.00</p>
              <p className="text-gray-600">per referral</p>
              <p className="text-sm text-gray-500 mt-2">30% of $9.99/month</p>
            </div>
            <div className="text-center p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Plan</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">$9.00</p>
              <p className="text-gray-600">per referral</p>
              <p className="text-sm text-gray-500 mt-2">30% of $29.99/month</p>
              <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full mt-2">Most Popular</span>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Plan</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">$30.00</p>
              <p className="text-gray-600">per referral</p>
              <p className="text-sm text-gray-500 mt-2">30% of $99.99/month</p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6">
            <strong>Recurring commissions:</strong> Earn every month as long as your referrals remain subscribed
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Program</h3>
              <p className="text-gray-600">Sign up through LemonSqueezy's Affiliate Hub and get approved</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600">Promote VideotoBlog using your unique affiliate link</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Commissions</h3>
              <p className="text-gray-600">Get paid 30% recurring commission for every successful referral</p>
            </div>
          </div>
        </div>

        {/* Perfect For */}
        <div className="bg-gray-100 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Content Creators</h3>
              <p className="text-gray-600 text-sm">YouTubers, bloggers, and social media influencers</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Tech Reviewers</h3>
              <p className="text-gray-600 text-sm">Technology and SaaS product reviewers</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Marketing Agencies</h3>
              <p className="text-gray-600 text-sm">Digital marketing and content agencies</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Course Creators</h3>
              <p className="text-gray-600 text-sm">Online educators and course instructors</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of affiliates who are already earning recurring commissions by promoting VideotoBlog's AI-powered video-to-blog platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://hullmedia.lemonsqueezy.com/affiliates"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Join Affiliate Program
              <ArrowTopRightOnSquareIcon className="h-5 w-5 ml-2" />
            </a>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Questions? Email us at <a href="mailto:affiliates@videotoblog.ai" className="text-blue-600 hover:underline">affiliates@videotoblog.ai</a>
          </p>
        </div>
      </div>
    </div>
  )
} 