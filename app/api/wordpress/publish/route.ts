import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import BlogPost from '../../../../models/BlogPost';

interface WordPressConfig {
  url: string;
  username: string;
  password: string; // Application Password
}

interface WordPressPost {
  title: string;
  content: string;
  status: 'draft' | 'publish';
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  excerpt?: string;
  meta?: {
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
    _yoast_wpseo_focuskw?: string;
  };
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to publish posts.' },
        { status: 401 }
      );
    }

    const { postId, wordpressConfig, publishSettings } = await req.json();

    if (!postId || !wordpressConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: postId and wordpressConfig' },
        { status: 400 }
      );
    }

    // Validate WordPress config
    const { url, username, password } = wordpressConfig as WordPressConfig;
    if (!url || !username || !password) {
      return NextResponse.json(
        { error: 'WordPress configuration incomplete. Please provide URL, username, and application password.' },
        { status: 400 }
      );
    }

    // Connect to database and fetch the blog post
    await connectToDatabase();
    const blogPost = await BlogPost.findOne({ _id: postId, clerkId: userId });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found or you do not have permission to access it' },
        { status: 404 }
      );
    }

    console.log('🚀 Starting WordPress publishing process...');
    console.log('📝 Post title:', blogPost.title);

    // Create authorization header
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = `Basic ${credentials}`;

    // Get base URL for resolving relative image paths
    const baseUrl = getBaseUrl(req);

    // Step 1: Process and upload images
    console.log('📸 Processing images...');
    const processedContent = await processAndUploadImages(
      blogPost.content, 
      url, 
      authHeader,
      baseUrl
    );

    console.log('✅ Images processed successfully');
    console.log('📊 Content transformation check:');
    console.log('   Original content length:', blogPost.content.length);
    console.log('   Processed content length:', processedContent.length);
    console.log('   Content changed:', blogPost.content !== processedContent ? 'YES' : 'NO');

    // Step 2: Prepare WordPress post data with processed content
    const wordpressPost: WordPressPost = {
      title: blogPost.title,
      content: convertMarkdownToWordPress(processedContent),
      status: publishSettings?.status || 'draft',
      excerpt: generateExcerpt(blogPost.content),
    };

    console.log('📄 Final WordPress post data:');
    console.log('   Title:', wordpressPost.title);
    console.log('   Content length:', wordpressPost.content.length);
    console.log('   Status:', wordpressPost.status);
    
    // Debug: Check for WordPress URLs in final content
    const wpUrlPattern = /https?:\/\/[^\/]*\/wp-content\/uploads\/[^\s"'<>)]+/g;
    const wpUrls = wordpressPost.content.match(wpUrlPattern);
    if (wpUrls) {
      console.log('🔗 WordPress URLs found in final content:', wpUrls.length);
      wpUrls.forEach((url, index) => {
        console.log(`   ${index + 1}: ${url}`);
      });
    } else {
      console.log('⚠️ No WordPress URLs found in final HTML content');
      console.log('📝 Final content sample:', wordpressPost.content.substring(0, 500) + '...');
    }

    // Add SEO metadata if available
    if (blogPost.primaryKeyphrase || publishSettings?.metaTitle || publishSettings?.metaDescription) {
      wordpressPost.meta = {
        _yoast_wpseo_title: publishSettings?.metaTitle || blogPost.title,
        _yoast_wpseo_metadesc: publishSettings?.metaDescription || generateExcerpt(blogPost.content),
        _yoast_wpseo_focuskw: blogPost.primaryKeyphrase || '',
      };
    }

    // Step 3: Create WordPress API endpoint and publish
    const wpApiUrl = `${url.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
    
    console.log('📤 Publishing to WordPress:', wpApiUrl);

    // Publish to WordPress
    const response = await fetch(wpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(wordpressPost),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('WordPress API Error:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'WordPress authentication failed. Please check your username and application password.' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { error: 'WordPress permission denied. Make sure your user has permission to create posts.' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: `WordPress publishing failed: ${errorData}` },
          { status: response.status }
        );
      }
    }

    const wordpressResponse = await response.json();
    console.log('✅ Successfully published to WordPress:', wordpressResponse.id);

    // Update blog post with WordPress info
    await BlogPost.findByIdAndUpdate(postId, {
      $set: {
        'wordpress.postId': wordpressResponse.id,
        'wordpress.url': wordpressResponse.link,
        'wordpress.publishedAt': new Date(),
        'wordpress.status': wordpressResponse.status,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post and images successfully published to WordPress!',
      wordpress: {
        postId: wordpressResponse.id,
        url: wordpressResponse.link,
        status: wordpressResponse.status,
        title: wordpressResponse.title?.rendered || wordpressResponse.title || blogPost.title,
      },
    });

  } catch (error: unknown) {
    console.error('Error publishing to WordPress:', error);
    
    return NextResponse.json({
      error: 'Failed to publish to WordPress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to process and upload images to WordPress
async function processAndUploadImages(
  content: string, 
  wordpressUrl: string, 
  authHeader: string,
  baseUrl: string
): Promise<string> {
  // Extract all image markdown patterns
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches = Array.from(content.matchAll(imagePattern));
  
  if (matches.length === 0) {
    console.log('📷 No images found in content');
    return content;
  }

  console.log(`📷 Found ${matches.length} images to upload`);
  console.log(`🌐 Base URL for relative paths: ${baseUrl}`);
  console.log('📝 Original content preview:', content.substring(0, 200) + '...');
  
  let processedContent = content;
  let successCount = 0;
  let failCount = 0;

  // Process each image sequentially to ensure proper replacement
  for (let i = 0; i < matches.length; i++) {
    const [fullMatch, altText, imageUrl] = matches[i];
    
    try {
      console.log(`📤 Uploading image ${i + 1}/${matches.length}:`);
      console.log(`   Original URL: ${imageUrl}`);
      console.log(`   Full match: ${fullMatch}`);
      
      // Upload image to WordPress
      const wordpressImageUrl = await uploadImageToWordPress(
        imageUrl, 
        altText, 
        wordpressUrl, 
        authHeader,
        baseUrl
      );
      
      if (wordpressImageUrl) {
        // Create the new markdown with WordPress URL
        const newImageMarkdown = `![${altText}](${wordpressImageUrl})`;
        
        // Escape special regex characters in the fullMatch for safe replacement
        const escapedFullMatch = fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace the original markdown with new WordPress URL using escaped pattern
        const regex = new RegExp(escapedFullMatch, 'g');
        const updatedContent = processedContent.replace(regex, newImageMarkdown);
        
        if (updatedContent !== processedContent) {
          processedContent = updatedContent;
          console.log(`✅ Image ${i + 1} uploaded and replaced successfully:`);
          console.log(`   WordPress URL: ${wordpressImageUrl}`);
          console.log(`   New markdown: ${newImageMarkdown}`);
          successCount++;
        } else {
          console.log(`⚠️ Image ${i + 1} uploaded but URL replacement failed`);
          console.log(`   Expected to replace: ${fullMatch}`);
          console.log(`   With: ${newImageMarkdown}`);
          console.log(`   Escaped pattern: ${escapedFullMatch}`);
          failCount++;
        }
      } else {
        console.log(`⚠️ Image ${i + 1} upload failed, keeping original URL`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Error uploading image ${i + 1}:`, error);
      failCount++;
      // Keep original URL if upload fails
    }
  }

  console.log(`📊 Image upload summary: ${successCount} successful, ${failCount} failed`);
  console.log('📝 Final content preview:', processedContent.substring(0, 200) + '...');
  
  return processedContent;
}

// Helper function to upload a single image to WordPress media library
async function uploadImageToWordPress(
  imageUrl: string, 
  altText: string, 
  wordpressUrl: string, 
  authHeader: string,
  baseUrl: string
): Promise<string | null> {
  try {
    // Convert relative URLs to absolute URLs
    const absoluteImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    
    console.log(`🔗 Resolved image URL: ${imageUrl} -> ${absoluteImageUrl}`);
    
    // Fetch the image
    const imageResponse = await fetch(absoluteImageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${absoluteImageUrl} (Status: ${imageResponse.status})`);
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Generate filename
    const filename = generateImageFilename(imageUrl, altText);
    
    // Create FormData for upload
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: contentType });
    formData.append('file', blob, filename);
    formData.append('alt_text', altText || '');
    formData.append('caption', altText || '');

    // Upload to WordPress media library
    const mediaEndpoint = `${wordpressUrl.replace(/\/$/, '')}/wp-json/wp/v2/media`;
    
    const uploadResponse = await fetch(mediaEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`WordPress media upload failed:`, errorText);
      return null;
    }

    const mediaData = await uploadResponse.json();
    console.log(`📸 Image uploaded to WordPress media library:`, mediaData.id);
    
    // Return the WordPress URL
    return mediaData.source_url || mediaData.guid?.rendered || null;

  } catch (error) {
    console.error('Error uploading image to WordPress:', error);
    return null;
  }
}

// Helper function to generate appropriate filename
function generateImageFilename(imageUrl: string, altText: string): string {
  try {
    // Try to get filename from URL
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // Check if last part looks like a filename
    if (lastPart && lastPart.includes('.') && lastPart.length < 100) {
      return lastPart.split('?')[0]; // Remove query parameters
    }
    
    // Generate from alt text
    if (altText) {
      const safeName = altText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      return `${safeName}.jpg`;
    }
    
    // Fallback
    return `image-${Date.now()}.jpg`;
  } catch (error) {
    return `image-${Date.now()}.jpg`;
  }
}

// Helper function to convert markdown to WordPress-compatible HTML
function convertMarkdownToWordPress(markdown: string): string {
  console.log('🔄 Converting markdown to HTML...');
  console.log('📝 Input markdown preview:', markdown.substring(0, 300) + '...');
  
  let html = markdown
    // Convert headers first
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Convert bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Convert images FIRST (before links to avoid conflicts)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imageUrl) => {
      console.log(`🖼️ Converting image: ${match}`);
      const imgTag = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto;" />`;
      console.log(`   Result: ${imgTag}`);
      return imgTag;
    })
    
    // Convert links AFTER images (using negative lookbehind to avoid matching images)
    .replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Convert unordered lists
    .replace(/^\* (.+)/gm, '<li>$1</li>')
    
    // Convert ordered lists  
    .replace(/^\d+\. (.+)/gm, '<li>$1</li>')
    
    // Convert code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Convert paragraphs - split by double newlines first
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      
      // Don't wrap already formatted elements in paragraphs
      if (paragraph.match(/^<(h[1-6]|img|pre|ul|ol|li)/)) {
        return paragraph;
      }
      
      // Handle list items specially
      if (paragraph.includes('<li>')) {
        if (paragraph.includes('* ')) {
          return `<ul>${paragraph}</ul>`;
        } else if (paragraph.match(/^\d+\./)) {
          return `<ol>${paragraph}</ol>`;
        }
      }
      
      return `<p>${paragraph}</p>`;
    })
    .join('\n\n')
    
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    
    // Fix nested list formatting
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol>/g, '');

  console.log('✅ HTML conversion complete');
  console.log('📝 Output HTML preview:', html.substring(0, 300) + '...');
  
  // Log any remaining images for debugging
  const imageMatches = html.match(/<img[^>]+>/g);
  if (imageMatches) {
    console.log(`🖼️ Found ${imageMatches.length} images in final HTML:`);
    imageMatches.forEach((img, index) => {
      console.log(`   ${index + 1}: ${img}`);
    });
  } else {
    console.log('⚠️ No images found in final HTML');
  }
  
  return html;
}

// Helper function to generate excerpt from content
function generateExcerpt(content: string, length: number = 155): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Truncate to specified length
  if (plainText.length <= length) {
    return plainText;
  }

  // Find the last complete sentence within the length limit
  const truncated = plainText.substring(0, length);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > length * 0.7) {
    return plainText.substring(0, lastSentence + 1);
  }
  
  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return plainText.substring(0, lastSpace > 0 ? lastSpace : length) + '...';
}

// Helper function to get base URL from request
function getBaseUrl(req: Request): string {
  const url = new URL(req.url);
  return url.origin;
} 