'use client'

import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative py-28 px-4 bg-[#222222] overflow-hidden">
      <div className="max-w-3xl mx-auto text-center relative">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Ready to 10x your
          <br />
          <span className="text-[#FF385C]">content output?</span>
        </h2>

        <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Join 5,000+ creators saving 20+ hours per week. Start your free trial today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/sign-up"
            className="px-10 py-4 bg-[#FF385C] hover:bg-[#E0314F] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </Link>
          <Link
            href="/about"
            className="px-10 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-bold text-lg transition-all"
          >
            Learn More
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          {['No credit card', 'Cancel anytime', 'Setup in 2 mins'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00A699]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
