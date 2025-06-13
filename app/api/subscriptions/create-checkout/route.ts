import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSubscriptionCheckout, SUBSCRIPTION_PLANS } from '@/lib/lemonsqueezy'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, email } = await request.json()

    // Validate plan
    if (!plan || !SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const planData = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
    
    // Free plan doesn't need checkout
    if (plan === 'FREE') {
      return NextResponse.json({ error: 'Free plan does not require checkout' }, { status: 400 })
    }

    if (!('variantId' in planData) || !planData.variantId) {
      return NextResponse.json({ error: 'Plan variant ID not configured' }, { status: 500 })
    }

    // Create checkout session
    const checkout = await createSubscriptionCheckout(
      planData.variantId,
      email,
      {
        userId,
        plan,
      }
    )

    if (!checkout) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({
      checkoutUrl: checkout.attributes.url,
      checkoutId: checkout.id,
    })

  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 