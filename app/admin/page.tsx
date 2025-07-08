'use client'

import { useEffect, useState } from 'react'
import {
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'

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
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Active Subscriptions',
      value: stats.subscriptions.active.toLocaleString(),
      change: `+${stats.subscriptions.newThisMonth} this month`,
      changeType: 'positive',
      icon: CreditCardIcon,
      color: 'green',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue.estimatedMonthly.toLocaleString()}`,
      change: `$${stats.revenue.estimatedAnnual.toLocaleString()} annually`,
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'purple',
    },
    {
      title: 'Videos Converted',
      value: stats.usage.totalVideosConverted.toLocaleString(),
      change: `${stats.usage.totalStorageUsed} GB storage`,
      changeType: 'neutral',
      icon: DocumentTextIcon,
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your SaaS application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'positive' && (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {stat.changeType === 'negative' && (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Plan Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
          <div className="space-y-4">
            {Object.entries(stats.subscriptions.planDistribution).map(([plan, count]) => {
              const percentage = stats.subscriptions.total > 0 
                ? ((count / stats.subscriptions.total) * 100).toFixed(1)
                : '0'
              
              const planColors = {
                FREE: 'bg-gray-200',
                BASIC: 'bg-blue-500',
                PRO: 'bg-purple-500',
                ENTERPRISE: 'bg-orange-500',
              }

              return (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${planColors[plan as keyof typeof planColors] || 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">New Users</h4>
              <div className="space-y-2">
                {stats.recent.users.slice(0, 3).map((user, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">
                      {user.firstName} {user.lastName} ({user.email})
                    </span>
                    <span className="text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">New Subscriptions</h4>
              <div className="space-y-2">
                {stats.recent.subscriptions.slice(0, 3).map((sub, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{sub.email}</span>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.plan === 'PRO' ? 'bg-purple-100 text-purple-800' :
                        sub.plan === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                        sub.plan === 'ENTERPRISE' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.plan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </button>
          <button
            onClick={() => window.location.href = '/admin/subscriptions'}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            View Subscriptions
          </button>
          <button
            onClick={() => window.location.href = '/admin/analytics'}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Analytics
          </button>
        </div>
      </div>
    </div>
  )
} 