import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to generate Ghost Admin API token
function generateToken(adminApiKey: string) {
  const [id, secret] = adminApiKey.split(':');
  
  if (!id || !secret) {
    throw new Error('Invalid Admin API Key format');
  }

  const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
  });

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      url, 
      adminApiKey, 
      title, 
      content, 
      status = 'draft',
      tags = [],
      excerpt = '',
      featureImage = null,
      metaTitle = null,
      metaDescription = null
    } = await request.json();

    if (!url || !adminApiKey || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Clean the URL
    const cleanUrl = url.replace(/\/+$/, '');
    
    // Generate JWT token for authentication
    let token;
    try {
      token = generateToken(adminApiKey);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid Admin API Key format. It should be in the format id:secret' },
        { status: 400 }
      );
    }

    // Prepare the post data
    const postData = {
      posts: [{
        title: title,
        html: content,
        status: status, // 'draft' or 'published'
        excerpt: excerpt,
        feature_image: featureImage,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        tags: tags.map((tag: string) => ({ name: tag }))
      }]
    };

    // Make the API request to create the post
    const apiUrl = `${cleanUrl}/ghost/api/admin/posts/`;
    
    console.log('📝 Publishing to Ghost:', {
      url: apiUrl,
      title: postData.posts[0].title,
      status: postData.posts[0].status,
      tags: tags
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json',
        'Accept-Version': 'v5.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ghost publish error:', response.status, errorText);
      
      let errorMessage = `Ghost API error: ${response.status}`;
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
    
    if (!responseData.posts || responseData.posts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Ghost API' },
        { status: 400 }
      );
    }

    const publishedPost = responseData.posts[0];

    return NextResponse.json({
      success: true,
      id: publishedPost.id,
      uuid: publishedPost.uuid,
      title: publishedPost.title,
      slug: publishedPost.slug,
      url: publishedPost.url,
      status: publishedPost.status,
      published_at: publishedPost.published_at,
      feature_image: publishedPost.feature_image,
      tags: publishedPost.tags
    });

  } catch (error) {
    console.error('❌ Ghost publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to Ghost' },
      { status: 500 }
    );
  }
}