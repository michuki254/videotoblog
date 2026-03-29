'use client'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: '10x Faster',
    description: 'What takes 4 hours manually takes 5 minutes. Spend your time editing, not writing from scratch.',
    color: '#FF385C',
    stat: '5 min',
    statLabel: 'avg. generation time',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'SEO Built-In',
    description: 'Schema markup, meta tags, keyword optimization, and proper heading structure — all automatic.',
    color: '#FC642D',
    stat: 'Page 1',
    statLabel: 'ranking potential',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Smart Screenshots',
    description: 'AI identifies and captures the most important visual moments to illustrate your article.',
    color: '#00A699',
    stat: 'Auto',
    statLabel: 'image selection',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: '40+ Languages',
    description: 'Translate and localize content for global audiences with a single click.',
    color: '#00A699',
    stat: '40+',
    statLabel: 'languages supported',
  },
]

export default function Features() {
  return (
    <section className="py-24 px-4 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#00A699] uppercase tracking-wider">Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#484848] mt-3 mb-4">
            Why creators love us
          </h2>
          <p className="text-lg text-[#767676] max-w-xl mx-auto">
            Everything you need to rank higher and publish faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Solid accent bar on hover */}
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: feature.color }}
              />

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#484848] mb-2">{feature.title}</h3>
                  <p className="text-[#767676] text-sm leading-relaxed">{feature.description}</p>
                </div>

                {/* Stat badge */}
                <div className="ml-6 text-right flex-shrink-0">
                  <div className="text-2xl font-extrabold text-[#484848]">{feature.stat}</div>
                  <div className="text-xs text-[#767676] mt-0.5">{feature.statLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
