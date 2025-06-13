import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import UserSettings from '../../../../models/UserSettings';

// GET - Fetch user's Pinterest boards
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

    // Fetch boards from Pinterest API
    try {
      const response = await fetch('https://api.pinterest.com/v5/boards', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
      }

      const boardsData = await response.json();
      
      return NextResponse.json({
        success: true,
        boards: boardsData.items || []
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch Pinterest boards:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to fetch Pinterest boards: ${error.message}`,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error fetching Pinterest boards:', error);
    return NextResponse.json({
      error: 'Failed to fetch Pinterest boards',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create a new Pinterest board
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { name, description = '' } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Board name is required' },
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

    // Create board via Pinterest API
    try {
      const response = await fetch('https://api.pinterest.com/v5/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
      }

      const boardData = await response.json();
      
      return NextResponse.json({
        success: true,
        board: boardData
      });
    } catch (error: any) {
      console.error('❌ Failed to create Pinterest board:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to create Pinterest board: ${error.message}`,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error creating Pinterest board:', error);
    return NextResponse.json({
      error: 'Failed to create Pinterest board',
      details: error.message
    }, { status: 500 });
  }
}
