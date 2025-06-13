import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import UserSettings from '../../../../models/UserSettings';

// GET - Fetch user settings
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Find or create user settings
    let userSettings = await UserSettings.findOne({ clerkId: userId });
    
    if (!userSettings) {
      // Create default settings for new user
      userSettings = new UserSettings({
        clerkId: userId,
        wordpress: {
          url: '',
          username: '',
          password: '',
          lastTested: null,
          connectionStatus: 'not-tested'
        },
        medium: {
          accessToken: '',
          authorId: '',
          publicationId: '',
          lastTested: null,
          connectionStatus: 'idle'
        },
        blogger: {
          apiKey: '',
          blogId: '',
          blogName: '',
          blogUrl: '',
          lastTested: null,
          connectionStatus: 'idle'
        },
        ghost: {
          url: '',
          adminApiKey: '',
          apiUrl: '',
          blogName: '',
          lastTested: null,
          connectionStatus: 'idle'
        },
        webflow: {
          siteId: '',
          apiToken: '',
          collectionId: '',
          siteName: '',
          collectionName: '',
          lastTested: null,
          connectionStatus: 'idle'
        },
        pinterest: {
          accessToken: '',
          refreshToken: '',
          tokenExpiresAt: null,
          businessAccountId: '',
          username: '',
          lastTested: null,
          connectionStatus: 'idle',
          defaultBoard: {
            id: '',
            name: ''
          },
          aiImageSettings: {
            enabled: true,
            style: 'realistic',
            aspectRatio: '2:3',
            customPrompt: ''
          }
        },
        preferences: {
          theme: 'system',
          notifications: true
        },
        integrations: {
          medium: { enabled: false, config: {} },
          ghost: { enabled: false, config: {} }
        }
      });
      await userSettings.save();
      console.log('✅ Created new user settings for:', userId);
    }

    console.log('📥 Retrieved user settings for:', userId);
    return NextResponse.json({
      success: true,
      settings: userSettings
    });

  } catch (error: unknown) {
    console.error('❌ Error fetching user settings:', error);
    return NextResponse.json({
      error: 'Failed to fetch user settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update user settings
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const updateData = await req.json();
    
    if (!updateData) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find or create user settings
    let userSettings = await UserSettings.findOne({ clerkId: userId });
    
    if (!userSettings) {
      // Create new settings with provided data
      userSettings = new UserSettings({
        clerkId: userId,
        ...updateData
      });
    } else {
      // Update existing settings
      Object.keys(updateData).forEach(key => {
        if (updateData[key] && typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          // For nested objects like wordpress, merge instead of replace
          userSettings[key] = { ...userSettings[key], ...updateData[key] };
        } else {
          userSettings[key] = updateData[key];
        }
      });
    }

    await userSettings.save();
    
    console.log('✅ Updated user settings for:', userId);
    console.log('📝 Updated fields:', Object.keys(updateData));

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: userSettings
    });

  } catch (error: unknown) {
    console.error('❌ Error updating user settings:', error);
    return NextResponse.json({
      error: 'Failed to update user settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 