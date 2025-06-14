import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '../../../../../lib/mongodb'
import BlogPost from '../../../../../models/BlogPost'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const { id } = await params
    
    const post = await BlogPost.findOne({
      _id: id,
      clerkId: userId
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Generate AI tags using OpenAI
    const prompt = `Analyze this blog post and generate 6-10 relevant, specific tags that capture the main topics, themes, and key concepts. The tags should be useful for categorization and discovery.

Title: ${post.title}

Content: ${post.content}

Requirements:
- Generate 6-10 concise, relevant tags
- Focus on specific topics, not generic words
- Use proper capitalization (e.g., "Machine Learning", "JavaScript", "Digital Marketing")
- Avoid overly broad terms like "content" or "information"
- Include both technical terms and broader themes if applicable
- Consider the target audience: ${post.contentAnalysis.targetAudience}

Return only a JSON array of strings, no additional text:
["Tag 1", "Tag 2", "Tag 3", ...]`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert content tagger who generates precise, relevant tags for blog posts. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      temperature: 0.3,
      max_tokens: 200,
    })

    let aiTags: string[] = []
    
    if (completion.choices[0].message.content) {
      try {
        const responseContent = completion.choices[0].message.content.trim()
        aiTags = JSON.parse(responseContent)
        
        // Validate that we got an array of strings
        if (!Array.isArray(aiTags) || !aiTags.every(tag => typeof tag === 'string')) {
          throw new Error('Invalid response format')
        }
        
        // Limit to 10 tags maximum
        aiTags = aiTags.slice(0, 10)
        
      } catch (parseError) {
        console.error('Failed to parse AI tags response:', parseError)
        // Fallback to content analysis if AI fails
        aiTags = post.contentAnalysis.keyTopics || ['Content', 'Video', 'Analysis']
      }
    } else {
      // Fallback if no response
      aiTags = post.contentAnalysis.keyTopics || ['Content', 'Video', 'Analysis']
    }

    return NextResponse.json({ 
      tags: aiTags,
      generated: true 
    })

  } catch (error) {
    console.error('Error generating tags:', error)
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    )
  }
} 