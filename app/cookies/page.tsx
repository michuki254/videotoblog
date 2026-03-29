'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { CakeIcon, Cog6ToothIcon, ChartBarIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
                <CakeIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-white/90 mb-4">
              How we use cookies and similar technologies
            </p>
            <p className="text-sm text-white/80">
              Last updated: November 30, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">What Are Cookies?</h2>
          <p className="text-[#767676] mb-4">
            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when
            you visit our website. They help us provide you with a better experience by remembering your
            preferences, understanding how you use our service, and improving our platform.
          </p>
          <p className="text-[#767676]">
            This Cookie Policy explains what cookies are, how we use them, and how you can control them.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-[#FAFAFA] rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#484848] mb-4">Quick Navigation</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#types" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Types of Cookies
            </a>
            <a href="#how-we-use" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → How We Use Cookies
            </a>
            <a href="#third-party" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Third-Party Cookies
            </a>
            <a href="#control" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Managing Cookies
            </a>
          </div>
        </div>

        {/* Types of Cookies */}
        <div id="types" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-[#00A699]/10 rounded-lg p-2 mr-3">
              <Cog6ToothIcon className="h-6 w-6 text-[#00A699]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">Types of Cookies We Use</h2>
          </div>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="bg-[#FAFAFA] rounded-xl p-6">
              <div className="flex items-start mb-3">
                <div className="bg-[#00A699] rounded-lg p-2 mr-3 mt-1">
                  <LockClosedIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#484848] mb-2">Essential Cookies</h3>
                  <p className="text-[#767676] mb-3">
                    These cookies are necessary for the website to function properly. They enable core
                    functionality such as security, network management, and accessibility.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#484848] mb-2">Examples:</p>
                    <ul className="text-sm text-[#767676] space-y-1">
                      <li>• Authentication cookies (keeping you logged in)</li>
                      <li>• Security cookies (protecting against fraud)</li>
                      <li>• Session management cookies</li>
                      <li>• Load balancing cookies</li>
                    </ul>
                  </div>
                  <div className="mt-3 inline-block">
                    <span className="bg-[#00A699] text-white text-xs px-3 py-1 rounded-full">
                      Cannot be disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-[#FAFAFA] rounded-xl p-6">
              <div className="flex items-start mb-3">
                <div className="bg-[#FC642D] rounded-lg p-2 mr-3 mt-1">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#484848] mb-2">Analytics Cookies</h3>
                  <p className="text-[#767676] mb-3">
                    These cookies help us understand how visitors interact with our website by collecting and
                    reporting information anonymously.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#484848] mb-2">Examples:</p>
                    <ul className="text-sm text-[#767676] space-y-1">
                      <li>• Google Analytics (page views, session duration)</li>
                      <li>• Usage statistics (feature adoption, popular pages)</li>
                      <li>• Performance metrics (page load times)</li>
                      <li>• Error tracking (technical issues)</li>
                    </ul>
                  </div>
                  <div className="mt-3 inline-block">
                    <span className="bg-[#FC642D] text-white text-xs px-3 py-1 rounded-full">
                      Can be disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="bg-[#FAFAFA] rounded-xl p-6">
              <div className="flex items-start mb-3">
                <div className="bg-[#FF385C] rounded-lg p-2 mr-3 mt-1">
                  <Cog6ToothIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#484848] mb-2">Functional Cookies</h3>
                  <p className="text-[#767676] mb-3">
                    These cookies enable enhanced functionality and personalization. They remember your
                    preferences and choices.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#484848] mb-2">Examples:</p>
                    <ul className="text-sm text-[#767676] space-y-1">
                      <li>• Language preferences</li>
                      <li>• Theme settings (dark mode, light mode)</li>
                      <li>• Region/location preferences</li>
                      <li>• Previously entered form data</li>
                    </ul>
                  </div>
                  <div className="mt-3 inline-block">
                    <span className="bg-[#FF385C] text-white text-xs px-3 py-1 rounded-full">
                      Can be disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-[#FAFAFA] rounded-xl p-6">
              <div className="flex items-start mb-3">
                <div className="bg-[#484848] rounded-lg p-2 mr-3 mt-1">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#484848] mb-2">Marketing Cookies</h3>
                  <p className="text-[#767676] mb-3">
                    These cookies track your online activity to help us deliver more relevant advertising
                    and limit the number of times you see an ad.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#484848] mb-2">Examples:</p>
                    <ul className="text-sm text-[#767676] space-y-1">
                      <li>• Advertising cookies (Google Ads, Facebook Pixel)</li>
                      <li>• Retargeting cookies</li>
                      <li>• Conversion tracking</li>
                      <li>• Campaign performance measurement</li>
                    </ul>
                  </div>
                  <div className="mt-3 inline-block">
                    <span className="bg-[#484848] text-white text-xs px-3 py-1 rounded-full">
                      Can be disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Cookies */}
        <div id="how-we-use" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">How We Use Cookies</h2>

          <p className="text-[#767676] mb-4">
            We use cookies for the following purposes:
          </p>

          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Authentication & Security</h3>
                <p className="text-sm text-[#767676]">Keep you signed in and protect your account from unauthorized access</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Performance Monitoring</h3>
                <p className="text-sm text-[#767676]">Track how our service performs and identify areas for improvement</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">User Experience</h3>
                <p className="text-sm text-[#767676]">Remember your preferences and settings to provide a personalized experience</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Analytics & Insights</h3>
                <p className="text-sm text-[#767676]">Understand how visitors use our website to improve our services</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Marketing & Advertising</h3>
                <p className="text-sm text-[#767676]">Show you relevant ads and measure the effectiveness of our campaigns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div id="third-party" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Third-Party Cookies</h2>

          <p className="text-[#767676] mb-6">
            In addition to our own cookies, we may use third-party services that set their own cookies.
            These services help us provide a better experience:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Clerk</h3>
              <p className="text-sm text-[#767676] mb-2">Authentication and user management</p>
              <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF385C] hover:underline">
                Privacy Policy →
              </a>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Google Analytics</h3>
              <p className="text-sm text-[#767676] mb-2">Website analytics and performance</p>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF385C] hover:underline">
                Privacy Policy →
              </a>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">LemonSqueezy</h3>
              <p className="text-sm text-[#767676] mb-2">Payment processing and subscriptions</p>
              <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF385C] hover:underline">
                Privacy Policy →
              </a>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Sentry</h3>
              <p className="text-sm text-[#767676] mb-2">Error tracking and monitoring</p>
              <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF385C] hover:underline">
                Privacy Policy →
              </a>
            </div>
          </div>
        </div>

        {/* Cookie Duration */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Cookie Duration</h2>

          <p className="text-[#767676] mb-4">
            Cookies can be temporary or persistent:
          </p>

          <div className="space-y-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Session Cookies (Temporary)</h3>
              <p className="text-sm text-[#767676]">
                These cookies are deleted when you close your browser. They help us track your movements
                from page to page so you don't get asked for the same information repeatedly.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Persistent Cookies</h3>
              <p className="text-sm text-[#767676]">
                These cookies remain on your device for a set period or until you delete them. They help
                us recognize you when you return to our website and remember your preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Managing Cookies */}
        <div id="control" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Managing Your Cookie Preferences</h2>

          <p className="text-[#767676] mb-6">
            You have several options to control or limit how we and our partners use cookies:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-3">Browser Settings</h3>
              <p className="text-[#767676] mb-4">
                Most web browsers allow you to control cookies through their settings. Here's how to
                manage cookies in popular browsers:
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#484848]">Google Chrome</span>
                    <svg className="w-4 h-4 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>

                <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#484848]">Firefox</span>
                    <svg className="w-4 h-4 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>

                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#484848]">Safari</span>
                    <svg className="w-4 h-4 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>

                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#484848]">Microsoft Edge</span>
                    <svg className="w-4 h-4 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-3">Opt-Out Tools</h3>
              <p className="text-[#767676] mb-3">
                You can also use these tools to opt out of specific types of cookies:
              </p>

              <div className="space-y-3">
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="block bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#484848] block">Google Analytics Opt-out</span>
                      <span className="text-sm text-[#767676]">Browser add-on to prevent Google Analytics tracking</span>
                    </div>
                    <svg className="w-4 h-4 text-[#FF385C] flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>

                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="block bg-[#FAFAFA] rounded-lg p-4 hover:bg-[#FF385C]/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#484848] block">Digital Advertising Alliance</span>
                      <span className="text-sm text-[#767676]">Opt out of interest-based advertising</span>
                    </div>
                    <svg className="w-4 h-4 text-[#FF385C] flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-[#FC642D]/10 rounded-xl p-4">
              <p className="text-sm text-[#484848] font-semibold mb-2">Important Note</p>
              <p className="text-sm text-[#767676]">
                If you disable or refuse cookies, some features of our Service may not function properly.
                Essential cookies cannot be disabled as they are necessary for the operation of the website.
              </p>
            </div>
          </div>
        </div>

        {/* Do Not Track */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Do Not Track Signals</h2>
          <p className="text-[#767676] mb-4">
            Some browsers support a "Do Not Track" (DNT) signal. Currently, there is no industry standard
            for how DNT signals should be interpreted.
          </p>
          <p className="text-[#767676]">
            We do not currently respond to DNT signals, but we respect your right to privacy and encourage
            you to use the cookie management tools described above.
          </p>
        </div>

        {/* Updates to This Policy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Updates to This Cookie Policy</h2>
          <p className="text-[#767676] mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for
            other operational, legal, or regulatory reasons.
          </p>
          <p className="text-[#767676]">
            We will notify you of any material changes by updating the "Last updated" date at the top of
            this policy and, where appropriate, providing additional notice.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-[#FF385C] rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Cookies?</h2>
            <p className="text-white/90 mb-6">
              If you have questions about our use of cookies or other tracking technologies, please contact us:
            </p>

            <div className="space-y-3 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/70 mb-1">Email</p>
                <a href="mailto:privacy@videotoblog.ai" className="text-white font-semibold hover:underline">
                  privacy@videotoblog.ai
                </a>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/70 mb-1">General Support</p>
                <a href="mailto:support@videotoblog.ai" className="text-white font-semibold hover:underline">
                  support@videotoblog.ai
                </a>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-block bg-white text-[#FF385C] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 text-center">
          <p className="text-[#767676] mb-4">Related Resources</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="text-[#FF385C] hover:underline">
              Privacy Policy
            </Link>
            <span className="text-[#767676]">•</span>
            <Link href="/terms" className="text-[#FF385C] hover:underline">
              Terms of Service
            </Link>
            <span className="text-[#767676]">•</span>
            <Link href="/contact" className="text-[#FF385C] hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}


      <Footer />
    </div>
  )
}
