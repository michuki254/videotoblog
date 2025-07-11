import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { PromptService } from '../../services/promptService';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import BlogPost from '../../../models/BlogPost';

// Add proper interfaces
interface Screenshot {
  url: string;
  timestamp: number;
}

interface ScreenshotPlacement {
  timestamp: number;
  url: string;
  section: string;
  caption: string;
  reasoning: string;
  context?: string;
}

interface VideoMetadata {
  title: string;
  description: string;
  thumbnail: string;
}

interface ContentAnalysis {
  contentType: string;
  confidence: number;
  reasoning: string;
  suggestedStructure: {
    title: string;
    sections: string[];
    tone: string;
    format: string;
  };
  keyTopics: string[];
  targetAudience: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to convert videos.' },
        { status: 401 }
      );
    }

    const { 
      url, 
      primaryKeyphrase = '',
      screenshots = [], 
      seo, 
      headlines, 
      tableOfContents = true,
      detailLevel = 'comprehensive', 
      wordCount = 2000,
      includeFeaturedImage = true,
      includeScreenshots = 'auto',
      writingStyle = {},
      customInstructions = '',
      screenshotCount = 3
    } = await req.json();

    // Extract writing style options with defaults
    const {
      tone = 'auto',
      pointOfView = 'auto',
      useEmojis = false,
      format = 'auto',
      useChaptersAsOutline = false,
      addTableOfContents = tableOfContents,
      addFAQs = false,
      addVideoAttribution = false,
      addCTA = false
    } = writingStyle;

    console.log('Starting conversion for URL:', url, 'User:', userId);
    console.log('Writing Style Options:', writingStyle);

    // Connect to database
    await connectToDatabase();

    // Get or create user in database
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // Create user if doesn't exist (will be updated with full details later)
      user = await User.create({
        clerkId: userId,
        email: `user-${userId}@temp.com`, // Temporary email, will be updated
      });
    }

    // Extract video ID for metadata
    const videoId = extractVideoId(url);
    if (!videoId) {
      console.error('Invalid video ID extracted from URL:', url);
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log('Video ID extracted:', videoId);

    // Check if this video has already been converted by this user
    const existingBlogPost = await BlogPost.findOne({ 
      clerkId: userId, 
      videoId: videoId 
    });

    if (existingBlogPost) {
      console.log('Returning existing blog post for video:', videoId);
      return NextResponse.json({
        blogPost: existingBlogPost.content,
        title: existingBlogPost.title,
        thumbnail: existingBlogPost.thumbnail || '',
        screenshotPlacements: [],
        intelligentTimestamps: [],
        contentAnalysis: existingBlogPost.contentAnalysis,
        existingPost: true,
        postId: existingBlogPost._id,
      });
    }

    // Parallel fetch video metadata and transcript for speed
    console.log('Starting parallel fetch of metadata and transcript...');
    const [videoMetadata, transcriptText] = await Promise.all([
      // Fetch video metadata
      fetchVideoMetadata(videoId).catch(error => {
        console.error('Failed to fetch video metadata:', error);
        return { title: 'Video Analysis', description: '', thumbnail: '' };
      }),
      // Fetch transcript
      YoutubeTranscript.fetchTranscript(url)
        .then(transcript => {
          const text = transcript.map((item) => item.text).join(' ');
          console.log('Transcript fetched, length:', text.length);
          return text.length < 50 
            ? 'This video contains educational content covering important topics and insights.'
            : text;
        })
        .catch(error => {
          console.error('Failed to fetch transcript:', error);
          return 'This video contains educational content covering important topics and insights.';
        })
    ]);
    
    console.log('Video metadata fetched:', videoMetadata.title);

    // Clean the transcript
    const cleanedTranscript = PromptService.cleanTranscriptText(transcriptText);
    console.log('Transcript cleaned, length:', cleanedTranscript.length);

    // Step 1: Analyze content type (simplified)
    let contentAnalysis: ContentAnalysis = {
      contentType: "EDUCATIONAL",
      confidence: 0.8,
      reasoning: "Video content analysis based on available information",
      suggestedStructure: {
        title: videoMetadata.title || "Video Content Guide",
        sections: ["Introduction", "Main Content", "Key Insights", "Conclusion"],
        tone: "informative",
        format: "structured"
      },
      keyTopics: ["education", "insights", "learning"],
      targetAudience: "general"
    };

    // Try AI analysis but don't fail if it doesn't work
    try {
      const contentAnalysisPrompt = PromptService.generateContentAnalysisPrompt(
        cleanedTranscript, 
        videoMetadata
      );

      const analysisCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist. Respond with valid JSON only."
          },
          {
            role: "user",
            content: contentAnalysisPrompt
          }
        ],
        model: "gpt-3.5-turbo", // Faster model for initial analysis
        temperature: 0.3,
        max_tokens: 500,
      });

      if (analysisCompletion.choices[0].message.content) {
        let responseContent = analysisCompletion.choices[0].message.content;
        responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysisData = JSON.parse(responseContent);
        contentAnalysis = { ...contentAnalysis, ...analysisData };
        console.log('Content analysis completed:', contentAnalysis.contentType);
      }
    } catch (error) {
      console.error('Content analysis failed, using fallback:', error);
    }

    // Build dynamic writing style instructions FIRST (before using them)
    let styleInstructions = '';
    
    if (tone !== 'auto') {
      styleInstructions += `\n- Use a ${tone} tone throughout the content`;
    }
    
    if (pointOfView !== 'auto') {
      const povMap: { [key: string]: string } = {
        'first-person': 'first person (I, we)',
        'second-person': 'second person (you)',
        'third-person': 'third person (they, it)'
      };
      styleInstructions += `\n- Write in ${povMap[pointOfView] || pointOfView}`;
    }
    
    if (useEmojis) {
      styleInstructions += `\n- Include relevant emojis to make the content more engaging`;
    }
    
    if (format !== 'auto') {
      const formatMap: { [key: string]: string } = {
        'article': 'an informative article format',
        'tutorial': 'a step-by-step tutorial format',
        'listicle': 'a listicle format with numbered or bulleted points',
        'guide': 'a comprehensive guide format',
        'review': 'a review format with pros/cons',
        'how-to': 'a how-to format with clear instructions'
      };
      styleInstructions += `\n- Structure the content as ${formatMap[format] || format}`;
    }
    
    if (useChaptersAsOutline) {
      styleInstructions += `\n- Use the video's natural chapters/sections as the blog outline`;
    }
    
    // Build content sections to include
    let additionalSections = '';
    
    if (addFAQs) {
      additionalSections += `\n- Include a comprehensive FAQ section at the end addressing common questions about the topic`;
    }
    
    if (addVideoAttribution) {
      additionalSections += `\n- Add a "Video Source" or "Original Video" section crediting the original video`;
    }
    
    if (addCTA) {
      additionalSections += `\n- Include a compelling call-to-action (CTA) at the end encouraging reader engagement`;
    }

    // Handle screenshots first if needed
    console.log('Processing screenshots and blog generation...');
    
    let finalScreenshots = screenshots;
    let screenshotPlacements: ScreenshotPlacement[] = [];
    let tempBlogPostId: any = null;
    
    if (includeScreenshots && screenshots.length === 0) {
      try {
        // First, we need to create a temporary blog post to get an ID
        console.log('Creating temporary blog post for screenshots...');
        const tempBlogPost = await BlogPost.create({
          userId: user._id,
          clerkId: userId,
          title: 'Generating...',
          content: 'Generating blog content...',
          videoUrl: url,
          videoId: videoId,
          thumbnail: videoMetadata.thumbnail || '',
          wordCount: 0,
          contentType: contentAnalysis.contentType,
          status: 'draft',
          seoOptimized: false,
          hasScreenshots: false,
          screenshotCount: 0,
          screenshots: [],
          hasTableOfContents: false,
          detailLevel: detailLevel,
          contentAnalysis: {
            contentType: contentAnalysis.contentType,
            confidence: contentAnalysis.confidence,
            reasoning: contentAnalysis.reasoning,
            targetAudience: contentAnalysis.targetAudience,
            keyTopics: contentAnalysis.keyTopics,
            suggestedTone: contentAnalysis.suggestedStructure.tone
          },
        });
        
        // Use intelligent timestamp generation if we have a transcript
        let timestamps: number[];
        console.log('Screenshot generation settings:', {
          includeScreenshots,
          transcriptLength: transcriptText?.length || 0,
          screenshotCount
        });
        
        if (includeScreenshots === 'auto' && transcriptText && transcriptText.length > 100) {
          console.log('Generating intelligent timestamps based on content...');
          timestamps = await generateIntelligentTimestamps(
            transcriptText,
            screenshotCount,
            contentAnalysis,
            openai
          );
          console.log('Using intelligent timestamps:', timestamps);
        } else {
          console.log('Falling back to simple timestamps because:', {
            isAuto: includeScreenshots === 'auto',
            hasTranscript: !!transcriptText,
            transcriptLength: transcriptText?.length || 0
          });
          timestamps = generateSimpleTimestamps(screenshotCount);
          console.log('Using simple timestamps:', timestamps);
        }
        
        // Call screenshot API with timestamps and blog post ID
        console.log('Calling screenshot API with:', {
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/screenshots`,
          videoUrl: url,
          timestamps: timestamps,
          blogPostId: tempBlogPost._id.toString()
        });
        
        const screenshotResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/screenshots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            timestamps: timestamps,
            blogPostId: tempBlogPost._id.toString(),
          }),
        });

        if (screenshotResponse.ok) {
          const screenshotData = await screenshotResponse.json();
          finalScreenshots = screenshotData.screenshots || [];
          console.log('Screenshots generated:', finalScreenshots.length);
        } else {
          console.error('Screenshot API returned error status:', screenshotResponse.status);
          try {
            const errorData = await screenshotResponse.json();
            console.error('Screenshot API error details:', errorData);
          } catch (e) {
            console.error('Could not parse screenshot error response');
          }
          // Continue without screenshots rather than failing the entire conversion
          finalScreenshots = [];
        }
        
        // We'll update the blog post later with the actual content
        // Store the temp ID for later
        tempBlogPostId = tempBlogPost._id;
      } catch (error) {
        console.error('Screenshot generation failed:', error);
        finalScreenshots = [];
      }
    }
    
    // Create screenshot placements BEFORE generating blog content
    if (finalScreenshots.length > 0) {
      console.log('Processing screenshots for blog generation:', finalScreenshots);
      screenshotPlacements = finalScreenshots.map((screenshot: Screenshot, index: number) => ({
        timestamp: screenshot.timestamp,
        url: screenshot.url,
        section: index === 0 ? "Introduction" : index === finalScreenshots.length - 1 ? "Conclusion" : "Main Content",
        caption: `Screenshot from the video at ${screenshot.timestamp} seconds`,
        reasoning: "Visual reference to support the content",
        context: "Illustrates key points discussed in this section"
      }));
      console.log('Screenshot placements prepared:', screenshotPlacements);
    }

    // Now prepare the blog prompt with screenshots
    const enhancedPrompt = prepareBlogPrompt(
      videoMetadata,
      cleanedTranscript,
      contentAnalysis,
      primaryKeyphrase,
      wordCount,
      customInstructions,
      seo,
      headlines,
      addTableOfContents,
      styleInstructions,
      additionalSections,
      useEmojis,
      screenshotPlacements, // Pass the actual screenshots
      tone
    );
    
    // Generate blog content with screenshots
    console.log('Generating blog content with screenshots...');
    let blogContent = await generateBlogContent(
      openai,
      enhancedPrompt,
      styleInstructions,
      tone,
      wordCount
    );

    if (!blogContent || blogContent.length < 200) {
      throw new Error('Generated content too short or empty');
    }

    // Calculate word count
    const actualWordCount = blogContent.trim().split(/\s+/).length;

    // Generate SEO metadata
    const blogTitle = videoMetadata.title || 'Generated Blog Post';
    const seoMetadata = await generateSEOMetadata(blogTitle, blogContent, contentAnalysis, primaryKeyphrase);
    console.log('Generated SEO metadata:', seoMetadata);

    // Generate tags
    const generatedTags = await generateAITags(blogTitle, blogContent, contentAnalysis);
    console.log('Generated tags:', generatedTags);

    // Save or update blog post to database
    let blogPost;
    if (tempBlogPostId) {
      // Update the temporary blog post with the actual content
      blogPost = await BlogPost.findByIdAndUpdate(
        tempBlogPostId,
        {
          title: blogTitle,
          content: blogContent,
          primaryKeyphrase: primaryKeyphrase || undefined,
          wordCount: actualWordCount,
          seoOptimized: !!seo,
          hasScreenshots: finalScreenshots.length > 0,
          screenshotCount: finalScreenshots.length,
          screenshots: finalScreenshots.map((s: any) => s.id).filter(Boolean),
          hasTableOfContents: !!tableOfContents,
          urlSlug: seoMetadata.urlSlug,
          metaTitle: seoMetadata.metaTitle,
          metaDescription: seoMetadata.metaDescription,
          tags: generatedTags,
        },
        { new: true }
      );
    } else {
      // Create a new blog post if no temp was created
      blogPost = await BlogPost.create({
        userId: user._id,
        clerkId: userId,
        title: blogTitle,
        content: blogContent,
        videoUrl: url,
        videoId: videoId,
        thumbnail: videoMetadata.thumbnail || '',
        primaryKeyphrase: primaryKeyphrase || undefined,
        wordCount: actualWordCount,
        contentType: contentAnalysis.contentType,
        status: 'draft',
        seoOptimized: !!seo,
        hasScreenshots: finalScreenshots.length > 0,
        screenshotCount: finalScreenshots.length,
        screenshots: finalScreenshots.map((s: any) => s.id).filter(Boolean),
        hasTableOfContents: !!tableOfContents,
        detailLevel: detailLevel,
        urlSlug: seoMetadata.urlSlug,
        metaTitle: seoMetadata.metaTitle,
        metaDescription: seoMetadata.metaDescription,
        contentAnalysis: {
          contentType: contentAnalysis.contentType,
          confidence: contentAnalysis.confidence,
          reasoning: contentAnalysis.reasoning,
          targetAudience: contentAnalysis.targetAudience,
          keyTopics: contentAnalysis.keyTopics,
          suggestedTone: contentAnalysis.suggestedStructure.tone
        },
      });
    }

    console.log('Blog post saved to database with ID:', blogPost._id);

    return NextResponse.json({
      blogPost: blogContent,
      title: videoMetadata.title || 'Video Content Analysis',
      thumbnail: videoMetadata.thumbnail || '',
      screenshotPlacements: screenshotPlacements,
      intelligentTimestamps: [], // Simplified for now
      contentAnalysis: {
        contentType: contentAnalysis.contentType,
        confidence: contentAnalysis.confidence,
        reasoning: contentAnalysis.reasoning,
        targetAudience: contentAnalysis.targetAudience,
        keyTopics: contentAnalysis.keyTopics,
        suggestedTone: contentAnalysis.suggestedStructure.tone
      },
      postId: blogPost._id,
      saved: true,
    });

  } catch (error: unknown) {
    console.error('Conversion error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Clean up temporary blog post if it was created
    if (tempBlogPostId) {
      try {
        await BlogPost.findByIdAndDelete(tempBlogPostId);
        console.log('Cleaned up temporary blog post');
      } catch (cleanupError) {
        console.error('Failed to clean up temporary blog post:', cleanupError);
      }
    }
    
    // Return a structured error response instead of throwing
    return NextResponse.json({
      error: 'Conversion failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    }
}

// Helper function for simple timestamp generation
function generateSimpleTimestamps(count: number): number[] {
  const timestamps = [];
  for (let i = 1; i <= count; i++) {
    timestamps.push(i * 60); // Every 60 seconds: 60, 120, 180, etc.
  }
  return timestamps;
}

// Intelligent timestamp generation using AI
async function generateIntelligentTimestamps(
  transcript: string,
  screenshotCount: number,
  contentAnalysis: ContentAnalysis,
  openai: OpenAI
): Promise<number[]> {
  try {
    // Simplified prompt for better reliability
    const prompt = `Find ${screenshotCount} key moments in this video transcript for screenshots.

Video type: ${contentAnalysis.contentType}
Topics: ${contentAnalysis.keyTopics.slice(0, 3).join(', ')}

Transcript excerpt:
${transcript.substring(0, 3000)}

Select timestamps where:
- Important concepts are introduced
- Examples or demonstrations occur
- Key results or conclusions are shown
- Visual content would be most helpful

Return ONLY a JSON array of ${screenshotCount} timestamps in seconds, evenly distributed.
Example: [45, 178, 290]`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing educational video content to identify the most visually valuable moments. Consider the pedagogical value and visual importance of each moment. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo", // Use faster model for better reliability
      temperature: 0.2,
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content || '[]';
    console.log('AI response for timestamps:', response);
    
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const timestamps = JSON.parse(cleanResponse);
    
    // Validate and ensure timestamps are reasonable
    if (Array.isArray(timestamps) && timestamps.length > 0) {
      const validTimestamps = timestamps
        .filter(t => typeof t === 'number' && t > 10) // Skip first 10 seconds
        .map(t => Math.floor(t)) // Ensure integers
        .slice(0, screenshotCount)
        .sort((a, b) => a - b); // Ensure chronological order
      
      if (validTimestamps.length === screenshotCount) {
        console.log('Intelligent timestamps generated successfully:', validTimestamps);
        return validTimestamps;
      } else {
        console.log('Not enough valid timestamps, got:', validTimestamps.length, 'needed:', screenshotCount);
      }
    } else {
      console.log('Invalid timestamp response format:', timestamps);
    }
  } catch (error) {
    console.error('Intelligent timestamp generation failed:', error);
  }
  
  // Fallback to distributed timestamps
  console.log('Using fallback distributed timestamps');
  return generateDistributedTimestamps(screenshotCount);
}

// Better fallback with distributed timestamps
function generateDistributedTimestamps(count: number): number[] {
  const timestamps = [];
  // Start at 30 seconds, end 30 seconds before typical video end
  const startTime = 30;
  const assumedVideoLength = 600; // Assume 10 minute video
  const endTime = assumedVideoLength - 30;
  const interval = (endTime - startTime) / (count + 1);
  
  for (let i = 1; i <= count; i++) {
    timestamps.push(Math.round(startTime + (interval * i)));
  }
  
  return timestamps;
}

// Helper function to prepare blog prompt
function prepareBlogPrompt(
  videoMetadata: VideoMetadata,
  cleanedTranscript: string,
  contentAnalysis: ContentAnalysis,
  primaryKeyphrase: string | undefined,
  wordCount: number,
  customInstructions: string,
  seo: boolean,
  headlines: boolean,
  addTableOfContents: boolean,
  styleInstructions: string,
  additionalSections: string,
  useEmojis: boolean,
  screenshotPlacements: ScreenshotPlacement[],
  tone: string
): string {
  return `
    Create a comprehensive blog post based on this video content:
    
    Video Title: ${videoMetadata.title || 'Educational Video Content'}
    Content Type: ${contentAnalysis.contentType}
    ${primaryKeyphrase ? `Primary Keyphrase (IMPORTANT - Use this strategically throughout the content): "${primaryKeyphrase}"` : ''}
    Transcript: ${cleanedTranscript}
    
    ${customInstructions ? `
    CUSTOM INSTRUCTIONS (PRIORITY - Follow these specific requirements):
    ${customInstructions}
    ` : ''}
    
    ${screenshotPlacements.length > 0 ? `
    VISUAL CONTENT: You have ${screenshotPlacements.length} screenshots to enhance the blog post.
    
    SCREENSHOTS TO INCLUDE (USE THESE EXACT URLS):
    ${screenshotPlacements.map((p, i) => `
    Screenshot ${i + 1}: 
    EXACT URL TO USE: ${p.url}
    Suggested placement: ${p.section}
    Markdown format: ![Descriptive caption here](${p.url})
    `).join('\n')}
    
    CRITICAL SCREENSHOT INTEGRATION RULES:
    - MUST include ALL ${screenshotPlacements.length} screenshots in the blog post
    - Format each screenshot using markdown image syntax: ![Description](${screenshotPlacements.length > 0 ? screenshotPlacements[0].url : 'URL'})
    - NEVER mention timestamps, video timing, or "X seconds into the video"
    - Integrate screenshots naturally where they best illustrate the concept being discussed
    - Introduce each screenshot with context about WHAT it shows, not WHEN it appears
    - Use natural transitions like:
      * "Here's how the interface looks when..."
      * "The following screenshot demonstrates..."
      * "As you can see in this example..."
      * "This view shows..."
    - Write captions that describe the content, not the timing
    - Distribute screenshots throughout the post to support key concepts
    - Each screenshot should feel like a natural part of the narrative
    - IMPORTANT: Always place images on their own line with blank lines before and after
    - Example of proper screenshot integration:
      "The dashboard provides a comprehensive overview of all metrics:
      
      ![Dashboard overview showing key performance metrics](screenshot_url_here)
      
      As shown above, the interface presents data in an intuitive layout..."
    ` : ''}
    
    WRITING STYLE REQUIREMENTS:${styleInstructions || '\n- Use a natural, engaging writing style'}
    
    CONTENT REQUIREMENTS:
    - IMPORTANT: Create a blog post that is approximately ${wordCount} words in length
    - The content MUST be comprehensive and detailed to reach the target word count of ${wordCount} words
    - To achieve ${wordCount} words:
      * Expand on each main point with detailed explanations
      * Include relevant examples and case studies
      * Add context and background information
      * Provide step-by-step breakdowns where applicable
      * Include multiple perspectives or approaches
      * Add practical tips and actionable advice
    - Use a clear, engaging title${primaryKeyphrase ? ` (include "${primaryKeyphrase}" in the title if relevant)` : ''}
    - Use proper markdown formatting (# ## ###)
    ${addTableOfContents ? '- Include a Table of Contents with clickable links to sections' : '- Do NOT include a Table of Contents'}
    - Provide valuable insights and information
    - Be well-structured and easy to read
    - Include practical takeaways
    ${seo ? `- SEO optimize with relevant keywords${primaryKeyphrase ? ` (especially focus on "${primaryKeyphrase}")` : ''}` : ''}
    ${headlines ? '- Use engaging headlines and subheadings' : ''}
    ${primaryKeyphrase ? `- Naturally incorporate the primary keyphrase "${primaryKeyphrase}" throughout the content for SEO (aim for 1-3% density)` : ''}
    ${primaryKeyphrase ? `- Ensure the keyphrase appears in the introduction, at least one subheading, and conclusion` : ''}
    
    ADDITIONAL SECTIONS:${additionalSections || '\n- Focus on the main content without additional sections'}
    
    ${addTableOfContents ? `
    FORMAT: Start with the title, then add a "## Table of Contents" section with links like:
    - [Introduction](#introduction)
    - [Key Points](#key-points)
    - [Conclusion](#conclusion)
    
    Then write the full blog post with matching section headers.
    ` : 'FORMAT: Start with the title, then write the full blog post with clear section headers (but no table of contents).'}
    
    ${primaryKeyphrase ? `SEO FOCUS: Remember to strategically use "${primaryKeyphrase}" throughout the content while maintaining natural readability.` : ''}
    
    QUALITY STANDARDS:
    - Write naturally as if explaining to a colleague, not describing a video
    - Focus on the knowledge and insights, not the video format
    - Create standalone content that provides value without watching the video
    - Use professional, engaging language appropriate for ${contentAnalysis.targetAudience}
    - Ensure smooth transitions between sections
    - Make the content scannable with clear headings and structure
    
    Write ONLY clean, readable content in English. Use proper markdown formatting.
    ${useEmojis ? 'Feel free to use emojis where appropriate to enhance engagement.' : ''}
    
    FINAL REMINDERS: 
    1. The blog post MUST be approximately ${wordCount} words in length. Expand on topics, add examples, and provide comprehensive coverage to meet this target.
    ${screenshotPlacements.length > 0 ? `2. You MUST include ALL ${screenshotPlacements.length} screenshots provided above using the EXACT URLs given in markdown image format.` : ''}
  `;
}

// Helper function to generate blog content
async function generateBlogContent(
  openai: OpenAI,
  enhancedPrompt: string,
  styleInstructions: string,
  tone: string,
  wordCount: number
): Promise<string> {
  console.log('Generating blog content for target word count:', wordCount);
  
  // Calculate appropriate max_tokens (1 word ≈ 1.5 tokens on average)
  // Add extra buffer to ensure we get enough content
  const targetTokens = Math.min(Math.floor(wordCount * 1.8), 12000);
  console.log('Using max_tokens:', targetTokens);
  
  // For longer content, we might need to make multiple calls
  if (wordCount >= 1500) {
    // Generate content in sections for better results
    const sections = [
      'introduction and first main section',
      'middle sections with detailed explanations',
      'final sections and conclusion'
    ];
    
    let fullContent = '';
    let previousContent = '';
    
    for (let i = 0; i < sections.length; i++) {
      const sectionWordCount = Math.floor(wordCount / sections.length);
      const sectionPrompt = i === 0 ? enhancedPrompt : `
        Continue writing the blog post. Here's what has been written so far:
        
        ${previousContent.slice(-1000)}
        
        Now continue with the ${sections[i]}. Target approximately ${sectionWordCount} more words.
        Maintain the same style and tone. Do not repeat content already written.
        ${i === sections.length - 1 ? 'Include a strong conclusion.' : ''}
        
        IMPORTANT: You still need to include the remaining screenshots that haven't been used yet.
        Remember to format them as markdown images: ![Description](URL)
      `;
      
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert blog writer. Create high-quality, engaging content based on video transcripts. Always use proper markdown formatting and write in clear, professional English. ${styleInstructions ? `Follow these style guidelines: ${styleInstructions}` : ''}`
          },
          {
            role: "user",
            content: sectionPrompt
          }
        ],
        model: "gpt-4-turbo-preview",
        temperature: tone === 'formal' ? 0.3 : tone === 'enthusiastic' ? 0.8 : 0.7,
        max_tokens: Math.floor(targetTokens / sections.length),
      });
      
      const sectionContent = completion.choices[0].message.content || '';
      
      if (i === 0) {
        fullContent = sectionContent;
      } else {
        // Remove any repeated title or introduction from continuation
        const cleanedSection = sectionContent.replace(/^#.*?\n\n/, '').trim();
        fullContent += '\n\n' + cleanedSection;
      }
      
      previousContent = fullContent;
    }
    
    return fullContent;
  } else {
    // For shorter content, single call is sufficient
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert blog writer. Create high-quality, engaging content based on video transcripts. Always use proper markdown formatting and write in clear, professional English. ${styleInstructions ? `Follow these style guidelines: ${styleInstructions}` : ''}`
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: tone === 'formal' ? 0.3 : tone === 'enthusiastic' ? 0.8 : 0.7,
      max_tokens: targetTokens,
    });

    return completion.choices[0].message.content || '';
  }
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Function to generate tags using AI
async function generateAITags(title: string, content: string, contentAnalysis: ContentAnalysis): Promise<string[]> {
  try {
    const prompt = `Analyze this blog post and generate relevant tags/keywords:

Title: ${title}
Content Type: ${contentAnalysis.contentType}
Target Audience: ${contentAnalysis.targetAudience}
Key Topics: ${contentAnalysis.keyTopics.join(', ')}

Blog Content (first 1000 chars): ${content.substring(0, 1000)}...

Generate 8-12 relevant tags that:
1. Capture the main topics and themes
2. Include both broad and specific terms
3. Are suitable for content discovery and SEO
4. Mix single words and short phrases
5. Are relevant to the ${contentAnalysis.targetAudience} audience

Return only a JSON array of tags, like: ["tag1", "tag2", "tag3"]`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a content tagging expert. Generate relevant, SEO-friendly tags for blog posts. Respond only with a JSON array of strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.5,
      max_tokens: 150,
    });

    // Clean and parse response
    let responseContent = completion.choices[0].message.content || '[]';
    responseContent = responseContent.trim();
    
    // Remove markdown code blocks if present
    if (responseContent.startsWith('```json')) {
      responseContent = responseContent.substring(7);
    }
    if (responseContent.startsWith('```')) {
      responseContent = responseContent.substring(3);
    }
    if (responseContent.endsWith('```')) {
      responseContent = responseContent.substring(0, responseContent.length - 3);
    }
    
    const tags = JSON.parse(responseContent.trim());
    
    // Validate and clean tags
    if (Array.isArray(tags)) {
      return tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim())
        .slice(0, 12); // Limit to 12 tags
    }
    
    throw new Error('Invalid tag format');
  } catch (error) {
    console.error('Error generating AI tags:', error);
    // Fallback to basic tag generation
    return generateBasicTags(title, content, contentAnalysis);
  }
}

// Fallback function for basic tag generation
function generateBasicTags(title: string, content: string, contentAnalysis: ContentAnalysis): string[] {
  const tags = new Set<string>();
  
  // Add content type
  tags.add(contentAnalysis.contentType.toLowerCase());
  
  // Add key topics
  contentAnalysis.keyTopics.forEach(topic => tags.add(topic));
  
  // Extract keywords from title
  const titleWords = title.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(word));
  
  titleWords.slice(0, 3).forEach(word => tags.add(word));
  
  // Add some generic relevant tags based on content type
  if (contentAnalysis.contentType === 'TUTORIAL') {
    tags.add('how-to');
    tags.add('guide');
  } else if (contentAnalysis.contentType === 'REVIEW') {
    tags.add('review');
    tags.add('analysis');
  } else if (contentAnalysis.contentType === 'NEWS') {
    tags.add('news');
    tags.add('update');
  }
  
  return Array.from(tags).slice(0, 10);
}

// Function to generate SEO metadata
async function generateSEOMetadata(title: string, content: string, contentAnalysis: ContentAnalysis, primaryKeyphrase?: string) {
  // Generate URL slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 60); // Limit to reasonable length
  };

  // Generate meta title
  const generateMetaTitle = (title: string, primaryKeyphrase?: string) => {
    // If title is already good length, use it
    if (title.length >= 40 && title.length <= 60) return title;
    
    // If too long, truncate smartly
    if (title.length > 60) {
      return title.substring(0, 57) + '...';
    }
    
    // If too short and we have keyphrase, enhance it
    if (title.length < 40 && primaryKeyphrase) {
      return `${title} - ${primaryKeyphrase}`.substring(0, 60);
    }
    
    return title;
  };

  // Generate meta description
  const generateMetaDescription = (content: string, contentAnalysis: ContentAnalysis, primaryKeyphrase?: string) => {
    // Remove markdown formatting
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n{2,}/g, ' ')
      .replace(/[-*_]{3,}/g, '')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .trim();

    // Get first meaningful sentence
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    let description = sentences[0]?.trim() || plainText.substring(0, 150);

    // Include primary keyphrase if not already present and there's room
    if (primaryKeyphrase && !description.toLowerCase().includes(primaryKeyphrase.toLowerCase()) && description.length < 120) {
      description = `${description}. ${primaryKeyphrase.charAt(0).toUpperCase() + primaryKeyphrase.slice(1)}`;
    }

    // Ensure proper length
    if (description.length > 155) {
      description = description.substring(0, 152) + '...';
    } else if (description.length < 120) {
      // Add call to action if too short
      description += '. Read more to discover key insights.';
    }

    return description;
  };

  try {
    // Try to generate with AI for better results
    const aiPrompt = `Generate SEO metadata for this blog post:
Title: ${title}
Content Type: ${contentAnalysis.contentType}
Target Audience: ${contentAnalysis.targetAudience}
Key Topics: ${contentAnalysis.keyTopics.join(', ')}
${primaryKeyphrase ? `Primary Keyphrase: ${primaryKeyphrase}` : ''}

Generate:
1. URL Slug (3-8 words, lowercase, hyphens, no special characters)
2. Meta Title (50-60 characters, compelling, includes main keyword)
3. Meta Description (140-155 characters, includes keywords, has call-to-action)

Respond in JSON format:
{
  "urlSlug": "your-seo-friendly-url",
  "metaTitle": "Your Compelling Meta Title",
  "metaDescription": "Your engaging meta description that encourages clicks..."
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Generate optimized metadata that follows best practices. Respond only with valid JSON."
        },
        {
          role: "user",
          content: aiPrompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.3,
      max_tokens: 200,
    });

    // Clean the response - remove markdown code blocks if present
    let responseContent = completion.choices[0].message.content || '{}';
    responseContent = responseContent.trim();
    
    // Remove ```json and ``` if present
    if (responseContent.startsWith('```json')) {
      responseContent = responseContent.substring(7);
    }
    if (responseContent.startsWith('```')) {
      responseContent = responseContent.substring(3);
    }
    if (responseContent.endsWith('```')) {
      responseContent = responseContent.substring(0, responseContent.length - 3);
    }
    
    responseContent = responseContent.trim();
    
    const aiMetadata = JSON.parse(responseContent);
    
    return {
      urlSlug: aiMetadata.urlSlug || generateSlug(title),
      metaTitle: aiMetadata.metaTitle || generateMetaTitle(title, primaryKeyphrase),
      metaDescription: aiMetadata.metaDescription || generateMetaDescription(content, contentAnalysis, primaryKeyphrase)
    };
  } catch (error) {
    console.error('Error generating AI metadata, using fallback:', error);
    // Fallback to local generation
    return {
      urlSlug: generateSlug(title),
      metaTitle: generateMetaTitle(title, primaryKeyphrase),
      metaDescription: generateMetaDescription(content, contentAnalysis, primaryKeyphrase)
    };
  }
}

// Function to fetch video metadata
async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  try {
    // Using YouTube Data API v3 (requires API key)
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return { title: '', description: '', thumbnail: '' };
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      return {
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || '',
      };
    }
    
    return { title: '', description: '', thumbnail: '' };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return { title: '', description: '', thumbnail: '' };
  }
}
