import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'

export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }

    if (role && role !== 'ALL') {
      query.role = role
    }

    if (status === 'ACTIVE') {
      query.isActive = true
    } else if (status === 'INACTIVE') {
      query.isActive = false
    }

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalUsers = await User.countDocuments(query)

    // Get subscription data for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findByUserId(user.clerkId)
        return {
          ...user,
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            usage: subscription.usage
          } : null
        }
      })
    )

    return NextResponse.json({
      users: usersWithSubscriptions,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })

  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    await connectDB()

    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'User ID and updates are required' },
        { status: 400 }
      )
    }

    const user = await User.findByClerkId(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedUpdates = ['role', 'isActive']
    const updateData: any = {}

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key]
      }
    }

    Object.assign(user, updateData)
    await user.save()

    return NextResponse.json({
      success: true,
      user: user.toObject()
    })

  } catch (error) {
    console.error('Admin users PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 