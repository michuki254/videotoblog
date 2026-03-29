'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '' // Hidden field for spam detection
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formLoadTime = useRef<number>(Date.now())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    // Spam Prevention Checks

    // 1. Honeypot check - if filled, it's a bot
    if (formData.honeypot) {
      setIsSubmitting(false)
      return // Silently reject
    }

    // 2. Time-based check - form must be open for at least 3 seconds
    const timeSinceLoad = Date.now() - formLoadTime.current
    if (timeSinceLoad < 3000) {
      setSubmitStatus('error')
      setErrorMessage('Please take a moment to fill out the form properly.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          timestamp: formLoadTime.current
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          honeypot: ''
        })
        // Reset form load time
        formLoadTime.current = Date.now()
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Failed to submit form. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
                <EnvelopeIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto">
              Have questions or need support? We're here to help! Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="bg-[#00A699]/10 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-[#00A699]" />
              </div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Email Us</h3>
              <p className="text-sm text-[#767676] mb-3">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a href="mailto:support@videotoblog.ai" className="text-[#FF385C] hover:underline font-semibold">
                support@videotoblog.ai
              </a>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="bg-[#FC642D]/10 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-[#FC642D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Support Hours</h3>
              <div className="text-sm text-[#767676] space-y-1">
                <p>Monday - Friday: 9am - 6pm EST</p>
                <p>Saturday: 10am - 4pm EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="bg-[#FF385C]/10 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Follow Us</h3>
              <p className="text-sm text-[#767676] mb-4">
                Stay updated with our latest features and tips.
              </p>
              <div className="flex gap-3">
                <Link href="#" className="bg-[#FAFAFA] p-2 rounded-lg hover:bg-[#FF385C]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#767676]" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </Link>
                <Link href="#" className="bg-[#FAFAFA] p-2 rounded-lg hover:bg-[#FF385C]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#767676]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </Link>
                <Link href="#" className="bg-[#FAFAFA] p-2 rounded-lg hover:bg-[#FF385C]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#767676]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#484848] mb-6">Send us a message</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 bg-[#00A699]/10 rounded-xl p-4 flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-[#00A699] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#00A699] mb-1">Message sent successfully!</h3>
                    <p className="text-sm text-[#767676]">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 bg-[#FF385C]/10 rounded-xl p-4 flex items-start">
                  <svg className="h-6 w-6 text-[#FF385C] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-[#FF385C] mb-1">Error sending message</h3>
                    <p className="text-sm text-[#767676]">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[#484848] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#484848] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-[#484848] mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[#484848] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Honeypot field - hidden from users but visible to bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="honeypot">Leave this field empty</label>
                  <input
                    type="text"
                    id="honeypot"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF385C] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#E0314F] transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-sm text-[#767676] text-center">
                  By submitting this form, you agree to our{' '}
                  <Link href="/privacy" className="text-[#FF385C] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#484848] mb-6 text-center">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">How quickly will I get a response?</h3>
              <p className="text-[#767676]">
                We typically respond to all inquiries within 24 hours during business hours. Urgent issues
                are prioritized and addressed as quickly as possible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Can I schedule a demo?</h3>
              <p className="text-[#767676]">
                Yes! Mention that you'd like a demo in your message, and we'll schedule a personalized
                walkthrough of our platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Do you offer custom solutions?</h3>
              <p className="text-[#767676]">
                Absolutely! We work with businesses of all sizes to create custom content solutions.
                Contact us to discuss your specific needs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#484848] mb-2">Need immediate support?</h3>
              <p className="text-[#767676]">
                For urgent technical issues, email us at{' '}
                <a href="mailto:support@videotoblog.ai" className="text-[#FF385C] hover:underline">
                  support@videotoblog.ai
                </a>{' '}
                with "URGENT" in the subject line.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}


      <Footer />
    </div>
  )
}
