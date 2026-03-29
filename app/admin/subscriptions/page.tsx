'use client'

import { useEffect, useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  SparklesIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/20/solid'
import AdminChart from '@/components/AdminChart'

interface Subscription {
  _id: string
  userId: string
  email: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  usage: {
    videosThisMonth: number
    storageUsedGB: number
  }
  limits: {
    videosPerMonth: number
    storageGB: number
  }
  createdAt: string
  user?: {
    firstName?: string
    lastName?: string
    email: string
    imageUrl?: string
    isActive: boolean
  }
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Filters
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [pagination.page, search, planFilter, statusFilter])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(planFilter !== 'ALL' && { plan: planFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }

      const data = await response.json()
      setSubscriptions(data.subscriptions)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 border-orange-300'
      case 'PRO':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300'
      case 'BASIC':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // Calculate revenue stats
  const calculateRevenue = () => {
    const planPrices = {
      'FREE': 0,
      'BASIC': 9.99,
      'PRO': 29.99,
      'ENTERPRISE': 99.99
    }
    
    let monthly = 0
    let mrr = 0
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        const price = planPrices[sub.plan as keyof typeof planPrices] || 0
        monthly += price
        mrr += price
      }
    })
    
    return {
      monthly,
      annual: monthly * 12,
      mrr
    }
  }

  const revenue = calculateRevenue()

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
                  Subscription Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Monitor and manage all active subscriptions
                </p>
              </div>
              
              {/* Revenue Stats */}
              <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">${revenue.monthly.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">MRR</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{subscriptions.filter(s => s.status === 'active').length}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">${revenue.annual.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">ARR</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            {
              title: 'Total Revenue',
              value: `$${revenue.monthly.toFixed(2)}`,
              change: '+12.5%',
              icon: BanknotesIcon,
              gradient: 'from-green-600 to-emerald-600',
              bgGradient: 'from-green-50 to-emerald-50',
            },
            {
              title: 'Active Subscriptions',
              value: subscriptions.filter(s => s.status === 'active').length,
              change: `${subscriptions.filter(s => s.plan === 'PRO' || s.plan === 'ENTERPRISE').length} premium`,
              icon: CreditCardIcon,
              gradient: 'from-blue-600 to-indigo-600',
              bgGradient: 'from-blue-50 to-indigo-50',
            },
            {
              title: 'Churn Rate',
              value: '2.3%',
              change: '-0.5% vs last month',
              icon: ArrowTrendingUpIcon,
              gradient: 'from-purple-600 to-pink-600',
              bgGradient: 'from-purple-50 to-pink-50',
            },
            {
              title: 'Avg. Revenue/User',
              value: `$${subscriptions.length > 0 ? (revenue.monthly / subscriptions.filter(s => s.status === 'active').length).toFixed(2) : '0'}`,
              change: 'ARPU',
              icon: ChartBarIcon,
              gradient: 'from-orange-600 to-red-600',
              bgGradient: 'from-orange-50 to-red-50',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search with Animation */}
            <div className="relative flex-1 max-w-xl group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by email, customer name, or subscription ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  showFilters 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {(planFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {[planFilter !== 'ALL' && planFilter, statusFilter !== 'ALL' && statusFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              <button className="flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={fetchSubscriptions}
                className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Enhanced Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                  <div className="relative">
                    <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="ALL">All Plans</option>
                      <option value="FREE">Free</option>
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <CheckCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="past_due">Past Due</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Period</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="ALL">All Periods</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="ALL">All Time</option>
                      <option value="TODAY">Today</option>
                      <option value="WEEK">This Week</option>
                      <option value="MONTH">This Month</option>
                      <option value="YEAR">This Year</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setPlanFilter('ALL')
                    setStatusFilter('ALL')
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear all filters
                </button>
                <div className="text-sm text-gray-500">
                  Showing {subscriptions.length} of {pagination.total} subscriptions
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Subscriptions Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative inline-flex">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-spin"></div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-ping absolute inset-0"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Loading subscriptions...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Plan
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Usage
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Billing Period
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Revenue
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {subscriptions.map((subscription, index) => {
                    const planPrices = { 'FREE': 0, 'BASIC': 9.99, 'PRO': 29.99, 'ENTERPRISE': 99.99 }
                    const monthlyRevenue = planPrices[subscription.plan as keyof typeof planPrices] || 0
                    
                    return (
                      <tr key={subscription._id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 relative">
                              {subscription.user?.imageUrl ? (
                                <img
                                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-gray-200 group-hover:ring-orange-300 transition-all duration-200"
                                  src={subscription.user.imageUrl}
                                  alt=""
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-orange-300 transition-all duration-200">
                                  <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              )}
                              {subscription.status === 'active' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {subscription.user?.firstName} {subscription.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{subscription.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border ${getPlanBadgeColor(subscription.plan)}`}>
                            {subscription.plan === 'ENTERPRISE' && <StarIcon className="h-3 w-3 mr-1" />}
                            {subscription.plan === 'PRO' && <SparklesIcon className="h-3 w-3 mr-1" />}
                            {subscription.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusBadgeColor(subscription.status)}`}>
                              {subscription.status === 'active' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                              {subscription.status === 'cancelled' && <XCircleIcon className="h-3 w-3 mr-1" />}
                              {subscription.status === 'past_due' && <ExclamationCircleIcon className="h-3 w-3 mr-1" />}
                              {subscription.status}
                            </span>
                            {subscription.cancelAtPeriodEnd && (
                              <div className="text-xs text-red-600 mt-1 flex items-center">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Cancels at period end
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <DocumentDuplicateIcon className="h-4 w-4 mr-1 text-gray-400" />
                              <span className="font-medium text-gray-900">{subscription.usage.videosThisMonth}</span>
                              <span className="text-gray-500 mx-1">/</span>
                              <span className="text-gray-600">{subscription.limits.videosPerMonth === -1 ? '∞' : subscription.limits.videosPerMonth}</span>
                              <span className="text-gray-500 ml-1">videos</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                                style={{ width: `${subscription.limits.videosPerMonth === -1 ? 0 : (subscription.usage.videosThisMonth / subscription.limits.videosPerMonth) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <CloudArrowUpIcon className="h-3 w-3 mr-1" />
                              {subscription.usage.storageUsedGB.toFixed(2)} / {subscription.limits.storageGB === -1 ? '∞' : subscription.limits.storageGB} GB
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Started: {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-gray-900">
                              ${monthlyRevenue.toFixed(2)}<span className="text-sm font-normal text-gray-500">/mo</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ${(monthlyRevenue * 12).toFixed(2)}/yr
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-bold text-gray-900">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-bold text-gray-900">{pagination.total}</span> subscriptions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm bg-white border border-gray-200 divide-x divide-gray-200 overflow-hidden">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="hidden md:flex items-center px-2">
                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                          const pageNum = i + 1
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                              className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                pagination.page === pageNum
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        {pagination.pages > 5 && (
                          <>
                            <span className="mx-1 text-gray-400">...</span>
                            <button
                              onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
                              className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                pagination.page === pagination.pages
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pagination.pages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.pages}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                        <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Revenue Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue by Plan Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {Object.entries({
              'ENTERPRISE': subscriptions.filter(s => s.plan === 'ENTERPRISE' && s.status === 'active').length * 99.99,
              'PRO': subscriptions.filter(s => s.plan === 'PRO' && s.status === 'active').length * 29.99,
              'BASIC': subscriptions.filter(s => s.plan === 'BASIC' && s.status === 'active').length * 9.99,
              'FREE': 0
            }).map(([plan, revenue]) => {
              const percentage = revenue > 0 ? (revenue / calculateRevenue().monthly) * 100 : 0
              const planGradients = {
                FREE: 'from-gray-400 to-gray-500',
                BASIC: 'from-blue-500 to-blue-600',
                PRO: 'from-purple-500 to-purple-600',
                ENTERPRISE: 'from-amber-500 to-orange-600',
              }
              
              if (plan === 'FREE' && revenue === 0) return null
              
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-gradient-to-br ${planGradients[plan as keyof typeof planGradients]} rounded-lg flex items-center justify-center shadow-md`}>
                        {plan === 'ENTERPRISE' && <StarIcon className="h-4 w-4 text-white" />}
                        {plan === 'PRO' && <SparklesIcon className="h-4 w-4 text-white" />}
                        {plan === 'BASIC' && <span className="text-white font-bold text-xs">B</span>}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{plan}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">${revenue.toFixed(2)}</span>
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
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total MRR</span>
              <span className="text-xl font-bold text-gray-900">${calculateRevenue().monthly.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Subscription Status Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Status</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { status: 'Active', count: subscriptions.filter(s => s.status === 'active').length, color: 'green' },
              { status: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length, color: 'red' },
              { status: 'Past Due', count: subscriptions.filter(s => s.status === 'past_due').length, color: 'yellow' },
              { status: 'Trial', count: subscriptions.filter(s => s.status === 'trial').length, color: 'blue' },
            ].map((item) => (
              <div key={item.status} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{item.status}</span>
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-xs text-gray-500">
                  {((item.count / pagination.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
} 