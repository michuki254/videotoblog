'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { DocumentTextIcon, ScaleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
                <ScaleIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Please read these terms carefully before using our service
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
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Agreement to Terms</h2>
          <p className="text-[#767676] mb-4">
            Welcome to VideoBlog AI. These Terms of Service ("Terms") govern your access to and use of our
            video-to-blog conversion platform, website, and services (collectively, the "Service").
          </p>
          <p className="text-[#767676] mb-4">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any
            part of these Terms, you may not access the Service.
          </p>
          <div className="mt-4 p-4 bg-[#FF385C]/10 rounded-xl">
            <p className="text-[#484848] font-semibold text-sm">
              IMPORTANT: These Terms include an arbitration clause and class action waiver that affect your
              rights. Please read Section 15 carefully.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#FAFAFA] rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#484848] mb-4">Quick Navigation</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#accounts" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → User Accounts
            </a>
            <a href="#subscriptions" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Subscriptions & Billing
            </a>
            <a href="#use-license" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Use License
            </a>
            <a href="#prohibited" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Prohibited Activities
            </a>
            <a href="#intellectual-property" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Intellectual Property
            </a>
            <a href="#termination" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Termination
            </a>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Eligibility</h2>
          <p className="text-[#767676] mb-4">
            You must be at least 16 years of age to use our Service. By using the Service, you represent and
            warrant that you:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-[#00A699] mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-[#767676]">Are at least 16 years of age</p>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-[#00A699] mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-[#767676]">Have the legal capacity to enter into these Terms</p>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-[#00A699] mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-[#767676]">Will comply with all applicable laws and regulations</p>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-[#00A699] mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-[#767676]">Will not use the Service for any illegal or unauthorized purpose</p>
            </div>
          </div>
        </div>

        {/* User Accounts */}
        <div id="accounts" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#00A699]/10 rounded-lg p-2 mr-3">
              <DocumentTextIcon className="h-6 w-6 text-[#00A699]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">User Accounts</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Account Creation</h3>
              <p className="text-[#767676]">
                When you create an account with us, you must provide accurate, complete, and current information.
                Failure to do so constitutes a breach of these Terms, which may result in immediate termination
                of your account.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Account Security</h3>
              <p className="text-[#767676] mb-3">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4">
                <li>Safeguarding your password and any other credentials used to access your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring you log out from your account at the end of each session</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Account Suspension</h3>
              <p className="text-[#767676]">
                We reserve the right to suspend or terminate your account if we suspect any fraudulent,
                abusive, or illegal activity, or if you violate these Terms.
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions & Billing */}
        <div id="subscriptions" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#FC642D]/10 rounded-lg p-2 mr-3">
              <svg className="h-6 w-6 text-[#FC642D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">Subscriptions & Billing</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Subscription Plans</h3>
              <p className="text-[#767676] mb-3">
                We offer various subscription plans with different features and pricing. You can view our
                current plans on our pricing page. We reserve the right to modify our plans and pricing at
                any time.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Billing</h3>
              <p className="text-[#767676] mb-3">
                By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4">
                <li>Pay all fees associated with your subscription</li>
                <li>Provide accurate and complete billing information</li>
                <li>Promptly update your billing information if it changes</li>
                <li>Authorize us to charge your payment method on a recurring basis</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Free Trials</h3>
              <p className="text-[#767676]">
                We may offer free trials for certain subscription plans. At the end of the free trial period,
                you will be automatically charged for the subscription unless you cancel before the trial ends.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Cancellation & Refunds</h3>
              <p className="text-[#767676] mb-3">
                You may cancel your subscription at any time through your account settings. Cancellations
                will take effect at the end of your current billing period. We do not offer refunds for
                partial months or unused portions of your subscription, except as required by law.
              </p>
            </div>

            <div className="bg-[#FC642D]/10 rounded-xl p-4">
              <p className="text-sm text-[#484848] font-semibold mb-2">Payment Processing</p>
              <p className="text-sm text-[#767676]">
                All payments are processed through LemonSqueezy. By making a payment, you agree to
                LemonSqueezy's terms of service and privacy policy.
              </p>
            </div>
          </div>
        </div>

        {/* Use License */}
        <div id="use-license" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Use License</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">License Grant</h3>
              <p className="text-[#767676]">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
                non-transferable, non-sublicensable license to access and use the Service for your personal
                or internal business purposes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Generated Content</h3>
              <p className="text-[#767676] mb-3">
                You retain all rights to the blog posts and content generated through our Service. However,
                you are responsible for ensuring that:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4">
                <li>You have the right to convert the source video content</li>
                <li>The generated content does not violate any third-party rights</li>
                <li>Your use of the generated content complies with applicable laws</li>
                <li>You review and edit the content before publishing it</li>
              </ul>
            </div>

            <div className="bg-[#00A699]/10 rounded-xl p-4">
              <p className="text-sm text-[#484848] font-semibold mb-2">AI-Generated Content Disclaimer</p>
              <p className="text-sm text-[#767676]">
                Content generated by our AI is provided "as is" and should be reviewed for accuracy,
                completeness, and appropriateness before use. We do not guarantee the accuracy or quality
                of AI-generated content.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited Activities */}
        <div id="prohibited" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#FF385C]/10 rounded-lg p-2 mr-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-[#FF385C]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">Prohibited Activities</h2>
          </div>

          <p className="text-[#767676] mb-4">
            You agree not to engage in any of the following prohibited activities:
          </p>

          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Unauthorized Access</h3>
                <p className="text-sm text-[#767676]">Attempting to access parts of the Service you're not authorized to access</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Reverse Engineering</h3>
                <p className="text-sm text-[#767676]">Reverse engineering, decompiling, or disassembling the Service</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Automation & Scraping</h3>
                <p className="text-sm text-[#767676]">Using automated tools to access or scrape the Service without authorization</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Account Sharing</h3>
                <p className="text-sm text-[#767676]">Sharing your account credentials or allowing others to use your account</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Harmful Content</h3>
                <p className="text-sm text-[#767676]">Converting content that is illegal, harmful, threatening, or violates third-party rights</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Service Disruption</h3>
                <p className="text-sm text-[#767676]">Interfering with or disrupting the Service or servers</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Reselling</h3>
                <p className="text-sm text-[#767676]">Reselling, sublicensing, or redistributing access to the Service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div id="intellectual-property" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Intellectual Property Rights</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Our Rights</h3>
              <p className="text-[#767676]">
                The Service and its original content, features, and functionality are owned by VideoBlog AI
                and are protected by international copyright, trademark, patent, trade secret, and other
                intellectual property laws.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Your Content</h3>
              <p className="text-[#767676] mb-3">
                By using the Service, you grant us a limited, worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4">
                <li>Process your video URLs to generate blog content</li>
                <li>Store your generated content on our servers</li>
                <li>Display your content back to you through the Service</li>
                <li>Make backups for service continuity and disaster recovery</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Trademarks</h3>
              <p className="text-[#767676]">
                "VideoBlog AI" and our logo are trademarks of our company. You may not use these marks
                without our prior written permission.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Disclaimers</h2>

          <div className="space-y-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">"AS IS" and "AS AVAILABLE"</h3>
              <p className="text-[#767676]">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">No Guarantee of Accuracy</h3>
              <p className="text-[#767676]">
                We do not guarantee the accuracy, completeness, or usefulness of AI-generated content.
                You are solely responsible for reviewing and verifying all content before use.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Service Availability</h3>
              <p className="text-[#767676]">
                We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
                We may modify or discontinue the Service at any time without notice.
              </p>
            </div>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Limitation of Liability</h2>

          <div className="bg-[#FC642D]/10 rounded-xl p-6 mb-4">
            <p className="text-[#484848] font-semibold mb-2 uppercase text-sm">Important Legal Notice</p>
            <p className="text-[#767676] text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL VIDEOBLOG AI, ITS AFFILIATES,
              OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE,
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </div>

          <p className="text-[#767676]">
            Our total liability to you for all claims arising from or related to the Service shall not
            exceed the amount you paid us in the twelve (12) months preceding the claim.
          </p>
        </div>

        {/* Indemnification */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Indemnification</h2>
          <p className="text-[#767676] mb-4">
            You agree to indemnify, defend, and hold harmless VideoBlog AI and its affiliates, officers,
            directors, employees, and agents from and against any claims, liabilities, damages, losses, and
            expenses arising out of or in any way connected with:
          </p>
          <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4">
            <li>Your access to or use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your use of content generated through the Service</li>
          </ul>
        </div>

        {/* Termination */}
        <div id="termination" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Termination</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Termination by You</h3>
              <p className="text-[#767676]">
                You may terminate your account at any time by canceling your subscription and contacting us
                to request account deletion.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Termination by Us</h3>
              <p className="text-[#767676]">
                We may terminate or suspend your account and access to the Service immediately, without prior
                notice or liability, for any reason, including if you breach these Terms.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Effect of Termination</h3>
              <p className="text-[#767676]">
                Upon termination, your right to use the Service will immediately cease. All provisions of
                these Terms which by their nature should survive termination shall survive, including
                ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Changes to These Terms</h2>
          <p className="text-[#767676] mb-4">
            We reserve the right to modify or replace these Terms at any time. We will provide notice of
            material changes by:
          </p>
          <ul className="list-disc list-inside text-[#767676] space-y-2 ml-4 mb-4">
            <li>Posting the updated Terms on our website</li>
            <li>Updating the "Last updated" date at the top of these Terms</li>
            <li>Sending you an email notification (for significant changes)</li>
          </ul>
          <p className="text-[#767676]">
            Your continued use of the Service after any changes constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Governing Law</h2>
          <p className="text-[#767676] mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
            in which our company is registered, without regard to its conflict of law provisions.
          </p>
          <p className="text-[#767676]">
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration
            in accordance with the rules of the applicable arbitration association, except where prohibited
            by law.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-[#FF385C] rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
            <p className="text-white/90 mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>

            <div className="space-y-3 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-white/70 mb-1">Email</p>
                <a href="mailto:legal@videotoblog.ai" className="text-white font-semibold hover:underline">
                  legal@videotoblog.ai
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
            <Link href="/contact" className="text-[#FF385C] hover:underline">
              Contact Us
            </Link>
            <span className="text-[#767676]">•</span>
            <Link href="/help" className="text-[#FF385C] hover:underline">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}


      <Footer />
    </div>
  )
}
