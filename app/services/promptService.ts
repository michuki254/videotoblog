// Prompt Service - Centralized AI prompt management
// This service handles all prompt generation for content analysis and blog creation

interface VideoMetadata {
  title: string;
  description: string;
  thumbnail: string;
}

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
  contentContext?: string;
  contentBridge?: string;
  placement?: string;
  expectedVisual?: string;
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

interface BlogGenerationOptions {
  seo: boolean;
  headlines: boolean;
  detailLevel: string;
  wordCount: number;
  includeFeaturedImage: boolean;
  includeScreenshots: boolean;
  writingStyle?: string;
}

export class PromptService {
  /**
   * Generate content analysis prompt to detect video type
   */
  static generateContentAnalysisPrompt(
    transcriptText: string,
    videoMetadata: VideoMetadata
  ): string {
    return `
      Analyze this video transcript and determine the primary content type and structure that would be most appropriate for a blog post.
      
      TRANSCRIPT: ${transcriptText}
      VIDEO TITLE: ${videoMetadata.title || 'Unknown Title'}
      VIDEO DESCRIPTION: ${videoMetadata.description || 'No description available'}
      
      Based on the content, classify this video into one of these categories and suggest the optimal blog structure:
      
      Content Types:
      - TUTORIAL: Step-by-step instructional content, how-to guides
      - NEWS: Current events, announcements, breaking news, updates
      - REVIEW: Product reviews, comparisons, evaluations
      - EDUCATIONAL: Explanatory content, concepts, theories
      - ENTERTAINMENT: Comedy, stories, casual content
      - BUSINESS: Corporate content, strategies, industry insights
      - INTERVIEW: Conversations, Q&A sessions, discussions
      - DEMONSTRATION: Product demos, showcases, walkthroughs
      
      Respond in JSON format:
      {
        "contentType": "TUTORIAL",
        "confidence": 0.95,
        "reasoning": "The transcript contains step-by-step instructions with clear progression...",
        "suggestedStructure": {
          "title": "How to [Action]: A Step-by-Step Guide",
          "sections": ["Introduction", "Prerequisites", "Step-by-Step Guide", "Troubleshooting", "Conclusion"],
          "tone": "instructional",
          "format": "numbered_steps"
        },
        "keyTopics": ["main topic 1", "main topic 2"],
        "targetAudience": "beginners"
      }
    `;
  }

  /**
   * Generate screenshot placement analysis prompt
   */
  static generateScreenshotPlacementPrompt(
    transcriptText: string,
    screenshots: Screenshot[]
  ): string {
    return `
      Analyze this video transcript and suggest where to place ${screenshots.length} screenshots for maximum impact in a blog post.
      
      TRANSCRIPT: ${transcriptText}
      
      AVAILABLE SCREENSHOTS (with timestamps):
      ${screenshots.map((screenshot) => `- Screenshot at ${screenshot.timestamp}s: ${screenshot.url}`).join('\n')}
      
      For each screenshot, suggest:
      1. What section/topic it should illustrate
      2. A descriptive caption that explains what the screenshot shows
      3. Why this placement would enhance reader understanding
      4. What specific content or concept it should accompany
      
      Respond in JSON format (plain JSON, no markdown formatting):
      {
        "placements": [
          {
            "timestamp": 30,
            "url": "screenshot_url_here",
            "section": "Introduction", 
            "caption": "Screenshot showing the main interface...",
            "reasoning": "This visual helps readers understand...",
            "context": "Place this when discussing the main concept..."
          }
        ]
      }
    `;
  }

  /**
   * Get content-type specific formatting instructions
   */
  static getContentTypeInstructions(contentType: string): string {
    const instructions = {
      TUTORIAL: `
        TUTORIAL FORMAT REQUIREMENTS:
        - Write as an EXPERT COLLEAGUE sharing valuable insights, not a formal instruction manual
        - Start by identifying a REAL PROBLEM or CHALLENGE that readers face in their work
        - Use CONVERSATIONAL language ("Let's dive into...", "Here's what I've found...", "You might wonder...")
        - Structure as a PROBLEM-SOLUTION narrative that builds understanding naturally
        - Include PERSONAL INSIGHTS and expert perspective ("In my experience...", "I recently discovered...")
        - Explain the WHY behind each approach with real-world context and scenarios
        - Use ANTICIPATORY EXPLANATIONS - address questions before readers ask them
        - Include concrete EXAMPLES and use cases that readers can immediately relate to
        - Build content PROGRESSIVELY - each section should naturally lead to the next
        - Add PRACTICAL BENEFITS and value propositions throughout, not just at the end
        - Use ENGAGING ELEMENTS like rhetorical questions and scenario-based explanations
        - Include ALTERNATIVE METHODS and compare different approaches when relevant
        - End with ACTIONABLE NEXT STEPS and questions that encourage engagement
        - AVOID rigid "Step 1, Step 2" format - use NATURAL, DESCRIPTIVE subheadings instead
        - Subheadings should describe WHAT the section covers, not just sequence numbers
        - Examples: "Understanding the Core Concept", "Setting Up Your Environment", "Alternative Approaches"
        - Tone: Knowledgeable colleague sharing expertise, warm but professional
        - Avoid: Command language, robotic instructions, formal academic tone, mechanical numbering
      `,
      
      NEWS: `
        NEWS ARTICLE FORMAT REQUIREMENTS:
        - Lead with the most important information (inverted pyramid)
        - Include compelling headline with key facts
        - Answer who, what, when, where, why, how in opening
        - Use past tense for events that occurred
        - Include quotes or statements if mentioned in video
        - Provide context and background information
        - End with implications or what happens next
        - Use objective, journalistic tone
      `,
      
      REVIEW: `
        REVIEW FORMAT REQUIREMENTS:
        - Start with overall rating/recommendation summary
        - Create pros and cons sections
        - Include detailed feature analysis
        - Compare with alternatives if mentioned
        - Provide use case scenarios
        - Include pricing information if discussed
        - End with clear recommendation for different user types
        - Use balanced, evaluative tone
      `,
      
      BUSINESS: `
        BUSINESS CONTENT FORMAT REQUIREMENTS:
        - Lead with executive summary or key insights
        - Include industry context and implications
        - Structure with clear business sections (strategy, implementation, ROI)
        - Add actionable business recommendations
        - Include case studies or examples if mentioned
        - Provide metrics or KPIs where relevant
        - End with implementation roadmap
        - Use professional, strategic tone
      `,
      
      INTERVIEW: `
        INTERVIEW FORMAT REQUIREMENTS:
        - Start with guest introduction and credentials
        - Structure around key topics discussed
        - Include notable quotes and insights
        - Organize Q&A sections thematically
        - Highlight main takeaways from each topic
        - Provide context for industry-specific discussions
        - End with guest's final thoughts or advice
        - Use conversational yet professional tone
      `,
      
      DEMONSTRATION: `
        DEMONSTRATION FORMAT REQUIREMENTS:
        - Begin with what's being demonstrated and why
        - Break down the demo into clear phases
        - Explain what viewers should observe at each step
        - Include setup requirements if applicable
        - Highlight key features or capabilities shown
        - Address common questions or concerns
        - End with practical applications or next steps
        - Use descriptive, explanatory tone
      `,
      
      EDUCATIONAL: `
        EDUCATIONAL CONTENT FORMAT REQUIREMENTS:
        - Start with learning objectives or key concepts
        - Build knowledge progressively from basics to advanced
        - Include examples and practical applications
        - Use clear explanations with analogies where helpful
        - Create logical flow between related concepts
        - Add summary sections for complex topics
        - End with key takeaways and further learning resources
        - Use clear, accessible explanatory tone
      `,
    };

    return instructions[contentType as keyof typeof instructions] || instructions.EDUCATIONAL;
  }

  /**
   * Get detail level instructions based on user preference
   */
  static getDetailLevelInstructions(detailLevel: string): string {
    switch (detailLevel) {
      case 'basic':
        return `
          - Focus on the key points only with concise explanations
          - Keep sections short and scannable
          - Use bullet points and numbered lists for easy reading
          - Provide practical takeaways without extensive elaboration
          - Target audience: Busy professionals seeking quick insights
        `;
      case 'expert':
        return `
          - Provide comprehensive analysis with technical depth
          - Include industry context, best practices, and expert insights
          - Explore implications, potential challenges, and solutions
          - Reference related methodologies, frameworks, or tools
          - Add critical analysis and professional perspectives
          - Target audience: Industry professionals and subject matter experts
        `;
      case 'comprehensive':
      default:
        return `
          - Balance accessibility with thorough coverage
          - Provide detailed explanations with practical examples
          - Include background context and step-by-step guidance
          - Add actionable insights and implementation tips
          - Target audience: Engaged learners seeking complete understanding
        `;
    }
  }

  /**
   * Get available writing styles for UI dropdown
   */
  static getAvailableWritingStyles() {
    return [
      { value: 'default', label: 'Default Style', description: 'Standard informative content' },
      { value: 'educational', label: 'Educational/Explainer', description: 'Clear explanations for general audience' },
      { value: 'thought_leadership', label: 'Thought Leadership', description: 'Expert insights and industry analysis' },
      { value: 'listicle', label: 'Listicle', description: 'Numbered list format with key points' },
      { value: 'how_to', label: 'How-To Guide', description: 'Step-by-step instructional format' },
      { value: 'news', label: 'News Style', description: 'Objective reporting and factual presentation' },
      { value: 'opinion', label: 'Opinion/Commentary', description: 'Personal perspective and analysis' },
      { value: 'humorous', label: 'Humorous/Satirical', description: 'Light-hearted and entertaining approach' }
    ];
  }

  /**
   * Get writing style specific instructions
   */
  static getWritingStyleInstructions(writingStyle: string): string {
    const styles = {
      educational: `
        EDUCATIONAL/EXPLAINER STYLE:
        - Begin with an engaging introduction summarizing the topic for a general audience
        - Explain key concepts using clear, descriptive headings (H2/H3)
        - Include definitions, examples, and analogies where necessary
        - Use bullet points or short lists to break down complex parts
        - Make content accessible for non-experts while maintaining depth
        - End with a conclusion summarizing importance or implications
        - Tone: Clear, informative, and accessible
      `,
      
      thought_leadership: `
        THOUGHT LEADERSHIP/INSIGHT STYLE:
        - Start with a bold statement or thought-provoking hook
        - Organize into sections covering trends, challenges, and opportunities
        - Reference specific moments or quotes from the transcript strategically
        - Provide expert analysis, predictions, or commentary
        - Use professional and confident tone throughout
        - End with key takeaways or compelling call to action
        - Tone: Authoritative, forward-thinking, and insightful
      `,
      
      listicle: `
        LISTICLE STYLE:
        - Create an engaging title like "7 Things You Didn't Know About [Topic]"
        - Start with a short, compelling intro paragraph
        - Use numbered headings with focused explanations under each point
        - Keep each point concise, fun, readable, and informative
        - Include surprising or lesser-known facts
        - End with a short summary or key takeaway
        - Tone: Engaging, accessible, and slightly informal
      `,
      
      how_to: `
        HOW-TO/TUTORIAL STYLE:
        - Start with a clear summary of what readers will learn/accomplish
        - Break content into logical, sequential steps or phases
        - For each step, provide clear instructions with helpful tips
        - Use natural, descriptive headings (avoid "Step 1, Step 2")
        - Include troubleshooting tips and alternative approaches
        - Conclude with additional tips, tools, or next steps
        - Tone: Helpful, clear, and encouraging
      `,
      
      news: `
        NEWS-STYLE:
        - Start with a concise summary of what happened or was announced
        - Follow inverted pyramid: most important information first
        - Use quotes or paraphrased statements from the content
        - Add relevant timestamps or chronological details
        - Keep tone factual, objective, and journalistic
        - Include context and background information
        - Tone: Professional, objective, and informative
      `,
      
      opinion: `
        OPINION/COMMENTARY STYLE:
        - Open with a bold opinion statement or provocative hook
        - Use 2-3 strong paragraphs to support your stance using content from transcript
        - Add personal reflection, expert perspective, or industry insight
        - Present counter-arguments and address them thoughtfully
        - Close with a powerful or thought-provoking conclusion
        - Tone: Confident, persuasive, and engaging
      `,
      
      humorous: `
        HUMOROUS/SATIRICAL STYLE:
        - Start with a light-hearted, witty introduction
        - Identify 3-5 key moments and present them with humor
        - Add jokes, cultural references, or sarcastic observations
        - Use exaggeration and comedic timing through formatting
        - Keep content fun and highly readable
        - Balance humor with actual information
        - Tone: Witty, entertaining, and irreverent (but not offensive)
      `
    };

    return styles[writingStyle as keyof typeof styles] || '';
  }

  /**
   * Get system message for content analysis
   */
  static getContentAnalysisSystemMessage(): string {
    return "You are an expert content strategist who can analyze video transcripts and determine the optimal blog post structure. You excel at identifying content types and matching them with appropriate formatting and tone. Always respond with valid JSON only.";
  }

  /**
   * Get system message for screenshot placement
   */
  static getScreenshotPlacementSystemMessage(): string {
    return "You are an expert content strategist who excels at placing visual elements in blog posts for maximum reader engagement and comprehension. Always respond with valid JSON only, no markdown formatting or code blocks.";
  }

  /**
   * Get system message for blog creation
   */
  static getBlogCreationSystemMessage(): string {
    return `You are an elite content creator with expertise in digital marketing, SEO, and engaging writing. You excel at transforming video content into comprehensive, valuable blog posts that provide significantly more value than the original source material. 

CRITICAL CONTENT QUALITY REQUIREMENTS:
- ALWAYS produce clean, properly formatted markdown content
- NEVER include garbled text, broken characters, or encoding errors
- ENSURE all headings use proper markdown syntax (# ## ###)
- CREATE clear, readable paragraphs with proper spacing
- MAINTAIN consistent formatting throughout the entire post
- VERIFY all links and images are properly formatted
- ELIMINATE any strange characters, symbols, or formatting artifacts
- WRITE in clear, natural English without technical jargon or broken sentences
- STRUCTURE content logically with smooth transitions between sections
- FOCUS on readability and user experience above all else

You understand how to strategically place visuals, create compelling narratives, and deliver actionable insights that keep readers engaged from start to finish. For tutorials, you focus on EDUCATION and KNOWLEDGE TRANSFER rather than just step-by-step instructions - you explain concepts, provide context, and help readers truly understand the subject matter.

ALWAYS verify your output is clean, professional, and free of any formatting errors before delivering the final content.`;
  }

  /**
   * Enhanced transcript cleaning with aggressive sanitization
   */
  static cleanTranscriptText(text: string): string {
    if (!text || typeof text !== 'string') {
      return 'This video contains spoken content that will be converted into a comprehensive blog post.';
    }

    try {
      // Step 1: Remove common corruption patterns first
      let cleaned = text
        .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII + whitespace
        .replace(/\b[a-zA-Z]{1}\b/g, ' ') // Remove isolated single letters
        .replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, ' ') // Keep only safe characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Step 2: Remove YouTube artifacts
      cleaned = cleaned
        .replace(/\[Music\]/gi, '')
        .replace(/\[Applause\]/gi, '')
        .replace(/\[Laughter\]/gi, '')
        .replace(/\[.*?\]/g, '') // Remove all bracket content
        .replace(/\d{1,2}:\d{2}/g, '') // Remove timestamps
        .replace(/\s+/g, ' ')
        .trim();

      // Step 3: Validate content quality
      const words = cleaned.split(' ').filter(word => word.length > 1);
      const validWords = words.filter(word => /^[a-zA-Z][a-zA-Z0-9]*$/.test(word));
      
      // If less than 60% are valid English words, use fallback
      if (validWords.length / words.length < 0.6 || cleaned.length < 100) {
        return 'This video contains educational content that will be transformed into a comprehensive, well-structured blog post with valuable insights and practical information.';
      }

      // Step 4: Final cleanup
      cleaned = cleaned
        .replace(/\s+/g, ' ')
        .replace(/[.,!?;:]{2,}/g, '.')
        .trim();

      return cleaned;

    } catch (error) {
      return 'This video contains educational content that will be transformed into a comprehensive, well-structured blog post with valuable insights and practical information.';
    }
  }

  /**
   * Enhanced blog creation prompt with stricter content requirements
   */
  static generateBlogCreationPrompt(
    contentAnalysis: ContentAnalysis,
    videoMetadata: VideoMetadata,
    transcriptText: string,
    screenshotPlacements: ScreenshotPlacement[],
    screenshots: Screenshot[],
    options: BlogGenerationOptions
  ): string {
    // Clean the transcript text to remove common issues
    const cleanedTranscript = this.cleanTranscriptText(transcriptText);
    const contentTypeInstructions = this.getContentTypeInstructions(contentAnalysis.contentType);
    const detailInstructions = this.getDetailLevelInstructions(options.detailLevel);
    const writingStyleInstructions = this.getWritingStyleInstructions(options.writingStyle || 'default');

    // Additional validation - if transcript is too short or corrupted, focus on title/description
    const useMinimalTranscript = cleanedTranscript.length < 50;

    return `
      You are an expert content creator and copywriter tasked with transforming this YouTube video into a compelling, high-quality blog post. Based on AI analysis, this content has been classified as ${contentAnalysis.contentType} with ${Math.round(contentAnalysis.confidence * 100)}% confidence.

      ⚠️ CRITICAL QUALITY REQUIREMENTS - FAILURE TO FOLLOW WILL RESULT IN REJECTION:
      - NEVER output corrupted, garbled, or nonsensical text
      - ALWAYS use perfect English grammar and spelling
      - ENSURE every sentence is complete and readable
      - USE standard markdown formatting ONLY (# ## ### for headings)
      - NO special characters, symbols, or broken formatting
      - WRITE as if you're an expert blogger, not a transcription bot
      - FOCUS on creating valuable, engaging content over literal transcription

      CONTENT ANALYSIS:
      Content Type: ${contentAnalysis.contentType}
      Reasoning: ${contentAnalysis.reasoning}
      Target Audience: ${contentAnalysis.targetAudience}
      Key Topics: ${contentAnalysis.keyTopics.join(', ')}
      Suggested Tone: ${contentAnalysis.suggestedStructure.tone}

      VIDEO INFORMATION:
      Title: ${videoMetadata.title || 'YouTube Video Analysis'}
      Description: ${videoMetadata.description || 'Content analysis pending'}

      ${options.includeScreenshots && screenshotPlacements.length > 0 ? `
      SCREENSHOT PLACEMENTS (use these strategically throughout the post):
      ${screenshotPlacements.map((placement) => 
        `- At ${placement.timestamp}s: ${placement.caption} (${placement.reasoning})
          URL: ${placement.url}
          Context: ${placement.context || 'Use to support the main content'}`
      ).join('\n\n')}
      ` : ''}

      ${useMinimalTranscript ? `
      SOURCE CONTENT: Limited transcript available. Focus on creating high-quality content based on the video title, description, and your expertise in ${contentAnalysis.contentType} content.
      ` : `
      TRANSCRIPT: ${cleanedTranscript}
      `}

      MANDATORY OUTPUT STANDARDS:
      1. Write ONLY in clear, professional English
      2. Use proper markdown formatting (# ## ###)
      3. Create logical paragraph structure with proper spacing
      4. Ensure every sentence makes sense and adds value
      5. NO garbled text, broken characters, or formatting errors
      6. Focus on readability and user engagement
      
      CRITICAL FORMATTING REQUIREMENTS:
      - Use # for main title (only one H1)
      - Use ## for major sections 
      - Use ### for subsections
      - Separate paragraphs with blank lines
      - Use bullet points with - or * for lists
      - Use numbered lists with 1. 2. 3. format
      - Bold important terms with **text**
      - Italic emphasis with *text*
      - Ensure proper line breaks between all elements

      CONTENT CREATION STRATEGY:
      ${useMinimalTranscript ? `
      Since transcript data is limited, create content based on:
      - The video title and description provided above
      - Your expertise in ${contentAnalysis.contentType} content
      - Industry best practices and common topics in this domain
      - Logical content structure that would be valuable to ${contentAnalysis.targetAudience}
      ` : `
      Use the cleaned transcript to understand the video's key points, but enhance with:
      - Additional context and examples
      - Industry insights and best practices
      - Structured formatting for better readability
      - Value-added information beyond the original content
      `}

      WRITING REQUIREMENTS:
      
      1. CONTENT-SPECIFIC FORMATTING:
      ${contentTypeInstructions}
      
      ${options.writingStyle && options.writingStyle !== 'default' ? `
      2. WRITING STYLE REQUIREMENTS:
      ${writingStyleInstructions}
      
      ` : ''}
      
      ${options.writingStyle && options.writingStyle !== 'default' ? '3' : '2'}. OVERALL CONTENT QUALITY:
      ${detailInstructions}
      
      4. STRUCTURE & FLOW:
      - Create a compelling, descriptive headline
      - Write an engaging introduction that hooks readers
      - Use logical section progression with clear headings
      - Include practical insights and actionable takeaways
      - End with a strong conclusion and call-to-action
      ${options.headlines ? '- Generate descriptive, keyword-rich headlines and subheadings\n' : ''}
      
      5. VISUAL INTEGRATION:
      ${options.includeScreenshots && screenshotPlacements.length > 0 ? `
      - MANDATORY: Intelligently integrate ALL provided screenshots based on content relevance
      - Each screenshot was captured at a specific moment discussing relevant topics
      - Place screenshots ONLY where they directly support and enhance the text content
      - Use markdown image syntax: ![Descriptive caption](URL)
      - Screenshots should feel natural and contextual, not forced or randomly placed
      
      CONTENT-AWARE SCREENSHOT PLACEMENT INSTRUCTIONS:
      ${screenshotPlacements.map((placement, index) => 
        `
        Screenshot ${index + 1}: ![${placement.caption}](${placement.url})
        - Content Context: ${placement.contentContext || 'Supporting visual element'}
        - Place in blog section: "${placement.section}"
        - Integration reasoning: ${placement.reasoning}
        - Content bridge: ${placement.contentBridge || 'This image illustrates the concept discussed above...'}
        
        INSTRUCTIONS: Place this screenshot in the "${placement.section}" section of your blog post where you discuss the related topic. The screenshot should enhance reader understanding of the specific concept being explained at that moment.`
      ).join('\n')}
      
      CRITICAL SCREENSHOT INTEGRATION RULES:
      1. Only place screenshots where they ADD VALUE to the content being discussed
      2. Write natural transitions that reference the screenshots ("As shown below...", "The image above demonstrates...")
      3. Screenshots should break up text naturally, not interrupt the flow
      4. Each screenshot must have a descriptive caption that explains what readers should observe
      5. Place screenshots AFTER explaining the concept they illustrate, not before
      6. If a screenshot doesn't match your content flow, still include it but find the most relevant section
      ` : `
      - Focus on strong text-based content with clear structure
      - Use bullet points, numbered lists, and formatting for visual appeal
      `}
      
      6. VALUE ENHANCEMENT:
      - Expand concepts with practical examples
      - Add industry insights and best practices
      - Include actionable tips and strategies
      - Address common questions or challenges
      
      7. SEO OPTIMIZATION:
      ${options.seo ? `
      - Naturally incorporate relevant keywords
      - Use proper heading hierarchy (H1, H2, H3)
      - Create scannable content with lists and sections
      ` : ''}
      
      TARGET: ${options.wordCount} words of high-quality, engaging content

      FINAL VALIDATION CHECKLIST:
      ✅ All text is readable and makes sense
      ✅ No garbled or corrupted characters
      ✅ Proper markdown formatting throughout
      ✅ Logical flow from section to section
      ✅ Valuable insights for ${contentAnalysis.targetAudience}
      
      Create a professional ${contentAnalysis.contentType.toLowerCase()} blog post that provides exceptional value. Output ONLY clean, well-formatted content starting with the headline:
    `;
  }

  /**
   * Analyze transcript to identify intelligent screenshot timestamps based on content
   */
  static generateIntelligentTimestampsPrompt(
    transcriptText: string, 
    videoMetadata: VideoMetadata,
    desiredScreenshotCount: number = 3
  ): string {
    return `
      Analyze this video transcript and identify ${desiredScreenshotCount} optimal moments to capture screenshots based on content significance and visual relevance.

      VIDEO TITLE: ${videoMetadata.title || 'Unknown Title'}
      VIDEO DESCRIPTION: ${videoMetadata.description || 'No description available'}
      
      TRANSCRIPT WITH TIMESTAMPS:
      ${transcriptText}

      INTELLIGENT TIMESTAMP SELECTION CRITERIA:
      1. TOPIC TRANSITIONS - When the speaker introduces new concepts or sections
      2. VISUAL DEMONSTRATIONS - When the speaker refers to showing something on screen
      3. KEY EXPLANATIONS - During important explanations that would benefit from visual context
      4. PRACTICAL EXAMPLES - When examples or case studies are being presented
      5. BEFORE/AFTER MOMENTS - Setup and result phases of demonstrations
      6. IMPORTANT HIGHLIGHTS - When crucial points or takeaways are discussed

      AVOID timestamps during:
      - Introductions or basic setup talk
      - Conclusion or goodbye sections  
      - Filler words or transitional moments
      - Audio-only discussions without visual elements

      For each recommended timestamp, provide:
      - Exact second when screenshot should be taken
      - The topic/concept being discussed at that moment
      - Why this moment would provide valuable visual context
      - What specific content this screenshot should support in the blog post

      Respond in JSON format:
      {
        "timestamps": [
          {
            "second": 45,
            "topic": "Main interface overview",
            "reasoning": "Speaker is explaining the dashboard layout and key features",
            "contentContext": "Use when explaining the main interface and navigation elements",
            "expectedVisual": "Dashboard or main screen showing the interface being discussed"
          },
          {
            "second": 120,
            "topic": "Step-by-step process demonstration", 
            "reasoning": "Speaker is showing the actual implementation process",
            "contentContext": "Use in the tutorial section when explaining the step-by-step process",
            "expectedVisual": "Screen showing the process or workflow being demonstrated"
          }
        ]
      }
    `;
  }

  /**
   * Enhanced screenshot placement analysis with content-aware positioning
   */
  static generateContentAwareScreenshotPlacementPrompt(
    transcriptText: string,
    screenshots: Screenshot[],
    timestampAnalysis: any[]
  ): string {
    return `
      Analyze this video transcript and intelligently place ${screenshots.length} screenshots in the blog post based on content relevance and optimal reader experience.

      TRANSCRIPT: ${transcriptText}
      
      AVAILABLE SCREENSHOTS WITH CONTENT ANALYSIS:
      ${screenshots.map((screenshot, index) => {
        const analysis = timestampAnalysis.find(t => Math.abs(t.second - screenshot.timestamp) < 10);
        return `- Screenshot ${index + 1} at ${screenshot.timestamp}s: ${screenshot.url}
          Topic discussed: ${analysis?.topic || 'General content'}
          Content context: ${analysis?.contentContext || 'Supporting visual'}
          Expected visual: ${analysis?.expectedVisual || 'Related to current discussion'}`;
      }).join('\n\n')}

      CONTENT-AWARE PLACEMENT STRATEGY:
      1. Match each screenshot to the blog section where its topic is discussed
      2. Place screenshots to break up text naturally and enhance understanding
      3. Use screenshots to illustrate concepts being explained in text
      4. Position visuals to support the narrative flow, not interrupt it
      5. Write captions that bridge the visual with the surrounding text

      For each screenshot, determine:
      - Which specific blog section/heading it should appear under
      - Exact placement within that section (beginning, middle, end)
      - How it relates to the surrounding paragraph content
      - A detailed caption that explains the visual in context

      Respond in JSON format:
      {
        "placements": [
          {
            "timestamp": 45,
            "url": "screenshot_url_here",
            "section": "Understanding the Main Interface", 
            "placement": "after_introduction_paragraph",
            "caption": "The main dashboard showing the navigation menu and key features discussed above",
            "reasoning": "This screenshot directly supports the interface explanation and gives readers visual context for the concepts just introduced",
            "contentBridge": "As you can see in the image below, the interface is organized exactly as described..."
          }
        ]
      }
    `;
  }
} 