import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import { cancelUserSubscription } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    await connectDB()
    
    // Verify the subscription belongs to the user
    const subscription = await Subscription.findOne({ 
      userId, 
      subscriptionId 
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Cancel subscription with LemonSqueezy
    const cancelledSubscription = await cancelUserSubscription(subscriptionId)

    if (!cancelledSubscription) {
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    // Update subscription in database
    await Subscription.findOneAndUpdate(
      { userId, subscriptionId },
      { 
        status: 'cancelled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: cancelledSubscription
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 