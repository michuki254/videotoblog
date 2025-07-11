'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar'
import BillingSection from '../components/BillingSection'

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'security', name: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'billing', name: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-5 5v-5z' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="pb-8 flex">
        {/* Sidebar Component */}
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          user={user ? {
            firstName: user.firstName || undefined,
            emailAddresses: user.emailAddresses ? [{ emailAddress: user.emailAddresses[0]?.emailAddress || '' }] : undefined,
            imageUrl: user.imageUrl || undefined
          } : undefined}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 lg:ml-72">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 pt-8">
            {/* Header */}
            <div className="mb-8">
              <nav className="flex items-center space-x-2 text-sm mb-8">
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Dashboard
                </Link>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </span>
              </nav>

              {/* Premium Hero Section */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/30">
                        {user?.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || 'User'} 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold mb-2">{user?.fullName || 'Welcome'}</h1>
                      <p className="text-purple-100 text-lg">{user?.emailAddresses[0]?.emailAddress}</p>
                      <div className="flex items-center mt-3 space-x-4">
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Account
                        </span>
                        <span className="text-purple-100 text-sm">
                          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold mb-1">Pro</div>
                      <div className="text-sm text-purple-100">Plan Status</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold mb-1">100%</div>
                      <div className="text-sm text-purple-100">Profile Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-1">
                <nav className="flex overflow-x-auto bg-white rounded-xl">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-6 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg rounded-xl mx-1'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl mx-1'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Premium Tab Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={user?.fullName || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={user?.emailAddresses[0]?.emailAddress || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                          <input
                            type="text"
                            value={user?.id || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                          <input
                            type="text"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Profile Settings</h4>
                          <p className="text-sm text-gray-600">Manage your profile information and preferences</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-2 mr-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border border-green-200 rounded-xl shadow-md">
                          <div className="flex items-center">
                            <div className="bg-green-500 rounded-lg p-2 mr-4">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-green-900">Email Verified</h4>
                              <p className="text-sm text-green-700">Your email address has been verified</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md">
                          <div>
                            <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105">
                            Enable 2FA
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md">
                          <div>
                            <h4 className="font-bold text-gray-900">Password</h4>
                            <p className="text-sm text-gray-600">Last changed: Never</p>
                          </div>
                          <button className="px-5 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-semibold shadow-md">
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <BillingSection />
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-2 mr-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Notification Preferences</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { title: 'Email Notifications', description: 'Receive email updates about your conversions', enabled: true },
                          { title: 'Processing Complete', description: 'Get notified when video processing is finished', enabled: true },
                          { title: 'Weekly Summary', description: 'Receive weekly stats about your blog posts', enabled: false },
                          { title: 'Product Updates', description: 'Stay informed about new features and improvements', enabled: true },
                          { title: 'Marketing Emails', description: 'Receive promotional content and tips', enabled: false }
                        ].map((notification, index) => (
                          <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div>
                              <h4 className="font-bold text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600">{notification.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Danger Zone */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
              <div className="px-8 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  Danger Zone
                </h3>
              </div>
              <div className="p-8 bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Delete Account</h4>
                    <p className="text-gray-600 mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105">
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 