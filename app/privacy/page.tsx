'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { ShieldCheckIcon, UserGroupIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
                <ShieldCheckIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Your privacy is important to us
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
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Introduction</h2>
          <p className="text-[#767676] mb-4">
            Welcome to VideoBlog AI. We are committed to protecting your personal information and your right to privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
            video-to-blog conversion platform.
          </p>
          <p className="text-[#767676]">
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
            please do not access the site or use our services.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-[#FAFAFA] rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#484848] mb-4">Quick Navigation</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="#information-we-collect" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Information We Collect
            </a>
            <a href="#how-we-use" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → How We Use Your Information
            </a>
            <a href="#sharing" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Sharing Your Information
            </a>
            <a href="#security" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Data Security
            </a>
            <a href="#your-rights" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Your Privacy Rights
            </a>
            <a href="#contact" className="text-[#FF385C] hover:text-[#E0314F] transition-colors">
              → Contact Us
            </a>
          </div>
        </div>

        {/* Information We Collect */}
        <div id="information-we-collect" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#00A699]/10 rounded-lg p-2 mr-3">
              <DocumentTextIcon className="h-6 w-6 text-[#00A699]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">Information We Collect</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Personal Information</h3>
              <p className="text-[#767676] mb-2">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-1 ml-4">
                <li>Register for an account</li>
                <li>Subscribe to our services</li>
                <li>Contact us for support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="text-[#767676] mt-3">
                This may include: name, email address, payment information, and any other information you choose to provide.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Usage Data</h3>
              <p className="text-[#767676] mb-2">
                We automatically collect certain information when you use our services:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-1 ml-4">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Content You Create</h3>
              <p className="text-[#767676]">
                When you use our video-to-blog conversion service, we process and store:
              </p>
              <ul className="list-disc list-inside text-[#767676] space-y-1 ml-4">
                <li>Video URLs you submit for conversion</li>
                <li>Generated blog posts and content</li>
                <li>Images and media associated with your content</li>
                <li>Publishing settings and integration credentials</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div id="how-we-use" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#FC642D]/10 rounded-lg p-2 mr-3">
              <UserGroupIcon className="h-6 w-6 text-[#FC642D]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">How We Use Your Information</h2>
          </div>

          <p className="text-[#767676] mb-4">
            We use the information we collect to:
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Provide, operate, and maintain our video-to-blog conversion services</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Process your transactions and manage your subscriptions</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Improve and personalize your user experience</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Communicate with you about updates, features, and support</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Analyze usage patterns to enhance our services</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Detect, prevent, and address technical issues or fraud</p>
            </div>
            <div className="flex items-start">
              <div className="bg-[#00A699] rounded-full p-1 mr-3 mt-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#767676]">Comply with legal obligations and enforce our terms</p>
            </div>
          </div>
        </div>

        {/* Sharing Your Information */}
        <div id="sharing" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Sharing Your Information</h2>

          <p className="text-[#767676] mb-4">
            We may share your information in the following situations:
          </p>

          <div className="space-y-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Service Providers</h3>
              <p className="text-[#767676]">
                We share information with third-party service providers who perform services on our behalf, such as:
                payment processing (LemonSqueezy), authentication (Clerk), analytics, hosting, and AI processing (OpenAI, Anthropic).
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Publishing Integrations</h3>
              <p className="text-[#767676]">
                When you connect third-party platforms (WordPress, Medium, Blogger, etc.), we share your content with
                those platforms according to your publishing instructions.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Legal Requirements</h3>
              <p className="text-[#767676]">
                We may disclose your information if required by law, court order, or governmental request, or to
                protect our rights, property, or safety.
              </p>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Business Transfers</h3>
              <p className="text-[#767676]">
                In connection with a merger, acquisition, or sale of assets, your information may be transferred
                to the acquiring entity.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#00A699]/10 rounded-xl">
            <p className="text-[#484848] font-semibold">
              We do not sell your personal information to third parties.
            </p>
          </div>
        </div>

        {/* Data Security */}
        <div id="security" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-[#FF385C]/10 rounded-lg p-2 mr-3">
              <LockClosedIcon className="h-6 w-6 text-[#FF385C]" />
            </div>
            <h2 className="text-2xl font-bold text-[#484848]">Data Security</h2>
          </div>

          <p className="text-[#767676] mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Encryption</h3>
              <p className="text-sm text-[#767676]">
                Data transmitted over the internet is encrypted using SSL/TLS protocols
              </p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Access Controls</h3>
              <p className="text-sm text-[#767676]">
                Restricted access to personal information on a need-to-know basis
              </p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Secure Storage</h3>
              <p className="text-sm text-[#767676]">
                Data stored on secure servers with regular backups
              </p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Regular Audits</h3>
              <p className="text-sm text-[#767676]">
                Periodic security assessments and updates to our systems
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#FC642D]/10 rounded-xl">
            <p className="text-sm text-[#484848]">
              <strong>Note:</strong> No method of transmission over the internet is 100% secure. While we strive to
              protect your information, we cannot guarantee its absolute security.
            </p>
          </div>
        </div>

        {/* Your Privacy Rights */}
        <div id="your-rights" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Your Privacy Rights</h2>

          <p className="text-[#767676] mb-4">
            Depending on your location, you may have the following rights:
          </p>

          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Access</h3>
                <p className="text-sm text-[#767676]">Request access to the personal information we hold about you</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Correction</h3>
                <p className="text-sm text-[#767676]">Request correction of inaccurate or incomplete information</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Deletion</h3>
                <p className="text-sm text-[#767676]">Request deletion of your personal information</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Opt-out</h3>
                <p className="text-sm text-[#767676]">Opt-out of marketing communications at any time</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Portability</h3>
                <p className="text-sm text-[#767676]">Request a copy of your data in a portable format</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-[#FF385C] rounded-full p-1.5 mr-3 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#484848]">Restriction</h3>
                <p className="text-sm text-[#767676]">Request restriction of processing in certain circumstances</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#FAFAFA] rounded-xl">
            <p className="text-sm text-[#767676]">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@videotoblog.ai" className="text-[#FF385C] hover:underline font-semibold">
                privacy@videotoblog.ai
              </a>
            </p>
          </div>
        </div>

        {/* Cookies and Tracking */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Cookies and Tracking Technologies</h2>

          <p className="text-[#767676] mb-4">
            We use cookies and similar tracking technologies to:
          </p>

          <ul className="list-disc list-inside text-[#767676] space-y-2 mb-4">
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our services</li>
            <li>Improve our platform performance</li>
            <li>Provide personalized content and recommendations</li>
          </ul>

          <p className="text-[#767676] mb-4">
            You can control cookies through your browser settings. Note that disabling cookies may affect the
            functionality of our services.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Essential Cookies</h3>
              <p className="text-sm text-[#767676]">Required for basic site functionality</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Analytics Cookies</h3>
              <p className="text-sm text-[#767676]">Help us understand usage patterns</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="font-semibold text-[#484848] mb-2">Preference Cookies</h3>
              <p className="text-sm text-[#767676]">Remember your choices and settings</p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Data Retention</h2>

          <p className="text-[#767676] mb-4">
            We retain your personal information only for as long as necessary to:
          </p>

          <ul className="list-disc list-inside text-[#767676] space-y-2">
            <li>Provide you with our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce our agreements</li>
            <li>Maintain business records as required by law</li>
          </ul>

          <p className="text-[#767676] mt-4">
            When your information is no longer needed, we will securely delete or anonymize it.
          </p>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Children's Privacy</h2>

          <p className="text-[#767676] mb-4">
            Our services are not directed to individuals under the age of 16. We do not knowingly collect personal
            information from children under 16.
          </p>

          <p className="text-[#767676]">
            If we learn that we have collected personal information from a child under 16, we will take steps to
            delete that information as quickly as possible. If you believe we have collected information from a
            child under 16, please contact us immediately.
          </p>
        </div>

        {/* International Data Transfers */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">International Data Transfers</h2>

          <p className="text-[#767676] mb-4">
            Your information may be transferred to and processed in countries other than your country of residence.
            These countries may have data protection laws different from those in your country.
          </p>

          <p className="text-[#767676]">
            We take appropriate safeguards to ensure your personal information remains protected in accordance with
            this Privacy Policy, including using standard contractual clauses approved by relevant authorities.
          </p>
        </div>

        {/* Updates to This Policy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-4">Updates to This Privacy Policy</h2>

          <p className="text-[#767676] mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other
            operational, legal, or regulatory reasons.
          </p>

          <p className="text-[#767676] mb-4">
            We will notify you of any material changes by:
          </p>

          <ul className="list-disc list-inside text-[#767676] space-y-2">
            <li>Posting the updated policy on our website</li>
            <li>Updating the "Last updated" date at the top of this policy</li>
            <li>Sending you an email notification (for significant changes)</li>
          </ul>

          <p className="text-[#767676] mt-4">
            We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
          </p>
        </div>

        {/* Contact Us */}
        <div id="contact" className="bg-[#FF385C] rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-white/90 mb-6">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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
            <Link href="/terms" className="text-[#FF385C] hover:underline">
              Terms of Service
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
