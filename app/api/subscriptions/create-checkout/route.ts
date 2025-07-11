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
      console.error('Plan configuration error:', {
        plan,
        planData,
        hasVariantId: 'variantId' in planData,
        variantId: (planData as any).variantId,
        envVars: {
          BASIC: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
          PRO: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
          ENTERPRISE: process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID,
        }
      })
      return NextResponse.json({ error: 'Plan variant ID not configured' }, { status: 500 })
    }

    // Create checkout session
    console.log('Creating checkout with:', {
      plan,
      variantId: planData.variantId,
      email,
      customData: { userId, plan }
    })

    let checkout
    try {
      checkout = await createSubscriptionCheckout(
        planData.variantId,
        email,
        {
          userId,
          plan,
        }
      )
    } catch (checkoutError: any) {
      console.error('Checkout creation error:', checkoutError)
      
      // Check if it's a LemonSqueezy error
      if (checkoutError?.message?.includes('Internal Server Error')) {
        return NextResponse.json({ 
          error: 'LemonSqueezy service is currently unavailable. Please try again later.' 
        }, { status: 503 })
      }
      
      return NextResponse.json({ 
        error: checkoutError?.message || 'Failed to create checkout session' 
      }, { status: 500 })
    }

    console.log('Checkout result:', checkout)

    if (!checkout || !checkout.attributes || !checkout.attributes.url) {
      console.error('Invalid checkout response:', checkout)
      return NextResponse.json({ 
        error: 'Invalid response from payment provider' 
      }, { status: 500 })
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