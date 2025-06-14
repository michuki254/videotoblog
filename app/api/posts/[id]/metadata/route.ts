import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '../../../../../lib/mongodb'
import BlogPost from '../../../../../models/BlogPost'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface MetadataResponse {
  urlSlug: string
  metaTitle: string
  metaDescription: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const field = searchParams.get('field') // 'urlSlug', 'metaTitle', 'metaDescription', or null for all

    await connectDB()
    
    const { id } = await params
    
    const post = await BlogPost.findOne({
      _id: id,
      clerkId: userId
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Generate different prompts based on the field requested
    let prompt = ''
    
    if (field === 'urlSlug') {
      prompt = `Generate only a SEO-optimized URL slug for this blog post:

Title: ${post.title}
Content: ${post.content}
Content Type: ${post.contentAnalysis.contentType}
Target Audience: ${post.contentAnalysis.targetAudience}

Requirements:
- Create a clean, SEO-friendly URL slug (lowercase, hyphens, no special characters)
- Should be 3-8 words that capture the main topic
- Include primary keywords naturally
- Example format: "complete-guide-react-hooks"

Return only a JSON object:
{"urlSlug": "your-seo-slug-here"}`

    } else if (field === 'metaTitle') {
      prompt = `Generate only a SEO-optimized meta title for this blog post:

Title: ${post.title}
Content: ${post.content}
Content Type: ${post.contentAnalysis.contentType}
Target Audience: ${post.contentAnalysis.targetAudience}

Requirements:
- Write a compelling title optimized for search engines and click-through rates
- Include primary keywords early in the title
- Should be 50-60 characters (including spaces)
- Make it engaging and descriptive
- Consider the target audience: ${post.contentAnalysis.targetAudience}

Return only a JSON object:
{"metaTitle": "Your Compelling SEO Title Here"}`

    } else if (field === 'metaDescription') {
      prompt = `Generate only a SEO-optimized meta description for this blog post:

Title: ${post.title}
Content: ${post.content}
Content Type: ${post.contentAnalysis.contentType}
Target Audience: ${post.contentAnalysis.targetAudience}

Requirements:
- Write a persuasive description that summarizes the content value
- Include primary and secondary keywords naturally
- Should be 140-155 characters (including spaces)
- Include a subtle call-to-action or benefit statement
- Make it compelling for search result clicks

Return only a JSON object:
{"metaDescription": "Your persuasive meta description that includes keywords and value proposition for searchers."}`

    } else {
      // Generate all fields (original behavior)
      prompt = `Generate SEO-optimized metadata for this blog post. Analyze the content and create compelling, search-engine-friendly metadata.

Title: ${post.title}

Content: ${post.content}

Content Type: ${post.contentAnalysis.contentType}
Target Audience: ${post.contentAnalysis.targetAudience}

Requirements:

1. URL Slug: 
   - Create a clean, SEO-friendly URL slug (lowercase, hyphens, no special characters)
   - Should be 3-8 words that capture the main topic
   - Include primary keywords naturally
   - Example: "complete-guide-react-hooks"

2. Meta Title:
   - Write a compelling title optimized for search engines and click-through rates
   - Include primary keywords early in the title
   - Should be 50-60 characters (including spaces)
   - Make it engaging and descriptive
   - Consider the target audience: ${post.contentAnalysis.targetAudience}

3. Meta Description:
   - Write a persuasive description that summarizes the content value
   - Include primary and secondary keywords naturally
   - Should be 140-155 characters (including spaces)
   - Include a subtle call-to-action or benefit statement
   - Make it compelling for search result clicks

Return valid JSON only with this exact structure:
{
  "urlSlug": "your-seo-slug-here",
  "metaTitle": "Your Compelling SEO Title Here",
  "metaDescription": "Your persuasive meta description that includes keywords and value proposition for searchers."
}`
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert SEO specialist who creates highly optimized metadata for blog posts. You understand search intent, keyword optimization, and user psychology. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      temperature: 0.2,
      max_tokens: 400,
    })

    let aiMetadata: MetadataResponse = {
      urlSlug: '',
      metaTitle: '',
      metaDescription: ''
    }
    
    if (completion.choices[0].message.content) {
      try {
        const responseContent = completion.choices[0].message.content.trim()
        const parsedData = JSON.parse(responseContent)
        
        if (field) {
          // Individual field regeneration
          if (field === 'urlSlug' && parsedData.urlSlug) {
            return NextResponse.json({ 
              field: 'urlSlug',
              value: parsedData.urlSlug,
              generated: true 
            })
          } else if (field === 'metaTitle' && parsedData.metaTitle) {
            return NextResponse.json({ 
              field: 'metaTitle',
              value: parsedData.metaTitle,
              generated: true 
            })
          } else if (field === 'metaDescription' && parsedData.metaDescription) {
            return NextResponse.json({ 
              field: 'metaDescription',
              value: parsedData.metaDescription,
              generated: true 
            })
          } else {
            throw new Error('Invalid field response')
          }
        } else {
          // Complete metadata generation
          if (parsedData.urlSlug && parsedData.metaTitle && parsedData.metaDescription) {
            aiMetadata = {
              urlSlug: parsedData.urlSlug,
              metaTitle: parsedData.metaTitle,
              metaDescription: parsedData.metaDescription
            }
          } else {
            throw new Error('Invalid response structure')
          }
        }
        
      } catch (parseError) {
        console.error('Failed to parse AI metadata response:', parseError)
        
        if (field) {
          // Return error for individual field
          return NextResponse.json(
            { error: `Failed to generate ${field}` },
            { status: 500 }
          )
        } else {
          // Fallback to basic generation for complete metadata
          aiMetadata = {
            urlSlug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            metaTitle: post.title.length <= 60 ? post.title : post.title.substring(0, 57) + '...',
            metaDescription: post.content.replace(/#{1,6}\s/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\n+/g, ' ').substring(0, 145) + '...'
          }
        }
      }
    } else {
      if (field) {
        // Return error for individual field
        return NextResponse.json(
          { error: `Failed to generate ${field}` },
          { status: 500 }
        )
      } else {
        // Fallback if no response for complete metadata
        aiMetadata = {
          urlSlug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          metaTitle: post.title.length <= 60 ? post.title : post.title.substring(0, 57) + '...',
          metaDescription: post.content.replace(/#{1,6}\s/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\n+/g, ' ').substring(0, 145) + '...'
        }
      }
    }

    return NextResponse.json({ 
      metadata: aiMetadata,
      generated: true 
    })

  } catch (error) {
    console.error('Error generating metadata:', error)
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    )
  }
} 