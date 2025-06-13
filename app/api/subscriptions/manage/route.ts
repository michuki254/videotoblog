import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Subscription from '@/models/Subscription'
import { cancelUserSubscription, updateUserSubscription, SUBSCRIPTION_PLANS } from '@/lib/lemonsqueezy'
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { action, plan } = await request.json()

    // Get user subscription
    const subscription = await Subscription.findByUserId(userId)
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    switch (action) {
      case 'cancel':
        return await handleCancelSubscription(subscription)
      
      case 'update':
        return await handleUpdateSubscription(subscription, plan)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Manage subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCancelSubscription(subscription: any) {
  try {
    const result = await cancelUserSubscription(subscription.subscriptionId)
    
    // Update local subscription record
    subscription.cancelAtPeriodEnd = true
    subscription.status = 'cancelled'
    await subscription.save()

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: result,
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

async function handleUpdateSubscription(subscription: any, newPlan: string) {
  try {
    // Validate new plan
    if (!newPlan || !SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const planData = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
    
    if (!('variantId' in planData) || !planData.variantId) {
      return NextResponse.json({ error: 'Plan variant ID not configured' }, { status: 500 })
    }

    const result = await updateUserSubscription(
      subscription.subscriptionId,
      planData.variantId
    )

    // Update local subscription record
    subscription.variantId = planData.variantId
    subscription.plan = newPlan
    await subscription.save()

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: result,
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
} 