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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isHome ? 'bg-white/90 backdrop-blur-md border-b border-gray-200' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">VideoBlog AI</span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            {isSignedIn && (
              <>
                <Link href="/convert" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Convert
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </>
            )}
            <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/affiliates" className="text-gray-700 hover:text-blue-600 transition-colors">
              Affiliates
            </Link>

            {/* Authentication Buttons */}
            {isLoaded && (
              <div className="flex items-center space-x-4">
                {isSignedIn ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <SignInButton mode="modal">
                      <button className="text-gray-700 hover:text-blue-600 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
              className="text-gray-700 hover:text-blue-600 transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              {isSignedIn && (
                <>
                  <Link href="/convert" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                    Convert
                  </Link>
                  <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                </>
              )}
              <Link href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Features
                </Link>
              <Link href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/affiliates" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Affiliates
              </Link>
              
              {/* Mobile Authentication */}
              {isLoaded && (
                <div className="px-3 py-2 border-t border-gray-200">
                  {isSignedIn ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {user.firstName || user.emailAddresses[0].emailAddress}
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <SignInButton mode="modal">
                        <button className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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