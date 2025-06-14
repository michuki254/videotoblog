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
  const customData = subscriptionData.attributes.custom_data
  const userId = customData?.userId

  if (!userId) {
    console.error('No userId found in subscription data')
    return
  }

  const subscriptionRecord = {
    userId,
    email: subscriptionData.attributes.user_email,
    customerId: subscriptionData.attributes.customer_id.toString(),
    subscriptionId: subscriptionData.id,
    variantId: subscriptionData.attributes.variant_id.toString(),
    status: subscriptionData.attributes.status,
    currentPeriodStart: new Date(subscriptionData.attributes.current_period_start),
    currentPeriodEnd: new Date(subscriptionData.attributes.current_period_end),
    cancelAtPeriodEnd: subscriptionData.attributes.cancelled,
    plan: getUserPlan(subscriptionData),
    webhookData: event,
  }

  await Subscription.createOrUpdate(subscriptionRecord)
  console.log('Subscription created for user:', userId)
}

async function handleSubscriptionUpdated(subscriptionData: any, event: any) {
  const subscriptionId = subscriptionData.id

  const updateData = {
    variantId: subscriptionData.attributes.variant_id.toString(),
    status: subscriptionData.attributes.status,
    currentPeriodStart: new Date(subscriptionData.attributes.current_period_start),
    currentPeriodEnd: new Date(subscriptionData.attributes.current_period_end),
    cancelAtPeriodEnd: subscriptionData.attributes.cancelled,
    plan: getUserPlan(subscriptionData),
    webhookData: event,
  }

  await Subscription.findOneAndUpdate(
    { subscriptionId },
    updateData,
    { new: true }
  )
  console.log('Subscription updated:', subscriptionId)
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