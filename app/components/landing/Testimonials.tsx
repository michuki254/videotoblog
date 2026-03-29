'use client'

const testimonials = [
  {
    quote: 'Cut my content production time from 6 hours to 30 minutes. This is a game-changer for my blog.',
    name: 'Sarah Martinez',
    role: 'Tech Blogger',
    initials: 'SM',
    color: '#00A699',
  },
  {
    quote: 'The SEO optimization alone is worth it. My articles are ranking on page 1 consistently now.',
    name: 'James Chen',
    role: 'Marketing Agency',
    initials: 'JC',
    color: '#FC642D',
  },
  {
    quote: 'I repurpose my YouTube content into blog posts effortlessly. Doubled my organic traffic in 2 months.',
    name: 'Emma Patel',
    role: 'Content Creator',
    initials: 'EP',
    color: '#FF385C',
  },
]

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#FC642D] uppercase tracking-wider">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#484848] mt-3 mb-4">
            Loved by creators
          </h2>
          <p className="text-lg text-[#767676] max-w-xl mx-auto">
            See what our users are saying about VideoBlog AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group bg-[#FAFAFA] rounded-2xl p-8 border border-gray-100 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              <StarRating />

              <blockquote className="mt-5 mb-6">
                <p className="text-[#484848] leading-relaxed text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#484848]">{t.name}</div>
                  <div className="text-xs text-[#767676]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
