import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { siteId, apiToken, collectionId } = await request.json();

    if (!siteId || !apiToken) {
      return NextResponse.json(
        { success: false, error: 'Site ID and API Token are required' },
        { status: 400 }
      );
    }

    // Test connection to Webflow API
    const siteResponse = await fetch(`https://api.webflow.com/sites/${siteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept-Version': '1.0.0',
        'Content-Type': 'application/json'
      }
    });

    if (!siteResponse.ok) {
      if (siteResponse.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API token. Please check your credentials.' },
          { status: 401 }
        );
      } else if (siteResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Site not found. Please check your Site ID.' },
          { status: 404 }
        );
      } else if (siteResponse.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Access denied. Please check your API token permissions.' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: `Webflow API error: ${siteResponse.status} ${siteResponse.statusText}` },
          { status: siteResponse.status }
        );
      }
    }

    const siteData = await siteResponse.json();
    let collectionData = null;

    // If collection ID is provided, test access to the collection
    if (collectionId) {
      const collectionResponse = await fetch(`https://api.webflow.com/collections/${collectionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept-Version': '1.0.0',
          'Content-Type': 'application/json'
        }
      });

      if (!collectionResponse.ok) {
        if (collectionResponse.status === 404) {
          return NextResponse.json(
            { success: false, error: 'Collection not found. Please check your Collection ID.' },
            { status: 404 }
          );
        } else {
          return NextResponse.json(
            { success: false, error: `Collection API error: ${collectionResponse.status} ${collectionResponse.statusText}` },
            { status: collectionResponse.status }
          );
        }
      }

      collectionData = await collectionResponse.json();
    }

    console.log('✅ Webflow connection test successful:', {
      siteName: siteData.name,
      siteId: siteData._id,
      collectionName: collectionData?.name,
      collectionId: collectionData?._id
    });

    return NextResponse.json({
      success: true,
      site: {
        id: siteData._id,
        name: siteData.name,
        shortName: siteData.shortName,
        domains: siteData.domains,
        timezone: siteData.timezone
      },
      collection: collectionData ? {
        id: collectionData._id,
        name: collectionData.name,
        slug: collectionData.slug
      } : null,
      message: `Successfully connected to Webflow site: ${siteData.name}${collectionData ? ` with collection: ${collectionData.name}` : ''}`
    });

  } catch (error) {
    console.error('❌ Webflow connection test error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, error: 'Network error: Unable to connect to Webflow API. Please check your internet connection.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred during connection test' },
      { status: 500 }
    );
  }
} 