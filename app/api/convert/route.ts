import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { PromptService } from '../../services/promptService';

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
    const { 
      url, 
      screenshots = [], 
      seo, 
      headlines, 
      tableOfContents = true,
      detailLevel = 'comprehensive', 
      wordCount = 2000,
      includeFeaturedImage = true,
      includeScreenshots = true,
      writingStyle = 'default',
      screenshotCount = 3
    } = await req.json();

    console.log('Starting conversion for URL:', url);

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

    // Get video metadata
    let videoMetadata: VideoMetadata;
    try {
      videoMetadata = await fetchVideoMetadata(videoId);
      console.log('Video metadata fetched:', videoMetadata.title);
    } catch (error) {
      console.error('Failed to fetch video metadata:', error);
      videoMetadata = { title: 'Video Analysis', description: '', thumbnail: '' };
    }
    
    // Get video transcript
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      transcriptText = transcript.map((item) => item.text).join(' ');
      console.log('Transcript fetched, length:', transcriptText.length);
      
      if (transcriptText.length < 50) {
        console.warn('Transcript too short, using fallback');
        transcriptText = 'This video contains educational content covering important topics and insights.';
      }
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
      transcriptText = 'This video contains educational content covering important topics and insights.';
    }

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
        model: "gpt-4.1",
        temperature: 0.3,
        max_tokens: 800,
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

    // Step 2: Handle screenshots (simplified approach)
    let finalScreenshots = screenshots;
    let screenshotPlacements: ScreenshotPlacement[] = [];

    if (includeScreenshots && screenshots.length === 0) {
      try {
        // Use simple timestamp generation instead of complex AI analysis
        const simpleTimestamps = generateSimpleTimestamps(screenshotCount);
        console.log('Using simple timestamps:', simpleTimestamps);
        
        // Call screenshot API with simple timestamps
        const screenshotResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/screenshots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            timestamps: simpleTimestamps,
          }),
        });

        if (screenshotResponse.ok) {
          const screenshotData = await screenshotResponse.json();
          finalScreenshots = screenshotData.screenshots || [];
          console.log('Screenshots generated:', finalScreenshots.length);
        }
      } catch (error) {
        console.error('Screenshot generation failed:', error);
        finalScreenshots = [];
      }
    }

    // Create simple screenshot placements
    if (finalScreenshots.length > 0) {
      screenshotPlacements = finalScreenshots.map((screenshot: Screenshot, index: number) => ({
        timestamp: screenshot.timestamp,
        url: screenshot.url,
        section: index === 0 ? "Introduction" : index === finalScreenshots.length - 1 ? "Conclusion" : "Main Content",
        caption: `Screenshot from the video at ${screenshot.timestamp} seconds`,
        reasoning: "Visual reference to support the content",
        context: "Illustrates key points discussed in this section"
      }));
    }

    // Step 3: Generate blog post (simplified prompt)
    console.log('Starting blog generation...');
    
    const simplifiedPrompt = `
      Create a comprehensive blog post based on this video content:
      
      Video Title: ${videoMetadata.title || 'Educational Video Content'}
      Content Type: ${contentAnalysis.contentType}
      Transcript: ${cleanedTranscript}
      
      ${finalScreenshots.length > 0 ? `
      Include these screenshots in your blog post:
      ${screenshotPlacements.map(p => `![${p.caption}](${p.url})`).join('\n')}
      ` : ''}
      
      Create a ${wordCount}-word blog post that:
      1. Has a clear, engaging title
      2. Uses proper markdown formatting (# ## ###)
      ${tableOfContents ? '3. Includes a Table of Contents with clickable links to sections' : '3. Does NOT include a Table of Contents'}
      4. Provides valuable insights and information
      5. Is well-structured and easy to read
      6. Includes practical takeaways
      ${seo ? '7. Is SEO optimized with relevant keywords' : ''}
      ${headlines ? '8. Uses engaging headlines and subheadings' : ''}
      
      ${tableOfContents ? `
      FORMAT: Start with the title, then add a "## Table of Contents" section with links like:
      - [Introduction](#introduction)
      - [Key Points](#key-points)
      - [Conclusion](#conclusion)
      
      Then write the full blog post with matching section headers.
      ` : 'FORMAT: Start with the title, then write the full blog post with clear section headers (but no table of contents).'}
      
      Write ONLY clean, readable content in English. Use proper markdown formatting.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert blog writer. Create high-quality, engaging content based on video transcripts. Always use proper markdown formatting and write in clear, professional English."
        },
        {
          role: "user",
          content: simplifiedPrompt
        }
      ],
      model: "gpt-4.1",
      temperature: 0.7,
      max_tokens: Math.min(wordCount * 2, 4000),
    });

    const blogContent = completion.choices[0].message.content || '';
    console.log('Blog content generated, length:', blogContent.length);

    if (!blogContent || blogContent.length < 200) {
      throw new Error('Generated content too short or empty');
    }

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
      }
    });

  } catch (error: unknown) {
    console.error('Conversion error:', error);
    
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

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
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
