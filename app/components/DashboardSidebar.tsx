'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CogIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@clerk/nextjs'

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  user?: {
    firstName?: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    imageUrl?: string;
  };
}

export default function DashboardSidebar({ isSidebarOpen, setIsSidebarOpen, user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Convert Video', href: '/convert', icon: VideoCameraIcon },
    { name: 'My Posts', href: '/dashboard', icon: DocumentTextIcon },
    { 
      name: 'Pinterest Posts', 
      href: '/pinterest', 
      icon: (props: any) => (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0a12 12 0 0 0-4.373 23.182c-.011-.937-.019-2.379.327-3.4.353-.97 2.279-6.186 2.279-6.186s-.582-1.17-.582-2.9c0-2.718 1.573-4.748 3.529-4.748 1.664 0 2.469 1.25 2.469 2.748 0 1.675-1.064 4.18-1.614 6.5-.459 1.94.974 3.52 2.89 3.52 3.468 0 5.799-4.45 5.799-9.716 0-4.003-2.692-7.012-7.587-7.012-5.539 0-8.979 4.131-8.979 8.74 0 1.598.457 2.726 1.175 3.594.332.407.376.568.256 1.035-.084.326-.283 1.11-.363 1.42-.12.455-.485.617-.892.45-2.498-1.017-3.661-3.74-3.661-6.796 0-5.054 4.26-11.11 12.695-11.11 6.783 0 11.246 4.902 11.246 10.166 0 6.967-3.868 12.182-9.57 12.182-1.916 0-3.718-1.035-4.336-2.21 0 0-1.03 4.083-1.248 4.867-.376 1.366-1.11 2.732-1.775 3.794 1.58.47 3.254.723 4.99.723 9.142 0 16.558-7.416 16.558-16.558C28.558 7.416 21.142 0 12 0z" />
        </svg>
      )
    },
  ]

  const secondaryNavigation = [
    { name: 'Upgrade', href: '/dashboard/upgrade', icon: SparklesIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'Account', href: '/account', icon: UserIcon },
  ]

  const quickActions = [
    {
      name: 'Logout',
      onClick: () => signOut({ redirectUrl: '/' }),
      icon: ArrowRightOnRectangleIcon,
      type: 'button' as const
    }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl overflow-y-auto">
          {/* Logo/Brand Section */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-slate-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">VideotoBlog</h2>
              <p className="text-sm text-slate-300">AI Platform</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="User avatar" 
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
                  {user?.firstName || 'Welcome!'}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {user?.emailAddresses?.[0]?.emailAddress || 'User'}
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02]' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:transform hover:scale-[1.01]'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
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
          <div className="flex-shrink-0 border-t border-slate-700/50 p-4">
            <nav className="space-y-2">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
                      `}
                    aria-hidden="true"
                  />
                    {item.name}
                </Link>
                )
              })}
            </nav>
            
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <nav className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={action.onClick}
                    className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out text-red-300 hover:text-red-100 hover:bg-red-900/20"
                  >
                    <action.icon
                      className="mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 text-red-400 group-hover:text-red-200"
                    aria-hidden="true"
                  />
                    {action.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-white p-3 rounded-xl shadow-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 flex z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  className="ml-1 flex items-center justify-center h-12 w-12 rounded-xl bg-slate-800/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              {/* Mobile sidebar content */}
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                {/* Logo/Brand Section - Mobile */}
                <div className="flex items-center flex-shrink-0 px-6 pb-6 border-b border-slate-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-white">VideotoBlog</h2>
                    <p className="text-sm text-slate-300">AI Platform</p>
                  </div>
                </div>

                {/* User Profile Section - Mobile */}
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt="User avatar" 
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
                        {user?.firstName || 'Welcome!'}
                      </p>
                      <p className="text-xs text-slate-300 truncate">
                        {user?.emailAddresses?.[0]?.emailAddress || 'User'}
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
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }
                        `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                        <item.icon
                          className={`
                            mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200
                            ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
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
              <div className="flex-shrink-0 border-t border-slate-700/50 p-4">
                <nav className="space-y-2">
                  {secondaryNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                  <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }
                        `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                        <item.icon
                          className={`
                            mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200
                            ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
                          `}
                      aria-hidden="true"
                    />
                        {item.name}
                  </Link>
                    )
                  })}
                </nav>
                
                {/* Quick Actions - Mobile */}
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <nav className="space-y-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.name}
                        onClick={() => {
                          action.onClick()
                          setIsSidebarOpen(false)
                        }}
                        className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out text-red-300 hover:text-red-100 hover:bg-red-900/20"
                      >
                        <action.icon
                          className="mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-200 text-red-400 group-hover:text-red-200"
                      aria-hidden="true"
                    />
                        {action.name}
                      </button>
                    ))}
                </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 