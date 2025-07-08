import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      accessToken, 
      authorId, 
      publicationId, 
      title, 
      content, 
      contentFormat = 'markdown',
      publishStatus = 'draft',
      tags = []
    } = await req.json();

    if (!accessToken || !authorId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the post data
    const postData = {
      title: title,
      contentFormat: contentFormat,
      content: content,
      publishStatus: publishStatus, // 'public', 'draft', or 'unlisted'
      tags: tags.filter((tag: string) => tag.trim() !== '').slice(0, 5) // Medium allows max 5 tags
    };

    // Choose the appropriate endpoint based on whether it's for a publication or personal account
    let endpoint = `https://api.medium.com/v1/users/${authorId}/posts`;
    if (publicationId) {
      endpoint = `https://api.medium.com/v1/publications/${publicationId}/posts`;
    }

    console.log('Publishing to Medium:', {
      endpoint,
      title: postData.title,
      contentFormat: postData.contentFormat,
      publishStatus: postData.publishStatus,
      tags: postData.tags,
      hasPublication: !!publicationId
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Medium publish error:', errorText);
      
      let errorMessage = `Medium API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message;
        }
      } catch (e) {
        // Keep the default error message
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    if (!responseData.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Medium API' },
        { status: 400 }
      );
    }

    const publishedPost = responseData.data;

    return NextResponse.json({
      success: true,
      id: publishedPost.id,
      title: publishedPost.title,
      url: publishedPost.url,
      publishStatus: publishedPost.publishStatus,
      publishedAt: publishedPost.publishedAt,
      tags: publishedPost.tags
    });

  } catch (error) {
    console.error('Medium publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to Medium' },
      { status: 500 }
    );
  }
} 