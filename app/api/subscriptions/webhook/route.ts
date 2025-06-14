import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getUserPlan } from '@/lib/lemonsqueezy'
import { connectDB } from '@/lib/mongodb'
import Subscription from '@/models/Subscription'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
      console.log('Webhook signature verification failed')
      console.log('Signature received:', signature ? 'Present' : 'Missing')
      console.log('Secret configured:', process.env.LEMONSQUEEZY_WEBHOOK_SECRET ? 'Yes' : 'No')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventName = event.meta?.event_name
    const subscriptionData = event.data

    console.log('LemonSqueezy webhook received:', eventName)

    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(subscriptionData, event)
        break

      case 'subscription_updated':
        await handleSubscriptionUpdated(subscriptionData, event)
        break

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(subscriptionData, event)
        break

      case 'subscription_resumed':
        await handleSubscriptionResumed(subscriptionData, event)
        break

      case 'subscription_expired':
        await handleSubscriptionExpired(subscriptionData, event)
        break

      case 'subscription_payment_success':
        await handlePaymentSuccess(subscriptionData, event)
        break

      case 'subscription_payment_failed':
        await handlePaymentFailed(subscriptionData, event)
        break

      default:
        console.log('Unhandled webhook event:', eventName)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscriptionData: any, event: any) {
  try {
    // Custom data is in event.meta.custom_data, not subscriptionData.attributes.custom_data
    const customData = event.meta?.custom_data
    const userId = customData?.user_id // Note: it's user_id, not userId

    console.log('Processing subscription_created for:', {
      subscriptionId: subscriptionData.id,
      userId,
      email: subscriptionData.attributes.user_email,
      customData
    })

    if (!userId) {
      console.error('No userId found in custom_data:', customData)
      return
    }

    const subscriptionRecord = {
      userId,
      email: subscriptionData.attributes.user_email,
      customerId: subscriptionData.attributes.customer_id.toString(),
      subscriptionId: subscriptionData.id,
      variantId: subscriptionData.attributes.variant_id.toString(),
      status: subscriptionData.attributes.status,
      // Use the correct date field names from the webhook
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

    await Subscription.createOrUpdate(subscriptionRecord)
    console.log('Subscription created successfully for user:', userId)
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscriptionData: any, event: any) {
  try {
    const subscriptionId = subscriptionData.id
    const customData = event.meta?.custom_data

    console.log('Processing subscription_updated for:', {
      subscriptionId,
      status: subscriptionData.attributes.status,
      customData
    })

    const updateData = {
      variantId: subscriptionData.attributes.variant_id.toString(),
      status: subscriptionData.attributes.status,
      currentPeriodStart: new Date(subscriptionData.attributes.created_at),
      currentPeriodEnd: new Date(subscriptionData.attributes.renews_at || subscriptionData.attributes.trial_ends_at),
      cancelAtPeriodEnd: subscriptionData.attributes.cancelled,
      plan: customData?.plan || getUserPlan(subscriptionData),
      webhookData: event,
    }

    const result = await Subscription.findOneAndUpdate(
      { subscriptionId },
      updateData,
      { new: true }
    )
    
    if (result) {
      console.log('Subscription updated successfully:', subscriptionId)
    } else {
      console.log('No subscription found to update for ID:', subscriptionId)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
    throw error
  }
}

async function handleSubscriptionCancelled(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    {
      status: 'cancelled',
      cancelAtPeriodEnd: true,
      webhookData: event,
    },
    { new: true }
  )
  console.log('Subscription cancelled:', subscriptionId)
}

async function handleSubscriptionResumed(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    {
      status: subscriptionData.attributes.status,
      cancelAtPeriodEnd: false,
      webhookData: event,
    },
    { new: true }
  )
  console.log('Subscription resumed:', subscriptionId)
}

async function handleSubscriptionExpired(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    {
      status: 'expired',
      plan: 'FREE',
      webhookData: event,
    },
    { new: true }
  )
  console.log('Subscription expired:', subscriptionId)
}

async function handlePaymentSuccess(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  // Reset monthly usage on successful payment (new billing period)
  const subscription = await Subscription.findOne({ subscriptionId })
  if (subscription) {
    await subscription.resetMonthlyUsage()
  }

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    {
      status: 'active',
      webhookData: event,
    },
    { new: true }
  )
  console.log('Payment successful for subscription:', subscriptionId)
}

async function handlePaymentFailed(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    {
      status: 'past_due',
      webhookData: event,
    },
    { new: true }
  )
  console.log('Payment failed for subscription:', subscriptionId)
} 