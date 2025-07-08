import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function checkAdminAuth(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findByClerkId(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isAdmin()) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return { user, userId }
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function checkSuperAdminAuth(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const user = await User.findByClerkId(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isSuperAdmin()) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    return { user, userId }
  } catch (error) {
    console.error('Super admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function getCurrentUser(userId: string) {
  try {
    await connectDB()
    return await User.findByClerkId(userId)
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function ensureUserExists(clerkUser: any) {
  try {
    await connectDB()
    
    const userData = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      imageUrl: clerkUser.imageUrl || '',
    }

    const user = await User.createOrUpdate(userData)
    await user.updateLastLogin()
    
    return user
  } catch (error) {
    console.error('Ensure user exists error:', error)
    return null
  }
} 