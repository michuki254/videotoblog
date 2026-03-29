'use client'

const steps = [
  {
    number: '01',
    title: 'Paste a URL',
    description: 'Drop any YouTube link. Works with any length — from 60-second Shorts to 3-hour podcasts.',
    color: '#00A699',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    preview: (
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mt-4">
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
        <span className="text-xs text-gray-400 truncate font-mono">youtube.com/watch?v=dQw4w...</span>
      </div>
    ),
  },
  {
    number: '02',
    title: 'AI Analyzes',
    description: 'Multi-modal AI watches, transcribes, and extracts key insights and visual moments.',
    color: '#FC642D',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    preview: (
      <div className="space-y-2 mt-4">
        {['Transcription', 'Visual analysis', 'Context extraction'].map((item, i) => (
          <div key={item} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#00A699]' : i === 1 ? 'bg-[#FC642D]' : 'bg-[#FF385C]'}`} />
            <span className="text-xs text-gray-500">{item}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF385C] rounded-full animate-progress" style={{ animationDelay: `${i * 0.4}s` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '03',
    title: 'Publish Ready',
    description: 'Get formatted articles with headings, screenshots, meta descriptions — ready to publish.',
    color: '#FF385C',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    preview: (
      <div className="flex flex-wrap gap-1.5 mt-4">
        {['SEO tags', 'Screenshots', 'Meta desc', 'H1/H2', 'Schema'].map((tag) => (
          <span key={tag} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-[#484848] font-medium">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#FF385C] uppercase tracking-wider">How it works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#484848] mt-3 mb-4">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-lg text-[#767676] max-w-xl mx-auto">
            From video to blog post in under 5 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              {/* Shadow on hover */}

              {/* Step number */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-extrabold text-gray-100 group-hover:text-gray-200 transition-colors">
                  {step.number}
                </span>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: step.color }}
                >
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#484848] mb-2">{step.title}</h3>
              <p className="text-[#767676] text-sm leading-relaxed">{step.description}</p>

              {step.preview}
            </div>
          ))}
        </div>

        {/* Connector line (desktop only) */}
        <div className="hidden md:flex items-center justify-center mt-12 gap-4">
          <div className="h-0.5 w-20 bg-gray-300 rounded-full" />
          <svg className="w-4 h-4 text-[#FF385C]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="h-0.5 w-20 bg-gray-300 rounded-full" />
        </div>
      </div>
    </section>
  )
}
