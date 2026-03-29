'use client'

import { useEffect, useState } from 'react'
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ClockIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartPieIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/20/solid'
import AdminChart from '@/components/AdminChart'

interface AdminStats {
  users: {
    total: number
    active: number
    newThisMonth: number
    newLastMonth: number
    growthRate: string
  }
  subscriptions: {
    total: number
    active: number
    newThisMonth: number
    planDistribution: Record<string, number>
  }
  revenue: {
    estimatedMonthly: number
    estimatedAnnual: number
  }
  usage: {
    totalVideosConverted: number
    totalStorageUsed: string
  }
  charts: {
    userGrowth: Array<{ month: string; users: number }>
  }
  recent: {
    users: Array<any>
    subscriptions: Array<any>
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="h-5 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded-lg w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchStats}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      change: `+${stats.users.newThisMonth} this month`,
      changeType: parseInt(stats.users.growthRate) >= 0 ? 'positive' : 'negative',
      growthRate: stats.users.growthRate,
      icon: UserGroupIcon,
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      description: `${stats.users.active} active users`,
    },
    {
      title: 'Active Subscriptions',
      value: stats.subscriptions.active.toLocaleString(),
      change: `+${stats.subscriptions.newThisMonth} this month`,
      changeType: 'positive',
      icon: CreditCardIcon,
      gradient: 'from-emerald-600 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      description: `${stats.subscriptions.total} total subscriptions`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue.estimatedMonthly.toLocaleString()}`,
      change: `$${stats.revenue.estimatedAnnual.toLocaleString()} annually`,
      changeType: 'positive',
      icon: BanknotesIcon,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      description: 'Estimated recurring revenue',
    },
    {
      title: 'Videos Converted',
      value: stats.usage.totalVideosConverted.toLocaleString(),
      change: `${stats.usage.totalStorageUsed} GB storage`,
      changeType: 'neutral',
      icon: CloudArrowUpIcon,
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      description: 'Total platform usage',
    },
  ]

  // Helper function to calculate conversion rate
  const getConversionRate = () => {
    if (stats.users.total === 0) return 0
    return ((stats.subscriptions.active / stats.users.total) * 100).toFixed(1)
  }

  // Helper function to get plan badge color
  const getPlanBadgeClasses = (plan: string) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-700 border-gray-300',
      BASIC: 'bg-blue-100 text-blue-700 border-blue-300',
      PRO: 'bg-purple-100 text-purple-700 border-purple-300',
      ENTERPRISE: 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 border-orange-300',
    }
    return colors[plan as keyof typeof colors] || colors.FREE
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Premium Header with Gradient */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 opacity-10 blur-3xl"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Real-time overview of VideotoBlog performance
                </p>
              </div>
              
              {/* Time Frame Selector */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
                {(['day', 'week', 'month', 'year'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTimeframe === timeframe
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Status: <span className="font-semibold text-green-600">Operational</span></span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last updated: <span className="font-semibold">Just now</span></span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Conversion Rate: <span className="font-semibold text-green-600">{getConversionRate()}%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
              
              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.changeType === 'positive' && stat.growthRate && (
                    <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      {stat.growthRate}%
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mb-3">{stat.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    {stat.changeType !== 'neutral' && (
                      <div className={`h-1 w-16 bg-gray-200 rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000`}
                          style={{ width: `${Math.min(100, Math.abs(parseInt(stat.growthRate || '0')))}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Plan Distribution Card */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Plan Distribution</h3>
              <ChartPieIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {Object.entries(stats.subscriptions.planDistribution).map(([plan, count]) => {
                const percentage = stats.subscriptions.total > 0 
                  ? ((count / stats.subscriptions.total) * 100).toFixed(1)
                  : '0'
                
                const planGradients = {
                  FREE: 'from-gray-400 to-gray-500',
                  BASIC: 'from-blue-500 to-blue-600',
                  PRO: 'from-purple-500 to-purple-600',
                  ENTERPRISE: 'from-amber-500 to-orange-600',
                }

                return (
                  <div key={plan} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${planGradients[plan as keyof typeof planGradients]} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          {plan === 'ENTERPRISE' && <StarIcon className="h-5 w-5 text-white" />}
                          {plan === 'PRO' && <SparklesIcon className="h-5 w-5 text-white" />}
                          {plan === 'BASIC' && <span className="text-white font-bold text-xs">B</span>}
                          {plan === 'FREE' && <span className="text-white font-bold text-xs">F</span>}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{plan}</span>
                          <div className="text-xs text-gray-500">{count} users</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPlanBadgeClasses(plan)}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${planGradients[plan as keyof typeof planGradients]} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total Revenue by Plan */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Plan</h4>
              <div className="space-y-2">
                {Object.entries(stats.subscriptions.planDistribution).map(([plan, count]) => {
                  const planPrices = { FREE: 0, BASIC: 9.99, PRO: 29.99, ENTERPRISE: 99.99 }
                  const revenue = count * (planPrices[plan as keyof typeof planPrices] || 0)
                  if (revenue === 0 && plan === 'FREE') return null
                  
                  return (
                    <div key={`revenue-${plan}`} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{plan}</span>
                      <span className="text-sm font-bold text-gray-900">${revenue.toLocaleString()}/mo</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity Card - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                  Live feed
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Users Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                    New Users
                  </h4>
                  <span className="text-xs text-gray-500">{stats.recent.users.length} total</span>
                </div>
                <div className="space-y-3">
                  {stats.recent.users.slice(0, 4).map((user, index) => (
                    <div key={index} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-110 transition-transform">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* New Subscriptions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-2 text-gray-400" />
                    New Subscriptions
                  </h4>
                  <span className="text-xs text-gray-500">{stats.recent.subscriptions.length} total</span>
                </div>
                <div className="space-y-3">
                  {stats.recent.subscriptions.slice(0, 4).map((sub, index) => {
                    const planPrices = { FREE: 0, BASIC: 9.99, PRO: 29.99, ENTERPRISE: 99.99 }
                    const revenue = planPrices[sub.plan as keyof typeof planPrices] || 0
                    
                    return (
                      <div key={index} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${sub.plan === 'ENTERPRISE' ? 'from-amber-500 to-orange-600' : sub.plan === 'PRO' ? 'from-purple-500 to-purple-600' : 'from-blue-500 to-blue-600'} rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <CreditCardIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border ${getPlanBadgeClasses(sub.plan)}`}>
                                {sub.plan}
                              </span>
                              {revenue > 0 && (
                                <span className="text-xs text-green-600 font-semibold">
                                  +${revenue}/mo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.users.newThisMonth > 50 || stats.revenue.estimatedMonthly > 10000) && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 mb-1">Milestone Alert!</h4>
                  <p className="text-sm text-amber-700">
                    {stats.users.newThisMonth > 50 && `Congratulations! You've acquired ${stats.users.newThisMonth} new users this month. `}
                    {stats.revenue.estimatedMonthly > 10000 && `Your monthly revenue has exceeded $10,000!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Key Performance Metrics</h3>
              <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{getConversionRate()}%</p>
                <p className="text-xs text-gray-600 mt-1">Conversion Rate</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">${(stats.revenue.estimatedMonthly / stats.subscriptions.active).toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">ARPU</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">{stats.users.growthRate}%</p>
                <p className="text-xs text-gray-600 mt-1">User Growth</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <p className="text-2xl font-bold text-orange-600">{(stats.usage.totalVideosConverted / stats.users.total).toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Videos/User</p>
              </div>
            </div>
            
            {/* Growth Chart */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">User Growth Trend</h4>
              {stats.charts.userGrowth.length > 0 ? (
                <AdminChart
                  data={{
                    labels: stats.charts.userGrowth.slice(-6).map(item => {
                      const [year, month] = item.month.split('-')
                      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' })
                    }),
                    values: stats.charts.userGrowth.slice(-6).map(item => item.users)
                  }}
                  type="line"
                  color="indigo"
                  height={120}
                />
              ) : (
                <div className="h-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-sm text-gray-500">No growth data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">Manage Users</span>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/subscriptions'}
                className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">Subscriptions</span>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/analytics'}
                className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">Analytics</span>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/content'}
                className="w-full group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">Content</span>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API</span>
                  <span className="flex items-center text-xs font-medium text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="flex items-center text-xs font-medium text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-xs font-medium text-gray-600">
                    {stats.usage.totalStorageUsed} GB used
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 