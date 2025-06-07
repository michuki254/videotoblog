import { NextResponse } from 'next/server';
import { chromium, Browser } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

interface Screenshot {
  url: string;
  timestamp: number;
  isThumbnail?: boolean;
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Fallback function to get YouTube thumbnails
async function getYouTubeThumbnails(videoId: string, timestamps: number[]): Promise<Screenshot[]> {
  const screenshots: Screenshot[] = [];
  
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

async function captureVideoScreenshot(page: any, videoId: string, timestamp: number): Promise<string> {
  try {
    // Use embed URL as primary approach - it's less likely to be blocked
    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${timestamp}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0`;
    
    await page.goto(embedUrl, {
      waitUntil: 'networkidle',
      timeout: 45000 // Reduced timeout
    });

    // Wait for video to load and start playing
    await page.waitForTimeout(5000);
    
    // Wait for video element to be present
    await page.waitForSelector('video', { timeout: 30000 });
    
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

    // Take screenshot
    const fileName = `${videoId}_${timestamp}.png`;
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    const filePath = path.join(screenshotsDir, fileName);

    // Try to take screenshot of video element first
    try {
      const videoElement = await page.$('video');
      if (videoElement) {
        await videoElement.screenshot({
          path: filePath,
          type: 'png'
        });
      } else {
        // Fallback to full page screenshot
        await page.screenshot({
          path: filePath,
          type: 'png',
          fullPage: false
        });
      }
    } catch (error) {
      await page.screenshot({
        path: filePath,
        type: 'png',
        fullPage: false
      });
    }

    return `/screenshots/${fileName}`;
  } catch (error) {
    console.error(`Error capturing screenshot at ${timestamp}s:`, error);
    
    // Even if we encounter an error, try to take a screenshot of whatever is on the page
    try {
      const fileName = `${videoId}_${timestamp}_error.png`;
      const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
      const filePath = path.join(screenshotsDir, fileName);
      
      await page.screenshot({
        path: filePath,
        type: 'png',
        fullPage: false
      });
      return `/screenshots/${fileName}`;
    } catch (fallbackError) {
      console.error('Failed to capture fallback screenshot:', fallbackError);
      throw error; // Re-throw the original error
    }
  }
}

export async function POST(req: Request) {
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
    const { url, timestamps = [30, 60, 90], useFallback = true } = await req.json();
    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    try {
      await fs.mkdir(screenshotsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }

    let screenshots: Screenshot[] = [];

    try {
      // Launch browser with improved settings
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
          // Check if screenshot already exists
          const fileName = `${videoId}_${timestamp}.png`;
          const filePath = path.join(screenshotsDir, fileName);
          
          try {
            await fs.access(filePath);
            screenshots.push({
              url: `/screenshots/${fileName}`,
              timestamp: timestamp
            });
            continue;
          } catch {
            // Screenshot doesn't exist, create it
          }

          const screenshotUrl = await captureVideoScreenshot(page, videoId, timestamp);
          screenshots.push({
            url: screenshotUrl,
            timestamp: timestamp
          });
          
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
      await cleanup();
    }

    // If no screenshots were captured and fallback is enabled, use YouTube thumbnails
    if (screenshots.length === 0 && useFallback) {
      screenshots = await getYouTubeThumbnails(videoId, timestamps);
    }

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: 'Failed to capture any screenshots. Using fallback thumbnails.' },
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
