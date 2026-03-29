'use client'

import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { SparklesIcon, UserGroupIcon, RocketLaunchIcon, HeartIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-[#FF385C] pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-2xl p-4 shadow-lg">
                <SparklesIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About VideoBlog AI
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize content creation by making it faster, easier, and more accessible for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#484848] mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-[#767676] text-lg">
              <p>
                VideoBlog AI was born from a simple observation: content creators were spending countless hours
                manually transcribing videos and converting them into blog posts. What should take minutes was
                taking hours, and the quality was often inconsistent.
              </p>
              <p>
                We saw an opportunity to leverage the power of artificial intelligence to solve this problem.
                By combining advanced AI models with smart screenshot capture and SEO optimization, we created
                a platform that transforms any YouTube video into a professional, publish-ready blog post in minutes.
              </p>
              <p>
                Today, thousands of content creators, marketers, and businesses use VideoBlog AI to amplify their
                reach, improve their SEO, and save valuable time. We're proud to be helping creators focus on what
                they do best—creating amazing content.
              </p>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-[#FF385C]/10 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
              <RocketLaunchIcon className="h-7 w-7 text-[#FF385C]" />
            </div>
            <h3 className="text-2xl font-bold text-[#484848] mb-4">Our Mission</h3>
            <p className="text-[#767676]">
              To empower content creators worldwide by providing AI-powered tools that transform video content
              into engaging, SEO-optimized blog posts—saving time and amplifying reach.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-[#00A699]/10 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
              <LightBulbIcon className="h-7 w-7 text-[#00A699]" />
            </div>
            <h3 className="text-2xl font-bold text-[#484848] mb-4">Our Vision</h3>
            <p className="text-[#767676]">
              To become the world's leading platform for AI-powered content repurposing, helping millions
              of creators maximize the value of their video content.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-[#FC642D]/10 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
              <HeartIcon className="h-7 w-7 text-[#FC642D]" />
            </div>
            <h3 className="text-2xl font-bold text-[#484848] mb-4">Our Values</h3>
            <p className="text-[#767676]">
              Innovation, quality, user-centricity, and transparency. We're committed to building tools
              that genuinely improve the lives of content creators.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-[#484848] mb-8 text-center">What We Do</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start mb-4">
                <div className="bg-[#00A699] rounded-lg p-2 mr-4 mt-1">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#484848] mb-2">AI-Powered Conversion</h3>
                  <p className="text-[#767676]">
                    Our advanced AI watches videos, transcribes audio, and transforms content into well-structured,
                    engaging blog posts with proper formatting and SEO optimization.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start mb-4">
                <div className="bg-[#FC642D] rounded-lg p-2 mr-4 mt-1">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#484848] mb-2">Smart Screenshot Capture</h3>
                  <p className="text-[#767676]">
                    Our AI identifies and captures key visual moments from videos, automatically inserting
                    relevant images into your blog posts at the perfect locations.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start mb-4">
                <div className="bg-[#FF385C] rounded-lg p-2 mr-4 mt-1">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#484848] mb-2">SEO Optimization</h3>
                  <p className="text-[#767676]">
                    Every blog post includes meta descriptions, schema markup, proper heading structure,
                    and keyword optimization to help you rank higher in search results.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start mb-4">
                <div className="bg-[#484848] rounded-lg p-2 mr-4 mt-1">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#484848] mb-2">Multi-Platform Publishing</h3>
                  <p className="text-[#767676]">
                    Seamlessly publish to WordPress, Medium, Blogger, Ghost, and more—all from a single
                    dashboard. No more copy-pasting between platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* By The Numbers */}
        <div className="bg-[#FAFAFA] rounded-2xl shadow-md p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-[#484848] mb-8 text-center">By The Numbers</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#FF385C] mb-2">5,000+</div>
              <div className="text-[#767676] font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#00A699] mb-2">2,847+</div>
              <div className="text-[#767676] font-medium">Articles Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#FC642D] mb-2">87%</div>
              <div className="text-[#767676] font-medium">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#484848] mb-2">40+</div>
              <div className="text-[#767676] font-medium">Languages</div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-[#00A699]/10 rounded-lg p-2 mr-3">
              <ChartBarIcon className="h-6 w-6 text-[#00A699]" />
            </div>
            <h2 className="text-3xl font-bold text-[#484848]">Powered by Cutting-Edge AI</h2>
          </div>

          <p className="text-[#767676] text-center max-w-3xl mx-auto mb-8">
            We leverage the latest advances in artificial intelligence to deliver exceptional results:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#FAFAFA] rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-[#484848] mb-2">Claude 3.5 Sonnet</div>
              <p className="text-sm text-[#767676]">Advanced language model for content generation and understanding</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-[#484848] mb-2">GPT-4o</div>
              <p className="text-sm text-[#767676]">Multimodal AI for visual analysis and content creation</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-[#484848] mb-2">Next.js 15</div>
              <p className="text-sm text-[#767676]">Modern web framework for fast, reliable performance</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-[#FF385C]/10 rounded-lg p-2 mr-3">
              <UserGroupIcon className="h-6 w-6 text-[#FF385C]" />
            </div>
            <h2 className="text-3xl font-bold text-[#484848]">Our Team</h2>
          </div>

          <p className="text-[#767676] text-center max-w-3xl mx-auto mb-12">
            We're a passionate team of engineers, designers, and content strategists dedicated to building
            the best AI-powered content creation tools in the world.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-[#FF385C] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">DX</span>
              </div>
              <h3 className="text-xl font-semibold text-[#484848] mb-1">Engineering Team</h3>
              <p className="text-sm text-[#767676] mb-2">Building the Future</p>
              <p className="text-sm text-[#767676]">
                Experts in AI, machine learning, and web development working to create innovative solutions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#00A699] to-[#008E82] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">DS</span>
              </div>
              <h3 className="text-xl font-semibold text-[#484848] mb-1">Design Team</h3>
              <p className="text-sm text-[#767676] mb-2">Crafting Experiences</p>
              <p className="text-sm text-[#767676]">
                Creating intuitive, beautiful interfaces that make content creation a joy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-[#FC642D] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">CS</span>
              </div>
              <h3 className="text-xl font-semibold text-[#484848] mb-1">Support Team</h3>
              <p className="text-sm text-[#767676] mb-2">Here to Help</p>
              <p className="text-sm text-[#767676]">
                Dedicated to ensuring every user has an amazing experience with our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="bg-[#FF385C] rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Thousands of Happy Creators
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start transforming your video content into SEO-optimized blog posts today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/convert"
                className="bg-white text-[#FF385C] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-block"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/20 inline-block"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-6">
              Join 5,000+ creators • Free trial • No credit card required
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-[#767676] mb-4">Have questions or want to learn more?</p>
          <Link
            href="/contact"
            className="text-[#FF385C] hover:underline font-semibold text-lg"
          >
            Get in touch with our team →
          </Link>
        </div>
      </div>

      {/* Footer */}


      <Footer />
    </div>
  )
}
