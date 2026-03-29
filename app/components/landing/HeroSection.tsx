'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function HeroSection() {
  const [demoUrl, setDemoUrl] = useState('')
  const router = useRouter()
  const { isSignedIn } = useUser()

  const handleConvert = () => {
    if (demoUrl.trim()) {
      if (isSignedIn) {
        router.push(`/convert?url=${encodeURIComponent(demoUrl)}`)
      } else {
        router.push('/sign-in')
      }
    }
  }

  return (
    <section className="relative pt-36 pb-24 px-4 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[#FAFAFA] -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Status Badge */}
        <div className="flex justify-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#00A699]/20 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A699] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A699]" />
            </span>
            <span className="text-sm font-medium text-[#484848]">Powered by Claude 3.5 Sonnet</span>
            <span className="text-xs px-2 py-0.5 bg-[#00A699]/10 text-[#00A699] rounded-full font-semibold">v2.4</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-center text-[#484848] mb-8 animate-fade-in-up">
          Video to Blog Post
          <br />
          <span className="text-[#FF385C]">in Minutes</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[#767676] text-center max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
          Drop a YouTube URL. Our AI transcribes, captures screenshots, and writes a publish-ready, SEO-optimized article automatically.
        </p>

        {/* CTA Input */}
        <div className="max-w-2xl mx-auto mb-6 animate-fade-in-up animation-delay-400">
          <div className="group flex items-center bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-[#FF385C]/40 transition-all duration-300 p-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg className="w-5 h-5 text-[#FF385C] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              <input
                type="text"
                placeholder="Paste a YouTube URL..."
                className="flex-1 py-3.5 bg-transparent text-base focus:outline-none placeholder:text-gray-400 text-[#484848]"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
              />
            </div>
            <button
              onClick={handleConvert}
              className="px-8 py-3.5 bg-[#FF385C] hover:bg-[#E0314F] text-white rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Convert
            </button>
          </div>
          <p className="text-center text-sm text-[#767676] mt-4">
            No credit card required &middot; Free trial &middot; 2-minute setup
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 pt-10 animate-fade-in-up animation-delay-600">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-[#484848]">2,847+</div>
            <div className="text-sm text-[#767676] mt-1">Articles created</div>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-[#484848]">87%</div>
            <div className="text-sm text-[#767676] mt-1">Time saved</div>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-[#484848]">5,000+</div>
            <div className="text-sm text-[#767676] mt-1">Active creators</div>
          </div>
        </div>
      </div>
    </section>
  )
}
