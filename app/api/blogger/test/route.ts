import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiKey, blogId } = await req.json();

    if (!apiKey || !blogId) {
      return NextResponse.json(
        { success: false, error: 'API key and Blog ID are required' },
        { status: 400 }
      );
    }

    // Test connection by getting blog info
    const blogResponse = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!blogResponse.ok) {
      const errorText = await blogResponse.text();
      console.error('Blogger API error:', errorText);
      
      if (blogResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Blog not found. Please check your Blog ID.' },
          { status: 400 }
        );
      } else if (blogResponse.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key or insufficient permissions.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Blogger API error: ${blogResponse.status}` },
        { status: 400 }
      );
    }

    const blogData = await blogResponse.json();
    
    if (!blogData.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Blogger API' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      blog: {
        id: blogData.id,
        name: blogData.name,
        description: blogData.description,
        url: blogData.url,
        posts: blogData.posts?.totalItems || 0
      }
    });

  } catch (error) {
    console.error('Blogger test connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test Blogger connection' },
      { status: 500 }
    );
  }
} 