'use client'

import Navigation from './components/Navigation'
import Footer from './components/Footer'
import HeroSection from './components/landing/HeroSection'
import TrustBar from './components/landing/TrustBar'
import HowItWorks from './components/landing/HowItWorks'
import Features from './components/landing/Features'
import Testimonials from './components/landing/Testimonials'
import CTASection from './components/landing/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#484848] font-sans selection:bg-[#FF385C] selection:text-white">
      <Navigation variant="home" />
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  )
}
