import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    
    return NextResponse.json({
      debug: true,
      webhookSecretExists: !!webhookSecret,
      webhookSecretLength: webhookSecret ? webhookSecret.length : 0,
      webhookSecretPrefix: webhookSecret ? webhookSecret.substring(0, 8) + '...' : 'Not set',
      environment: process.env.NODE_ENV,
      message: webhookSecret 
        ? 'Webhook secret is configured' 
        : 'Webhook secret is missing - this is why signature verification fails'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 