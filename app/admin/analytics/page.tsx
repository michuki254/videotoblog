'use client'

import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  BanknotesIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/20/solid'
import AdminChart from '@/components/AdminChart'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalRevenue: number
    conversionRate: number
    avgSessionDuration: string
  }
  userGrowth: Array<{ date: string; users: number }>
  revenueGrowth: Array<{ date: string; revenue: number }>
  planDistribution: Record<string, number>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  topContent: Array<{
    title: string
    views: number
    conversions: number
  }>
  conversionFunnel: {
    visitors: number
    signups: number
    trialUsers: number
    paidUsers: number
  }
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [compareMode, setCompareMode] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Fallback to simulated data if API fails
      setAnalyticsData({
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          totalRevenue: 0,
          conversionRate: 0,
          avgSessionDuration: '0m 0s'
        },
        userGrowth: [],
        revenueGrowth: [],
        planDistribution: {
          'FREE': 0,
          'BASIC': 0,
          'PRO': 0,
          'ENTERPRISE': 0
        },
        deviceBreakdown: {
          desktop: 0,
          mobile: 0,
          tablet: 0
        },
        topContent: [],
        conversionFunnel: {
          visitors: 0,
          signups: 0,
          trialUsers: 0,
          paidUsers: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-spin"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-ping absolute inset-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  const metricCards = [
    {
      title: 'Total Users',
      value: analyticsData.overview.totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      title: 'Total Revenue',
      value: `$${analyticsData.overview.totalRevenue.toLocaleString()}`,
      change: '+18.2%',
      trend: 'up',
      icon: BanknotesIcon,
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Conversion Rate',
      value: `${analyticsData.overview.conversionRate}%`,
      change: '+0.8%',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Active Users',
      value: analyticsData.overview.activeUsers.toLocaleString(),
      change: '-2.3%',
      trend: 'down',
      icon: FireIcon,
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Premium Header */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 opacity-10 blur-3xl"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Comprehensive insights and performance metrics
                </p>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
                  {(['day', 'week', 'month', 'year'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        timeRange === range
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last updated: Just now</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">45,320 total views this {timeRange}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-50`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${metric.gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="h-64">
              <AdminChart
                data={{
                  labels: analyticsData.userGrowth.map(item => item.date),
                  values: analyticsData.userGrowth.map(item => item.users)
                }}
                type="line"
                color="indigo"
                height={240}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">New Users</p>
                <p className="text-lg font-bold text-gray-900">+{analyticsData.overview.newUsers}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Growth Rate</p>
                <p className="text-lg font-bold text-green-600">+12.5%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Active Rate</p>
                <p className="text-lg font-bold text-gray-900">67.5%</p>
              </div>
            </div>
          </div>

          {/* Revenue Growth Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">MRR</span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="h-64">
              <AdminChart
                data={{
                  labels: analyticsData.revenueGrowth.map(item => item.date),
                  values: analyticsData.revenueGrowth.map(item => item.revenue)
                }}
                type="bar"
                color="green"
                height={240}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">MRR</p>
                <p className="text-lg font-bold text-gray-900">${(analyticsData.overview.totalRevenue / 12).toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">ARR</p>
                <p className="text-lg font-bold text-gray-900">${analyticsData.overview.totalRevenue}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">ARPU</p>
                <p className="text-lg font-bold text-gray-900">${((analyticsData.overview.totalRevenue / 12) / analyticsData.overview.activeUsers).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Plan Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData.planDistribution).map(([plan, count]) => {
                const total = Object.values(analyticsData.planDistribution).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                const planGradients = {
                  FREE: 'from-gray-400 to-gray-500',
                  BASIC: 'from-blue-500 to-blue-600',
                  PRO: 'from-purple-500 to-purple-600',
                  ENTERPRISE: 'from-amber-500 to-orange-600',
                }
                
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${planGradients[plan as keyof typeof planGradients]} rounded-lg flex items-center justify-center shadow-md`}>
                          {plan === 'ENTERPRISE' && <StarIcon className="h-4 w-4 text-white" />}
                          {plan === 'PRO' && <SparklesIcon className="h-4 w-4 text-white" />}
                          {plan === 'BASIC' && <span className="text-white font-bold text-xs">B</span>}
                          {plan === 'FREE' && <span className="text-white font-bold text-xs">F</span>}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{plan}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
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
          </div>

          {/* Device Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Device Usage</h3>
            <div className="space-y-4">
              {[
                { device: 'Desktop', percentage: analyticsData.deviceBreakdown.desktop, icon: ComputerDesktopIcon, color: 'blue' },
                { device: 'Mobile', percentage: analyticsData.deviceBreakdown.mobile, icon: DevicePhoneMobileIcon, color: 'green' },
                { device: 'Tablet', percentage: analyticsData.deviceBreakdown.tablet, icon: DevicePhoneMobileIcon, color: 'purple' },
              ].map((item) => (
                <div key={item.device}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                      <span className="text-sm font-medium text-gray-700">{item.device}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full bg-${item.color}-500 transition-all duration-1000 ease-out`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg. Session Duration</span>
                <span className="font-bold text-gray-900">{analyticsData.overview.avgSessionDuration}</span>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {[
                { stage: 'Visitors', count: analyticsData.conversionFunnel.visitors, percentage: 100 },
                { stage: 'Sign-ups', count: analyticsData.conversionFunnel.signups, percentage: (analyticsData.conversionFunnel.signups / analyticsData.conversionFunnel.visitors) * 100 },
                { stage: 'Trial Users', count: analyticsData.conversionFunnel.trialUsers, percentage: (analyticsData.conversionFunnel.trialUsers / analyticsData.conversionFunnel.visitors) * 100 },
                { stage: 'Paid Users', count: analyticsData.conversionFunnel.paidUsers, percentage: (analyticsData.conversionFunnel.paidUsers / analyticsData.conversionFunnel.visitors) * 100 },
              ].map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm font-bold text-gray-900">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">{stage.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <ArrowTrendingDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Performing Content</h3>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Conversions</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {analyticsData.topContent.map((content, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                          <DocumentDuplicateIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">{content.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{content.views.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{content.conversions}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-green-600">
                          {((content.conversions / content.views) * 100).toFixed(2)}%
                        </span>
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 ml-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}