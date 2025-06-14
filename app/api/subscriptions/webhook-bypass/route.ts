import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'
import { getUserPlan } from '@/lib/lemonsqueezy'

// TEMPORARY ENDPOINT - Remove after fixing webhook secret
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.text()
    const event = JSON.parse(body)
    const eventName = event.meta?.event_name
    const subscriptionData = event.data

    console.log('Bypass webhook received:', eventName)

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const customData = event.meta?.custom_data
      const userId = customData?.user_id

      if (!userId) {
        console.error('No userId found in webhook data')
        return NextResponse.json({ error: 'No userId found' }, { status: 400 })
      }

      const subscriptionRecord = {
        userId,
        email: subscriptionData.attributes.user_email,
        customerId: subscriptionData.attributes.customer_id.toString(),
        subscriptionId: subscriptionData.id,
        variantId: subscriptionData.attributes.variant_id.toString(),
        status: subscriptionData.attributes.status,
        currentPeriodStart: new Date(subscriptionData.attributes.created_at),
        currentPeriodEnd: new Date(subscriptionData.attributes.renews_at || subscriptionData.attributes.trial_ends_at),
        cancelAtPeriodEnd: subscriptionData.attributes.cancelled,
        plan: customData?.plan || getUserPlan(subscriptionData),
        limits: {
          videosPerMonth: customData?.plan === 'BASIC' ? 20 : 
                         customData?.plan === 'PRO' ? 100 : 
                         customData?.plan === 'ENTERPRISE' ? -1 : 2,
          storageGB: customData?.plan === 'BASIC' ? 10 : 
                    customData?.plan === 'PRO' ? 50 : 
                    customData?.plan === 'ENTERPRISE' ? 500 : 1
        },
        usage: {
          videosThisMonth: 0,
          storageUsedGB: 0,
          lastResetDate: new Date()
        },
        webhookData: event,
      }

      // Remove existing subscription for this user
      await Subscription.deleteMany({ userId })
      
      // Create new subscription
      const subscription = new Subscription(subscriptionRecord)
      await subscription.save()

      console.log('Subscription saved via bypass for user:', userId)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription saved via bypass',
        subscriptionId: subscriptionData.id,
        userId: userId,
        plan: subscriptionRecord.plan
      })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Bypass webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
} 