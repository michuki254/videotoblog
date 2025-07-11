import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '../../../../lib/mongodb'
import PageView from '../../../../models/PageView'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = await req.json()
    const { postId, sessionId, duration, converted, conversionType } = body

    // Validate required fields
    if (!postId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: postId and sessionId' },
        { status: 400 }
      )
    }

    // Get user ID from auth if available
    const authData = await auth()
    const userId = authData?.userId || null

    // Get user agent to determine device type
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    
    let device = 'desktop'
    if (/Mobile|Android|iPhone/i.test(userAgent)) {
      device = 'mobile'
    } else if (/iPad|Tablet/i.test(userAgent)) {
      device = 'tablet'
    }

    // Get referrer
    const referrer = headersList.get('referer') || ''

    // Create page view record
    const pageView = await PageView.create({
      postId,
      userId,
      sessionId,
      duration,
      converted,
      conversionType,
      referrer,
      device,
      browser: userAgent.substring(0, 100), // Store partial user agent
    })

    return NextResponse.json({ success: true, id: pageView._id })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}