'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  variant?: 'default' | 'transparent'
  className?: string
}

export default function Navigation({ variant = 'default', className = '' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Smart navigation items that adapt based on current page
  const getNavItems = () => {
    const isHomePage = pathname === '/'
    
    return [
      { 
        label: 'Features', 
        href: isHomePage ? '#features' : '/#features' 
      },
      { 
        label: 'How it Works', 
        href: '/how-it-works' 
      },
      { 
        label: 'Pricing', 
        href: '/pricing' 
      },
      { 
        label: 'Dashboard', 
        href: '/dashboard' 
      },
    ]
  }

  const navItems = getNavItems()

  const baseClasses = variant === 'transparent' 
    ? 'fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200'
    : 'w-full bg-white border-b border-gray-200'

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    
    // If it's a hash link and we're on a different page, navigate to home first
    if (href.startsWith('/#') && pathname !== '/') {
      if (typeof window !== 'undefined') {
        window.location.href = href
      }
    }
  }

  return (
    <nav className={`${baseClasses} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              VideoBlog AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              // Check if this is the current page (simplified, no hash checking)
              const isActive = (
                (item.href === '/how-it-works' && pathname === '/how-it-works') ||
                (item.href === '/pricing' && pathname === '/pricing') ||
                (item.href === '/dashboard' && pathname.startsWith('/dashboard'))
              )

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-colors font-medium ${
                    isActive 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link 
              href="/convert" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm hover:shadow-md"
            >
              Try Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium px-2 py-1"
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                href="/convert" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-center mx-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 