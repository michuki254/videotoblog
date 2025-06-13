import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import UserSettings from '../../../../models/UserSettings';

// Test Pinterest API connection
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { accessToken } = await req.json();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Pinterest access token is required' },
        { status: 400 }
      );
    }

    // Test the Pinterest API connection
    try {
      // Make a request to Pinterest API to verify the token
      const response = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
      }

      const userData = await response.json();
      
      // Update user settings with successful connection status
      await connectToDatabase();
      const userSettings = await UserSettings.findOne({ clerkId: userId });
      
      if (userSettings) {
        userSettings.pinterest = {
          ...userSettings.pinterest,
          connectionStatus: 'success',
          lastTested: new Date(),
          username: userData.username || '',
          businessAccountId: userData.id || ''
        };
        await userSettings.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Pinterest connection successful',
        userData
      });
    } catch (error: any) {
      console.error('❌ Pinterest connection test failed:', error);
      
      // Update user settings with failed connection status
      await connectToDatabase();
      const userSettings = await UserSettings.findOne({ clerkId: userId });
      
      if (userSettings) {
        userSettings.pinterest = {
          ...userSettings.pinterest,
          connectionStatus: 'error',
          lastTested: new Date()
        };
        await userSettings.save();
      }

      return NextResponse.json({
        success: false,
        error: `Pinterest connection failed: ${error.message}`,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error testing Pinterest connection:', error);
    return NextResponse.json({
      error: 'Failed to test Pinterest connection',
      details: error.message
    }, { status: 500 });
  }
}
