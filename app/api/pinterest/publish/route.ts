import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import UserSettings from '../../../../models/UserSettings';

// POST - Publish a pin to Pinterest
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { 
      title, 
      description, 
      imageUrl, 
      link, 
      boardId, 
      scheduledTime = null 
    } = await req.json();
    
    if (!title || !imageUrl || !boardId) {
      return NextResponse.json(
        { error: 'Title, image URL, and board ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const userSettings = await UserSettings.findOne({ clerkId: userId });
    
    if (!userSettings || !userSettings.pinterest || !userSettings.pinterest.accessToken) {
      return NextResponse.json(
        { error: 'Pinterest account not configured' },
        { status: 400 }
      );
    }

    const { accessToken } = userSettings.pinterest;

    // Create pin via Pinterest API
    try {
      // Prepare the request body
      const pinData: any = {
        title,
        description: description || '',
        board_id: boardId,
        media_source: {
          source_type: 'image_url',
          url: imageUrl
        }
      };

      // Add link if provided
      if (link) {
        pinData.link = link;
      }

      // Add scheduling if provided
      if (scheduledTime) {
        pinData.publish_date = new Date(scheduledTime).toISOString();
      }

      const response = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
      }

      const pinResponse = await response.json();
      
      return NextResponse.json({
        success: true,
        pin: pinResponse,
        scheduled: !!scheduledTime,
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null
      });
    } catch (error: any) {
      console.error('❌ Failed to publish to Pinterest:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to publish to Pinterest: ${error.message}`,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error publishing to Pinterest:', error);
    return NextResponse.json({
      error: 'Failed to publish to Pinterest',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Get user's scheduled pins
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
    const userSettings = await UserSettings.findOne({ clerkId: userId });
    
    if (!userSettings || !userSettings.pinterest || !userSettings.pinterest.accessToken) {
      return NextResponse.json(
        { error: 'Pinterest account not configured' },
        { status: 400 }
      );
    }

    const { accessToken } = userSettings.pinterest;

    // Fetch scheduled pins from Pinterest API
    try {
      // Note: This is a simplified example. The actual Pinterest API might 
      // require different endpoints or parameters to fetch scheduled pins
      const response = await fetch('https://api.pinterest.com/v5/pins?filter=scheduled', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
      }

      const scheduledPins = await response.json();
      
      return NextResponse.json({
        success: true,
        scheduledPins: scheduledPins.items || []
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch scheduled pins:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to fetch scheduled pins: ${error.message}`,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error fetching scheduled pins:', error);
    return NextResponse.json({
      error: 'Failed to fetch scheduled pins',
      details: error.message
    }, { status: 500 });
  }
}
