import { NextResponse } from 'next/server';
import { chromium, Browser } from 'playwright';
import connectDB from '@/lib/mongodb';
import Screenshot from '@/models/Screenshot';
import BlogPost from '@/models/BlogPost';

interface ScreenshotData {
  url: string;
  timestamp: number;
  isThumbnail?: boolean;
  id?: string;
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Fallback function to get YouTube thumbnails
async function getYouTubeThumbnails(videoId: string, timestamps: number[]): Promise<ScreenshotData[]> {
  const screenshots: ScreenshotData[] = [];
  
  // YouTube provides several thumbnail options
  const thumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
  ];
  
  for (let i = 0; i < timestamps.length && i < thumbnailUrls.length; i++) {
    screenshots.push({
      url: thumbnailUrls[i],
      timestamp: timestamps[i],
      isThumbnail: true
    });
  }
  
  return screenshots;
}

async function captureVideoScreenshot(page: any, videoId: string, timestamp: number): Promise<Buffer | null> {
  try {
    // Use embed URL as primary approach - it's less likely to be blocked
    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${timestamp}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
    
    await page.goto(embedUrl, {
      waitUntil: 'domcontentloaded', // Changed from 'networkidle' to 'domcontentloaded'
      timeout: 30000 // Reduced timeout since we're not waiting for network idle
    });

    // Wait for video to load and start playing
    await page.waitForTimeout(5000);
    
    // Wait for video element to be present with shorter timeout
    try {
      await page.waitForSelector('video', { timeout: 15000 });
    } catch (selectorError) {
      console.log('Video element not found within timeout, proceeding anyway');
    }
    
    // Wait for video to actually start playing
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (video) {
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            resolve(true);
          } else {
            video.addEventListener('loadeddata', () => resolve(true), { once: true });
            video.addEventListener('canplay', () => resolve(true), { once: true });
            // Fallback timeout
            setTimeout(() => resolve(true), 10000);
          }
        } else {
          resolve(true);
        }
      });
    });

    // Additional wait for frame to render
    await page.waitForTimeout(3000);

    // Take screenshot and return as Buffer
    let screenshotBuffer: Buffer;
    
    // Try to take screenshot of video element first
    try {
      const videoElement = await page.$('video');
      if (videoElement) {
        screenshotBuffer = await videoElement.screenshot({
          type: 'png'
        });
      } else {
        // Fallback to full page screenshot
        screenshotBuffer = await page.screenshot({
          type: 'png',
          fullPage: false
        });
      }
    } catch (error) {
      screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: false
      });
    }

    return screenshotBuffer;
  } catch (error: any) {
    const errorType = error.name === 'TimeoutError' ? 'Timeout' : 'Error';
    console.error(`${errorType} capturing screenshot at ${timestamp}s:`, error.message || error);
    
    // Even if we encounter an error, try to take a screenshot of whatever is on the page
    try {
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: false
      });
      return screenshotBuffer;
    } catch (fallbackError) {
      console.error('Failed to capture fallback screenshot:', fallbackError);
      return null; // Return null if we can't capture anything
    }
  }
}

export async function POST(req: Request) {
  console.log('Screenshot API called');
  let browser: Browser | null = null;
  
  const cleanup = async () => {
    if (browser) {
      try {
        await browser.close();
        browser = null;
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  };
  
  try {
    await connectDB();
    
    const { url, timestamps = [30, 60, 90], useFallback = true, blogPostId } = await req.json();
    console.log('Screenshot request:', { url, timestamps, blogPostId });
    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    let screenshots: ScreenshotData[] = [];

    // Now that Playwright browsers are installed, enable browser automation
    // Set to true to use YouTube thumbnails, false to use real video screenshots
    const skipBrowserAutomation = false;
    
    if (!skipBrowserAutomation) {
      try {
        // Launch browser with improved settings
        console.log('Attempting to launch Playwright browser...');
        browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--autoplay-policy=no-user-gesture-required',
          '--mute-audio',
          '--window-size=1280,720',
          '--enable-unsafe-swiftshader', // Fix WebGL warnings
          '--disable-software-rasterizer'
        ]
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: true,
        javaScriptEnabled: true,
        acceptDownloads: false,
      });

      const page = await context.newPage();
      
      // Reduce console spam
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('WebGL')) {
          return; // Ignore console errors and WebGL warnings
        }
      });
      
      page.setDefaultTimeout(30000);
      
      // Less aggressive resource blocking
      await page.route('**/*', route => {
        const resourceType = route.request().resourceType();
        const url = route.request().url();
        
        // Only block heavy ads and tracking
        if (url.includes('googlesyndication') ||
            url.includes('googletagmanager') ||
            url.includes('google-analytics') ||
            url.includes('doubleclick') ||
            resourceType === 'font') {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Process each timestamp sequentially to avoid duplicates
      const processedTimestamps = new Set<number>();
      
      for (const timestamp of timestamps) {
        // Skip if already processed
        if (processedTimestamps.has(timestamp)) {
          continue;
        }
        
        processedTimestamps.add(timestamp);

        try {
          // Check if screenshot already exists in MongoDB
          const existingScreenshot = await Screenshot.findOne({
            videoId,
            timestamp,
            blogPostId: blogPostId || null
          });
          
          if (existingScreenshot) {
            screenshots.push({
              url: `/api/screenshots/${existingScreenshot._id}`,
              timestamp: timestamp,
              id: existingScreenshot._id.toString()
            });
            continue;
          }

          const screenshotBuffer = await captureVideoScreenshot(page, videoId, timestamp);
          
          if (screenshotBuffer) {
            // Save screenshot to MongoDB
            const newScreenshot = new Screenshot({
              blogPostId: blogPostId || null,
              videoId,
              timestamp,
              imageData: screenshotBuffer,
              contentType: 'image/png',
              isThumbnail: false
            });
            
            await newScreenshot.save();
            
            screenshots.push({
              url: `/api/screenshots/${newScreenshot._id}`,
              timestamp: timestamp,
              id: newScreenshot._id.toString()
            });
          }
          
          // Add delay between screenshots
          if (timestamps.indexOf(timestamp) < timestamps.length - 1) {
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          console.error(`Failed to capture screenshot for timestamp ${timestamp}s:`, error);
          // Continue with other timestamps
        }
      }

      await cleanup();

    } catch (browserError) {
      console.error('Browser automation failed:', browserError);
      console.error('Browser error details:', {
        message: browserError.message,
        stack: browserError.stack
      });
      await cleanup();
    }
    }

    // If no screenshots were captured and fallback is enabled, use YouTube thumbnails
    // Always use fallback when browser automation is skipped
    if ((screenshots.length === 0 && useFallback) || skipBrowserAutomation) {
      const thumbnails = await getYouTubeThumbnails(videoId, timestamps);
      
      // Store thumbnail URLs as screenshots in MongoDB
      for (const thumbnail of thumbnails) {
        try {
          // Fetch the thumbnail image
          const response = await fetch(thumbnail.url);
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            
            const newScreenshot = new Screenshot({
              blogPostId: blogPostId || null,
              videoId,
              timestamp: thumbnail.timestamp,
              imageData: buffer,
              contentType: 'image/jpeg',
              isThumbnail: true
            });
            
            await newScreenshot.save();
            
            screenshots.push({
              url: `/api/screenshots/${newScreenshot._id}`,
              timestamp: thumbnail.timestamp,
              isThumbnail: true,
              id: newScreenshot._id.toString()
            });
          }
        } catch (error) {
          console.error('Failed to fetch thumbnail:', error);
        }
      }
    }

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: 'Failed to capture any screenshots.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      screenshots,
      fallbackUsed: screenshots.some(s => s.isThumbnail === true)
    });

  } catch (error: any) {
    // Clean up browser if it exists
      try {
      if (browser) {
        await browser.close();
      }
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshots: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
