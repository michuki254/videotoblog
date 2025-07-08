import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import { getUserPlan } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, email, plan } = await request.json()

    if (!subscriptionId || !email || !plan) {
      return NextResponse.json({ 
        error: 'Missing required fields: subscriptionId, email, plan' 
      }, { status: 400 })
    }

    await connectDB()

    // Create or update subscription manually
    const subscriptionRecord = {
      userId,
      email,
      customerId: `manual_${Date.now()}`,
      subscriptionId,
      variantId: plan === 'BASIC' ? '849810' : plan === 'PRO' ? '849880' : '849874',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
      plan: plan as 'BASIC' | 'PRO' | 'ENTERPRISE',
      limits: {
        videosPerMonth: plan === 'BASIC' ? 20 : plan === 'PRO' ? 100 : -1,
        storageGB: plan === 'BASIC' ? 10 : plan === 'PRO' ? 50 : 500
      },
      usage: {
        videosThisMonth: 0,
        storageUsedGB: 0,
        lastResetDate: new Date()
      },
      webhookData: {
        manual_sync: true,
        synced_at: new Date().toISOString(),
        user_id: userId
      }
    }

    // Remove existing subscription for this user
    await Subscription.deleteMany({ userId })
    
    // Create new subscription
    const subscription = new Subscription(subscriptionRecord)
    await subscription.save()

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        subscriptionId: subscription.subscriptionId
      }
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 