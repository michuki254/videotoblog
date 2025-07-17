import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Settings from '../../../../models/Settings'
import mongoose from 'mongoose'

export async function GET(req: NextRequest) {
  try {
    const authData = await auth()
    if (!authData || !authData.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user is admin
    const user = await User.findByClerkId(authData.userId)
    if (!user || !user.isAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get settings
    const settings = await Settings.getSettings()

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authData = await auth()
    if (!authData || !authData.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user is admin (preferably super admin for settings)
    const user = await User.findByClerkId(authData.userId)
    if (!user || !user.isSuperAdmin()) {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 })
    }

    const updates = await req.json()

    // Validate and sanitize updates
    const allowedSections = ['general', 'ai', 'lemonSqueezy', 'email', 'rateLimits', 'security', 'integrations', 'analytics']
    const sanitizedUpdates: any = {}

    for (const section of allowedSections) {
      if (updates[section]) {
        sanitizedUpdates[section] = updates[section]
      }
    }

    // Update settings
    const settings = await Settings.updateSettings(sanitizedUpdates)

    // Log admin action
    console.log(`Settings updated by ${user.email}`, {
      sections: Object.keys(sanitizedUpdates),
      timestamp: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      settings,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// Reset to defaults endpoint
export async function DELETE(req: NextRequest) {
  try {
    const authData = await auth()
    if (!authData || !authData.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user is super admin
    const user = await User.findByClerkId(authData.userId)
    if (!user || !user.isSuperAdmin()) {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 })
    }

    // Get section to reset from query params
    const searchParams = req.nextUrl.searchParams
    const section = searchParams.get('section')

    if (section) {
      // Reset specific section to defaults
      const settings = await Settings.getSettings()
      // Get default values by creating a new instance
      const SettingsModel = mongoose.model('Settings')
      const defaultValues = new SettingsModel()
      
      if (section in settings && section in defaultValues) {
        (settings as any)[section] = defaultValues[section]
        await settings.save()
      }
    } else {
      // Reset all settings to defaults
      await Settings.deleteMany({})
      await Settings.getSettings() // This will create new with defaults
    }

    const newSettings = await Settings.getSettings()

    return NextResponse.json({ 
      success: true, 
      settings: newSettings,
      message: section ? `${section} settings reset to defaults` : 'All settings reset to defaults'
    })

  } catch (error) {
    console.error('Settings DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    )
  }
}