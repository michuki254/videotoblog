require('dotenv').config({ path: '.env.local' });

async function testConversion() {
  console.log('Testing conversion API...\n');
  
  const testPayload = {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll video (short, simple)
    primaryKeyphrase: 'test',
    screenshots: [],
    seo: true,
    headlines: true,
    tableOfContents: true,
    detailLevel: 'comprehensive',
    wordCount: 1000,
    includeFeaturedImage: true,
    includeScreenshots: false, // Disable screenshots for this test
    writingStyle: {
      tone: 'auto',
      pointOfView: 'auto',
      useEmojis: false,
      format: 'auto'
    },
    customInstructions: '',
    screenshotCount: 0
  };

  try {
    console.log('Making request to conversion API...');
    const response = await fetch('http://localhost:3000/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we'll see if server starts
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response:', data);
      } catch (e) {
        console.log('Failed to parse as JSON');
      }
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testConversion(); 