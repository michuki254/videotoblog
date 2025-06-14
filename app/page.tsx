'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Navigation from './components/Navigation'

export default function Home() {
  const [activeTab, setActiveTab] = useState('youtube')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation variant="home" />

      {/* Hero Section */}
      <section className="pt-24 pb-12 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  🚀 AI-Powered Conversion
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transform <span className="text-indigo-600">Videos</span> into 
                <br />Engaging <span className="text-purple-600">Blog Posts</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Convert YouTube videos, podcasts, and presentations into SEO-optimized blog content in minutes. 
                Powered by advanced AI with automatic screenshots, headlines, and formatting.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">10K+</div>
                  <div className="text-sm text-gray-600">Videos Converted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">5min</div>
                  <div className="text-sm text-gray-600">Average Time</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/convert" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">
                  Start Converting Free
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-indigo-300 transition-all">
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Your blog post ready in minutes!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Try It Live</h2>
            <p className="text-lg text-gray-600">Paste a YouTube URL and see the magic happen</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="url" 
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                Convert Now
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              No signup required • Free to try • Results in under 5 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Content Creation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides all the tools you need to transform video content 
              into engaging, SEO-optimized blog posts that drive traffic and engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🚀",
                title: "Lightning Fast Processing",
                description: "Convert 60-minute videos to blog posts in under 5 minutes with our optimized AI pipeline."
              },
              {
                icon: "🎯",
                title: "Smart Screenshot Capture",
                description: "Automatically extract relevant screenshots at key moments to enhance your blog content."
              },
              {
                icon: "📝",
                title: "SEO Optimization",
                description: "Built-in SEO tools generate meta descriptions, tags, and structure for better rankings."
              },
              {
                icon: "🎨",
                title: "Custom Formatting",
                description: "Choose from multiple blog templates and styles to match your brand perfectly."
              },
              {
                icon: "🔧",
                title: "Advanced Editing",
                description: "Fine-tune content with our built-in editor featuring tone adjustment and length control."
              },
              {
                icon: "📊",
                title: "Analytics Ready",
                description: "Export with proper heading structure and metadata for easy publishing and tracking."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, fast, and incredibly effective</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Input Your Video",
                description: "Paste YouTube URL, upload video file, or provide transcript",
                detail: "Supports YouTube, Vimeo, MP4, and direct transcript uploads"
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our AI extracts transcript, identifies key points, and captures screenshots",
                detail: "Advanced NLP processes content for structure and meaning"
              },
              {
                step: "03",
                title: "Content Generation", 
                description: "Generates engaging blog post with proper formatting and SEO optimization",
                detail: "Creates headlines, meta descriptions, and proper article structure"
              },
              {
                step: "04",
                title: "Export & Publish",
                description: "Download markdown, HTML, or copy to your favorite CMS",
                detail: "Ready for WordPress, Medium, or any publishing platform"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl font-bold text-indigo-600 mb-4">{step.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <p className="text-sm text-gray-500">{step.detail}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-indigo-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of content creators who trust VideoBlog AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Content Creator",
                company: "TechReviews Pro",
                quote: "This tool has revolutionized my content workflow. I can now repurpose my YouTube videos into blog posts that rank on the first page of Google.",
                rating: 5
              },
              {
                name: "Marcus Rodriguez", 
                role: "Marketing Director",
                company: "GrowthHacker Inc",
                quote: "The AI quality is incredible. It captures the essence of our video content and creates blog posts that sound natural and engaging.",
                rating: 5
              },
              {
                name: "Emily Watson",
                role: "Blogger",
                company: "Lifestyle Insights",
                quote: "I've tried many tools, but none come close to this. The screenshot feature and SEO optimization save me hours of work.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">Start free, upgrade when you need more</p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free to Start</h3>
              <div className="text-4xl font-bold text-indigo-600 mb-2">$0</div>
              <div className="text-gray-600 mb-6">3 conversions per month</div>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Basic AI conversion</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Screenshot capture</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> SEO optimization</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Export to markdown</li>
              </ul>
              
              <Link href="/convert" className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block">
                Start Free
              </Link>
            </div>
          </div>
          
          <div className="mt-8">
            <Link href="/pricing" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              View all plans →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "What video formats do you support?",
                a: "We support YouTube URLs, direct video uploads (MP4, MOV, AVI), and can also work with just transcripts if you have them."
              },
              {
                q: "How accurate is the AI conversion?", 
                a: "Our AI achieves 95%+ accuracy in content conversion. It understands context, maintains the original meaning, and creates natural-sounding blog posts."
              },
              {
                q: "Can I customize the output format?",
                a: "Yes! You can choose writing style, blog length, SEO focus, and export format. We also provide an editor for fine-tuning."
              },
              {
                q: "Is there a limit on video length?",
                a: "Free accounts can convert videos up to 30 minutes. Pro accounts support videos up to 3 hours long."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of content creators who use VideoBlog AI to maximize their content reach
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/convert" className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Converting Free
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">VideoBlog AI</h3>
              <p className="text-sm text-gray-400">
                Transform videos into engaging blog content with the power of AI.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2025 VideoBlog AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
