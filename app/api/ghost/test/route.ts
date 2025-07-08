import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, adminApiKey } = await request.json();

    if (!url || !adminApiKey) {
      return NextResponse.json(
        { success: false, error: 'Ghost URL and Admin API Key are required' },
        { status: 400 }
      );
    }

    // Clean the URL to ensure it's properly formatted
    const cleanUrl = url.replace(/\/+$/, ''); // Remove trailing slashes
    
    // Test the connection by making a request to the Ghost site's /ghost/api/admin/site/ endpoint
    const apiUrl = `${cleanUrl}/ghost/api/admin/site/`;
    
    console.log('🔄 Testing Ghost connection to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Ghost ${adminApiKey}`,
        'Content-Type': 'application/json',
        'Accept-Version': 'v5.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ghost API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid Admin API Key. Please check your Ghost Admin API key and try again.' },
          { status: 401 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Ghost site not found. Please check your Ghost URL and try again.' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: `Ghost API error: ${response.status} - ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    
    if (data && data.site) {
      console.log('✅ Ghost connection successful:', data.site.title);
      
      return NextResponse.json({
        success: true,
        site: {
          title: data.site.title,
          url: data.site.url,
          description: data.site.description,
          timezone: data.site.timezone,
          version: data.site.version
        },
        message: 'Connection successful'
      });
    } else {
      console.error('❌ Unexpected Ghost API response:', data);
      return NextResponse.json(
        { success: false, error: 'Unexpected response from Ghost API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Ghost connection test error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { success: false, error: 'Cannot connect to Ghost site. Please check your URL and try again.' },
          { status: 500 }
        );
      } else if (error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Connection timeout. Please try again later.' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: `Connection error: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while testing the connection.' },
      { status: 500 }
    );
  }
} 