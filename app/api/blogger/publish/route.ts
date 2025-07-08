import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      apiKey, 
      blogId, 
      title, 
      content, 
      isDraft = true,
      labels = []
    } = await req.json();

    if (!apiKey || !blogId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: API key, Blog ID, title, and content are required' },
        { status: 400 }
      );
    }

    // Convert markdown content to HTML for Blogger
    let htmlContent = content;
    
    // Basic markdown to HTML conversion for better Blogger compatibility
    htmlContent = htmlContent
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<[h1-6]|<p|<br|<\/)/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');

    // Clean up any double paragraph tags
    htmlContent = htmlContent
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1');

    // Prepare the post data
    const postData = {
      kind: 'blogger#post',
      title: title,
      content: htmlContent,
      labels: labels.filter((label: string) => label.trim() !== '').slice(0, 20) // Blogger allows many labels
    };

    // Publish the post
    const endpoint = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts${isDraft ? '?isDraft=true' : ''}`;
    
    console.log('Publishing to Blogger:', {
      endpoint,
      title: postData.title,
      labels: postData.labels,
      isDraft,
      contentLength: postData.content.length
    });

    const response = await fetch(`${endpoint}&key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blogger publish error:', errorText);
      
      let errorMessage = `Blogger API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
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
    
    if (!responseData.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid response from Blogger API' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: responseData.id,
      title: responseData.title,
      url: responseData.url,
      status: isDraft ? 'draft' : 'published',
      publishedAt: responseData.published,
      labels: responseData.labels || []
    });

  } catch (error) {
    console.error('Blogger publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to Blogger' },
      { status: 500 }
    );
  }
} 