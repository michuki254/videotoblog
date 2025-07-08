import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Get the body
    const payload = await request.text()
    const body = JSON.parse(payload)

    // Get the Clerk webhook secret
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET not found in environment variables')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: any

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Connect to MongoDB
    await connectDB()

    // Handle the webhook
    const eventType = evt.type
    console.log(`Clerk webhook received: ${eventType}`)

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Clerk webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  try {
    console.log('Creating new user:', userData.id)

    const newUser = {
      clerkId: userData.id,
      email: userData.email_addresses[0]?.email_address || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      imageUrl: userData.image_url || '',
      role: 'USER', // Default role
      isActive: true,
      lastLoginAt: new Date(),
      totalVideosConverted: 0,
      totalStorageUsed: 0,
      settings: {
        notifications: true,
        newsletter: true,
      },
    }

    await User.createOrUpdate(newUser)
    console.log(`✅ User created in database: ${newUser.email}`)

  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log('Updating user:', userData.id)

    const updateData = {
      clerkId: userData.id,
      email: userData.email_addresses[0]?.email_address || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      imageUrl: userData.image_url || '',
      lastLoginAt: new Date(),
    }

    await User.createOrUpdate(updateData)
    console.log(`✅ User updated in database: ${updateData.email}`)

  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log('Deleting user:', userData.id)

    await User.findOneAndUpdate(
      { clerkId: userData.id },
      { isActive: false }
    )
    console.log(`✅ User deactivated in database: ${userData.id}`)

  } catch (error) {
    console.error('Error deleting user:', error)
  }
} 