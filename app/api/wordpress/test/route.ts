import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '../../../../lib/mongodb'
import UserSettings from '../../../../models/UserSettings'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to test WordPress connection.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { url, username, password } = body

    // Validate required fields
    if (!url || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: url, username, and password' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing WordPress connection for user:', userId)
    console.log('🔗 WordPress URL:', url)
    console.log('👤 Username:', username)

    // Create authorization header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    const authHeader = `Basic ${credentials}`

    // Test connection by fetching user info
    const wpApiUrl = `${url.replace(/\/$/, '')}/wp-json/wp/v2/users/me`
    
    const response = await fetch(wpApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    let connectionStatus = 'failed'
    let userInfo = null

    if (response.ok) {
      userInfo = await response.json()
      connectionStatus = 'connected'
      console.log('✅ WordPress connection successful:', userInfo.name)
    } else {
      const errorData = await response.text()
      console.error('❌ WordPress connection failed:', errorData)
    }

    // Save connection status to database
    try {
      await connectToDatabase()
      
      await UserSettings.findOneAndUpdate(
        { clerkId: userId },
        {
          $set: {
            'wordpress.url': url,
            'wordpress.username': username,
            'wordpress.password': password,
            'wordpress.lastTested': new Date(),
            'wordpress.connectionStatus': connectionStatus
          }
        },
        {
          upsert: true, // Create if doesn't exist
          new: true
        }
      )

      console.log('💾 Updated WordPress connection status in database:', connectionStatus)
    } catch (dbError) {
      console.error('⚠️ Failed to save connection status to database:', dbError)
      // Continue with the response even if database save fails
    }

    if (connectionStatus === 'connected') {
      return NextResponse.json({
        success: true,
        message: 'WordPress connection successful!',
        user: userInfo,
        connectionStatus: 'connected'
      })
    } else {
      const errorMessage = response.status === 401 
        ? 'WordPress authentication failed. Please check your username and application password.'
        : response.status === 403
        ? 'WordPress permission denied. Make sure your user has proper permissions.'
        : `WordPress connection failed: ${response.status} ${response.statusText}`

      return NextResponse.json({
        success: false,
        error: errorMessage,
        connectionStatus: 'failed'
      }, { status: response.status })
    }

  } catch (error: unknown) {
    console.error('❌ Error testing WordPress connection:', error)
    
    // Try to save failed status to database
    try {
      const { userId } = await auth()
      if (userId) {
        await connectToDatabase()
        await UserSettings.findOneAndUpdate(
          { clerkId: userId },
          {
            $set: {
              'wordpress.lastTested': new Date(),
              'wordpress.connectionStatus': 'failed'
            }
          },
          { upsert: true }
        )
      }
    } catch (dbError) {
      console.error('⚠️ Failed to save error status to database:', dbError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Network error occurred while testing connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      connectionStatus: 'failed'
    }, { status: 500 })
  }
} 