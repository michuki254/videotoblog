import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Get all subscriptions for this user
    const userSubscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 }).lean()
    
    // Get all subscriptions in database (for debugging)
    const allSubscriptions = await Subscription.find({}).sort({ createdAt: -1 }).limit(10).lean()
    
    return NextResponse.json({
      debug: true,
      currentUser: userId,
      userSubscriptions: userSubscriptions.map(sub => ({
        id: sub._id,
        userId: sub.userId,
        email: sub.email,
        plan: sub.plan,
        status: sub.status,
        subscriptionId: sub.subscriptionId,
        createdAt: sub.createdAt,
        currentPeriodEnd: sub.currentPeriodEnd
      })),
      totalUserSubscriptions: userSubscriptions.length,
      recentSubscriptions: allSubscriptions.map(sub => ({
        id: sub._id,
        userId: sub.userId,
        email: sub.email,
        plan: sub.plan,
        status: sub.status,
        createdAt: sub.createdAt
      })),
      totalSubscriptions: await Subscription.countDocuments(),
      message: userSubscriptions.length === 0 
        ? 'No subscriptions found for your user ID. This means the webhook is not working or the purchase was not linked to your account.'
        : `Found ${userSubscriptions.length} subscription(s) for your account.`
    })

  } catch (error: any) {
    console.error('Debug subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 