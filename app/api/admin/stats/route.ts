import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    await connectDB()

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // User Statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    })
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    })

    // Subscription Statistics
    const totalSubscriptions = await Subscription.countDocuments()
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    })
    const newSubscriptionsThisMonth = await Subscription.countDocuments({
      createdAt: { $gte: startOfMonth }
    })

    // Plan Distribution
    const planDistribution = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ])

    // Monthly Revenue (estimated based on plan prices)
    const planPrices = {
      'FREE': 0,
      'BASIC': 9.99,
      'PRO': 29.99,
      'ENTERPRISE': 99.99
    }

    const monthlyRevenue = await Subscription.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ])

    let estimatedMonthlyRevenue = 0
    monthlyRevenue.forEach(item => {
      const price = planPrices[item._id as keyof typeof planPrices] || 0
      estimatedMonthlyRevenue += item.count * price
    })

    // User Growth Chart Data (last 12 months)
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    // Recent Activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt')
      .lean()

    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email plan status createdAt')
      .lean()

    // Usage Statistics
    const totalVideosConverted = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalVideosConverted' }
        }
      }
    ])

    const totalStorageUsed = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalStorageUsed' }
        }
      }
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        newLastMonth: newUsersLastMonth,
        growthRate: newUsersLastMonth > 0 
          ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
          : '0'
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        newThisMonth: newSubscriptionsThisMonth,
        planDistribution: planDistribution.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {} as Record<string, number>)
      },
      revenue: {
        estimatedMonthly: estimatedMonthlyRevenue,
        estimatedAnnual: estimatedMonthlyRevenue * 12
      },
      usage: {
        totalVideosConverted: totalVideosConverted[0]?.total || 0,
        totalStorageUsed: (totalStorageUsed[0]?.total || 0).toFixed(2)
      },
      charts: {
        userGrowth: userGrowthData.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          users: item.count
        }))
      },
      recent: {
        users: recentUsers,
        subscriptions: recentSubscriptions
      }
    })

  } catch (error) {
    console.error('Admin stats GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 