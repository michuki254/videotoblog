import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import User from '@/models/User'

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
    const plan = searchParams.get('plan') || ''
    const status = searchParams.get('status') || ''

    // Build query
    const query: any = {}
    
    if (search) {
      query.email = { $regex: search, $options: 'i' }
    }

    if (plan && plan !== 'ALL') {
      query.plan = plan
    }

    if (status && status !== 'ALL') {
      query.status = status
    }

    // Get subscriptions with pagination
    const skip = (page - 1) * limit
    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalSubscriptions = await Subscription.countDocuments(query)

    // Get user data for each subscription
    const subscriptionsWithUsers = await Promise.all(
      subscriptions.map(async (subscription) => {
        const user = await User.findByClerkId(subscription.userId)
        return {
          ...subscription,
          user: user ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            imageUrl: user.imageUrl,
            isActive: user.isActive
          } : null
        }
      })
    )

    return NextResponse.json({
      subscriptions: subscriptionsWithUsers,
      pagination: {
        page,
        limit,
        total: totalSubscriptions,
        pages: Math.ceil(totalSubscriptions / limit)
      }
    })

  } catch (error) {
    console.error('Admin subscriptions GET error:', error)
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

    const { subscriptionId, updates } = await request.json()

    if (!subscriptionId || !updates) {
      return NextResponse.json(
        { error: 'Subscription ID and updates are required' },
        { status: 400 }
      )
    }

    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'plan', 'cancelAtPeriodEnd']
    const updateData: any = {}

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key]
      }
    }

    // Update limits based on plan
    if (updates.plan) {
      const planLimits = {
        'FREE': { videosPerMonth: 2, storageGB: 1 },
        'BASIC': { videosPerMonth: 20, storageGB: 10 },
        'PRO': { videosPerMonth: 100, storageGB: 50 },
        'ENTERPRISE': { videosPerMonth: -1, storageGB: 500 }
      }
      
      updateData.limits = planLimits[updates.plan as keyof typeof planLimits] || planLimits.FREE
    }

    Object.assign(subscription, updateData)
    await subscription.save()

    return NextResponse.json({
      success: true,
      subscription: subscription.toObject()
    })

  } catch (error) {
    console.error('Admin subscriptions PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('id')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    await Subscription.findByIdAndDelete(subscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    })

  } catch (error) {
    console.error('Admin subscriptions DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 