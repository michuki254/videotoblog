'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

interface NavigationProps {
  variant?: 'default' | 'home'
}

export default function Navigation({ variant = 'default' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { isSignedIn, user, isLoaded } = useUser()

  const isHome = variant === 'home'

  const linkStyle = "text-[#484848] hover:text-[#FF385C] transition-colors text-sm font-medium"
  const mobileLinkStyle = "block px-3 py-2.5 text-[#484848] hover:text-[#FF385C] transition-colors font-medium"

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isHome ? 'bg-white/90 backdrop-blur-md border-b border-gray-100' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-[#FF385C] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 10l3.5 2.5L8 15V10z" fill="currentColor" />
                <path d="M17 7l4-2v14l-4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#484848]">VideoBlog AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-7">
            <Link href="/pricing" className={linkStyle}>Pricing</Link>
            <Link href="/blog" className={linkStyle}>Blog</Link>
            <Link href="/about" className={linkStyle}>About</Link>
            <Link href="/affiliates" className={linkStyle}>Affiliates</Link>
            <Link href="/contact" className={linkStyle}>Contact</Link>
            {isSignedIn && (
              <Link href="/dashboard" className="bg-[#FF385C] text-white px-5 py-2 rounded-lg hover:bg-[#E0314F] transition-colors text-sm font-semibold">
                Dashboard
              </Link>
            )}

            {/* Auth */}
            {isLoaded && (
              <div className="flex items-center space-x-3 ml-2 pl-4 border-l border-gray-200">
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-[#767676]">
                      {user.firstName || user.emailAddresses[0].emailAddress}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <SignInButton mode="modal">
                      <button className="text-sm font-medium text-[#484848] hover:text-[#FF385C] transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-[#FF385C] text-white px-5 py-2 rounded-lg hover:bg-[#E0314F] transition-colors text-sm font-semibold">
                        Get Started
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#484848] hover:text-[#FF385C] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <Link href="/pricing" className={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="/blog" className={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <Link href="/about" className={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link href="/affiliates" className={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>
                Affiliates
              </Link>
              <Link href="/contact" className={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isSignedIn && (
                <Link href="/dashboard" className="block mx-3 mt-2 text-center bg-[#FF385C] text-white px-4 py-2.5 rounded-lg hover:bg-[#E0314F] transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}

              {/* Mobile Authentication */}
              {isLoaded && (
                <div className="px-3 pt-3 mt-2 border-t border-gray-100">
                  {isSignedIn ? (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-[#767676]">
                        {user.firstName || user.emailAddresses[0].emailAddress}
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <SignInButton mode="modal">
                        <button className="w-full text-left py-2.5 text-[#484848] hover:text-[#FF385C] transition-colors font-medium">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="w-full bg-[#FF385C] text-white px-4 py-2.5 rounded-lg hover:bg-[#E0314F] transition-colors font-semibold">
                          Get Started
                        </button>
                      </SignUpButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
