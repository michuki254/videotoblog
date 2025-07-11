import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      siteId, 
      apiToken, 
      collectionId,
      name, // title
      slug,
      content,
      excerpt = '',
      isDraft = false,
      publishedDate = new Date().toISOString(),
      featuredImage = null,
      tags = []
    } = await request.json();

    if (!siteId || !apiToken || !collectionId || !name || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the item data for Webflow
    const itemData = {
      fields: {
        name: name, // Title field in Webflow
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content: content, // Rich text field
        excerpt: excerpt,
        'published-date': publishedDate,
        _archived: false,
        _draft: isDraft
      }
    };

    // Add featured image if provided
    if (featuredImage) {
      itemData.fields['featured-image'] = {
        url: featuredImage,
        alt: name
      };
    }

    // Add tags if the collection supports them
    if (tags && tags.length > 0) {
      itemData.fields.tags = tags.join(', ');
    }

    console.log('📝 Publishing to Webflow:', {
      siteId,
      collectionId,
      title: name,
      slug: itemData.fields.slug,
      isDraft
    });

    // Create the item in the collection
    const createResponse = await fetch(`https://api.webflow.com/collections/${collectionId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept-Version': '1.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Webflow publish error:', createResponse.status, errorText);
      
      let errorMessage = `Webflow API error: ${createResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.msg) {
          errorMessage = errorData.msg;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Keep the default error message
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: createResponse.status }
      );
    }

    const createdItem = await createResponse.json();

    // Publish the site to make the changes live (if not a draft)
    if (!isDraft) {
      const publishResponse = await fetch(`https://api.webflow.com/sites/${siteId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept-Version': '1.0.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domains: [] // Empty array publishes to all domains
        })
      });

      if (!publishResponse.ok) {
        console.warn('⚠️ Webflow site publish warning:', await publishResponse.text());
        // Don't fail the whole operation if publishing fails
      }
    }

    return NextResponse.json({
      success: true,
      id: createdItem._id,
      slug: createdItem.slug,
      name: createdItem.name,
      publishedDate: createdItem['published-date'],
      isDraft: createdItem._draft,
      collectionId: createdItem._cid,
      webflowUrl: `https://webflow.com/design/${siteId}/collection/${collectionId}/${createdItem._id}`
    });

  } catch (error) {
    console.error('❌ Webflow publish error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to Webflow' },
      { status: 500 }
    );
  }
}