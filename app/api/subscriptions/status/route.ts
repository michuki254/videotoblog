import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Subscription from '@/models/Subscription'
import { SUBSCRIPTION_PLANS, getUserPlan, hasActiveSubscription } from '@/lib/lemonsqueezy'
import mongoose from 'mongoose'

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get user subscription
    const subscription = await Subscription.findByUserId(userId)
    
    if (!subscription) {
      // User has no subscription - return free plan
      return NextResponse.json({
        plan: 'FREE',
        status: 'free',
        isActive: true,
        features: SUBSCRIPTION_PLANS.FREE.features,
        limits: SUBSCRIPTION_PLANS.FREE.limits,
        usage: {
          videosThisMonth: 0,
          storageUsedGB: 0,
        },
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })
    }

    // Reset monthly usage if needed
    await subscription.resetMonthlyUsage()

    const plan = getUserPlan(subscription)
    const isActive = hasActiveSubscription(subscription)
    const planData = SUBSCRIPTION_PLANS[plan]

    return NextResponse.json({
      plan,
      status: subscription.status,
      isActive,
      features: planData.features,
      limits: planData.limits,
      usage: {
        videosThisMonth: subscription.usage.videosThisMonth,
        storageUsedGB: subscription.usage.storageUsedGB,
      },
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      subscriptionId: subscription.subscriptionId,
    })

  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 