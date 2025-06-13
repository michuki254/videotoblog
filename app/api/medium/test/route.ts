import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Test connection by getting user info
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Medium API error:', errorText);
      return NextResponse.json(
        { success: false, error: `Medium API error: ${userResponse.status}` },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    
    if (!userData.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Medium API' },
        { status: 400 }
      );
    }

    // Get user publications
    let publications = [];
    try {
      const publicationsResponse = await fetch(`https://api.medium.com/v1/users/${userData.data.id}/publications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (publicationsResponse.ok) {
        const publicationsData = await publicationsResponse.json();
        if (publicationsData.data) {
          publications = publicationsData.data.map((pub: any) => ({
            id: pub.id,
            name: pub.name
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to fetch publications:', error);
    }

    return NextResponse.json({
      success: true,
      user: userData.data,
      publications: publications
    });

  } catch (error) {
    console.error('Medium test connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test Medium connection' },
      { status: 500 }
    );
  }
} 