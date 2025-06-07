'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  HomeIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  FireIcon,
  DocumentDuplicateIcon,
  UsersIcon
} from '@heroicons/react/24/solid'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'Conversions', href: '/dashboard/conversions', icon: DocumentTextIcon, current: false },
  { name: 'Video Library', href: '/dashboard/videos', icon: VideoCameraIcon, current: false },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, current: false },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon, current: false },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon, current: false },
]

const recentConversions = [
  {
    id: 1,
    title: '10 Best React Hooks You Should Know',
    videoUrl: 'https://youtube.com/watch?v=example1',
    status: 'completed',
    createdAt: '2024-01-15',
    wordCount: 2500,
    views: 1250
  },
  {
    id: 2,
    title: 'Understanding JavaScript Closures',
    videoUrl: 'https://youtube.com/watch?v=example2',
    status: 'processing',
    createdAt: '2024-01-14',
    wordCount: 1800,
    views: 890
  },
  {
    id: 3,
    title: 'CSS Grid vs Flexbox - Complete Guide',
    videoUrl: 'https://youtube.com/watch?v=example3',
    status: 'completed',
    createdAt: '2024-01-13',
    wordCount: 3200,
    views: 2100
  },
  {
    id: 4,
    title: 'Node.js Express Tutorial for Beginners',
    videoUrl: 'https://youtube.com/watch?v=example4',
    status: 'completed',
    createdAt: '2024-01-12',
    wordCount: 2800,
    views: 1650
  }
]

const stats = [
  { name: 'Total Conversions', value: '47', change: '+12%', changeType: 'increase', icon: DocumentDuplicateIcon },
  { name: 'Words Generated', value: '125.4K', change: '+8.2%', changeType: 'increase', icon: DocumentTextIcon },
  { name: 'Total Views', value: '23.8K', change: '+15.3%', changeType: 'increase', icon: EyeIcon },
  { name: 'Active Subscribers', value: '2.4K', change: '+4.1%', changeType: 'increase', icon: UsersIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={classNames(
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            VideoBlog AI
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current
                    ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors'
                )}
              >
                <item.icon
                  className={classNames(
                    item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                    'mr-3 h-5 w-5 transition-colors'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-2 space-y-1">
              <Link
                href="/convert"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <PlusIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                New Conversion
              </Link>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-8 px-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monthly Usage</p>
                  <p className="text-2xl font-bold">47/50</p>
                </div>
                <FireIcon className="h-8 w-8 text-indigo-200" />
              </div>
              <div className="mt-3">
                <div className="bg-white bg-opacity-25 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-11/12"></div>
                </div>
                <p className="text-xs mt-1 text-indigo-100">3 conversions remaining</p>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                className="lg:hidden text-gray-400 hover:text-gray-600 mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/convert"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                New Conversion
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-6 py-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="bg-indigo-100 rounded-full p-3">
                      <stat.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={classNames(
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                      'text-sm font-medium'
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Conversions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Conversions</h2>
                  <Link
                    href="/dashboard/conversions"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Word Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentConversions.map((conversion) => (
                      <tr key={conversion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {conversion.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {conversion.videoUrl}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={classNames(
                            conversion.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800',
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full'
                          )}>
                            {conversion.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {conversion.wordCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {conversion.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(conversion.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <DocumentTextIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Blog post generated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <VideoCameraIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Video uploaded</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <ChartBarIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Analytics updated</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/convert"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <PlusIcon className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                      New Conversion
                    </span>
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <ChartBarIcon className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                      View Analytics
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 