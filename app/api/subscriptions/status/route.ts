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
    
    // Get user's subscription from database
    const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 })
    
    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        plan: 'FREE',
        status: 'inactive',
        usage: {
          videosThisMonth: 0,
          videosLimit: 2,
          storageUsedGB: 0,
          storageLimit: 1
        }
      })
    }

    // Calculate usage for current month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)
    
    // You can extend this to get actual usage from your posts/conversions
    const usage = {
      videosThisMonth: subscription.usage?.videosThisMonth || 0,
      videosLimit: subscription.limits?.videosPerMonth || 0,
      storageUsedGB: subscription.usage?.storageUsedGB || 0,
      storageLimit: subscription.limits?.storageGB || 0
    }

    return NextResponse.json({
      hasSubscription: true,
      plan: subscription.plan,
      status: subscription.status,
      subscriptionId: subscription.subscriptionId,
      customerId: subscription.customerId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      usage,
      billingInfo: {
        nextBillingDate: subscription.currentPeriodEnd,
        amount: subscription.plan === 'BASIC' ? 9.99 : 
                subscription.plan === 'PRO' ? 29.99 : 
                subscription.plan === 'ENTERPRISE' ? 99.99 : 0,
        currency: 'USD',
        interval: 'month'
      }
    })

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 