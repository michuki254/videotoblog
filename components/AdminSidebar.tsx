'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface AdminSidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  user: any
}

export default function AdminSidebar({ isSidebarOpen, setIsSidebarOpen, user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ]

  const quickActions = [
    {
      name: 'Back to User Dashboard',
      onClick: () => window.location.href = '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Sign Out',
      onClick: () => signOut(),
      icon: ShieldCheckIcon,
    },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-red-900 to-red-800 shadow-xl">
          {/* Logo/Brand Section */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-red-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              <p className="text-sm text-red-200">VideotoBlog</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-red-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Admin avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-red-200 truncate">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                      ${isActive 
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg transform scale-[1.02]' 
                        : 'text-red-200 hover:text-white hover:bg-red-700/50 hover:transform hover:scale-[1.01]'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-red-300 group-hover:text-red-100'}
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Bottom Navigation */}
          <div className="flex-shrink-0 border-t border-red-700/50 p-4">
            <nav className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out text-red-200 hover:text-white hover:bg-red-700/50"
                >
                  <action.icon
                    className="mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 text-red-300 group-hover:text-red-100"
                    aria-hidden="true"
                  />
                  {action.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 flex z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-red-900 to-red-800 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  className="ml-1 flex items-center justify-center h-12 w-12 rounded-xl bg-red-800/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              {/* Mobile sidebar content */}
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                {/* Logo/Brand Section - Mobile */}
                <div className="flex items-center flex-shrink-0 px-6 pb-6 border-b border-red-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <p className="text-sm text-red-200">VideotoBlog</p>
                  </div>
                </div>

                {/* User Profile Section - Mobile */}
                <div className="px-6 py-4 border-b border-red-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt="Admin avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.firstName || 'Admin'}
                      </p>
                      <p className="text-xs text-red-200 truncate">
                        Administrator
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation - Mobile */}
                <nav className="flex-1 px-4 pt-6 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                          ${isActive 
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                            : 'text-red-200 hover:text-white hover:bg-red-700/50'
                          }
                        `}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon
                          className={`
                            mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200
                            ${isActive ? 'text-white' : 'text-red-300 group-hover:text-red-100'}
                          `}
                          aria-hidden="true"
                        />
                        {item.name}
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              
              {/* Bottom Navigation - Mobile */}
              <div className="flex-shrink-0 border-t border-red-700/50 p-4">
                <nav className="space-y-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.name}
                      onClick={() => {
                        action.onClick()
                        setIsSidebarOpen(false)
                      }}
                      className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out text-red-200 hover:text-white hover:bg-red-700/50"
                    >
                      <action.icon
                        className="mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 text-red-300 group-hover:text-red-100"
                        aria-hidden="true"
                      />
                      {action.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 