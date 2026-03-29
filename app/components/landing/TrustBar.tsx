'use client'

const brands = ['Medium', 'Substack', 'Hashnode', 'Ghost', 'WordPress', 'Dev.to']

export default function TrustBar() {
  return (
    <section className="py-12 px-4 border-y border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <span className="text-xs font-semibold text-[#767676] uppercase tracking-widest flex-shrink-0">
            Used by teams at
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-lg font-bold text-[#484848]/20 hover:text-[#484848]/40 transition-colors cursor-default select-none"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
