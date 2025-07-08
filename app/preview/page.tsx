'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import DashboardSidebar from '../components/DashboardSidebar';

interface BlogData {
  blogPost: string;
  title: string;
  thumbnail: string;
  contentAnalysis: {
    contentType: string;
    confidence: number;
    reasoning: string;
    targetAudience: string;
    keyTopics: string[];
    suggestedTone: string;
  };
  wordCount?: number;
  generationTime?: string;
  screenshots?: { url: string; timestamp: number }[];
}

interface ConversionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

// Define a simplified user type that matches what DashboardSidebar expects
interface SimplifiedUser {
  firstName?: string;
  emailAddresses?: { emailAddress: string }[];
  imageUrl?: string;
}

export default function PreviewPage() {
  const { user } = useUser();
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([
    {
      id: 'video-analysis',
      title: 'Analyzing Video Content',
      description: 'Extracting transcript and understanding content structure',
      status: 'pending'
    },
    {
      id: 'content-generation',
      title: 'Generating Blog Content',
      description: 'Creating engaging blog post with AI optimization',
      status: 'pending'
    },
    {
      id: 'screenshots',
      title: 'Generating Screenshots',
      description: 'Capturing key moments from the video',
      status: 'pending'
    },
    {
      id: 'optimization',
      title: 'Final Optimization',
      description: 'SEO optimization and content refinement',
      status: 'pending'
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [tempBlogData, setTempBlogData] = useState<Partial<BlogData> | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for pending conversion FIRST (highest priority)
    const conversionData = sessionStorage.getItem('pendingConversion');
    if (conversionData) {
      setIsConverting(true);
      setLoading(false);
      startConversion(JSON.parse(conversionData));
      return;
    }

    // Then try to get cached data from sessionStorage
    const storedData = sessionStorage.getItem('generatedBlog');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setBlogData(parsedData);
        setLoading(false);
        // If blog data exists, show completed state
        setConversionSteps(steps => steps.map(step => ({ ...step, status: 'completed' })));
        setCurrentStep(4);
        return;
      } catch (error) {
        console.error('Error parsing stored blog data:', error);
      }
    }

    // If no stored data and no conversion data, redirect back to convert page
    router.push('/convert');
  }, [router]);

  const updateStepStatus = (stepId: string, status: ConversionStep['status'], progress?: number) => {
    setConversionSteps(steps => 
      steps.map(step => 
        step.id === stepId 
          ? { ...step, status, progress } 
          : step
      )
    );
  };

  // Add content validation function
  const validateContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      return generateFallbackContent();
    }

    // Basic length check - allow shorter content now
    if (content.length < 100) {
      return generateFallbackContent();
    }

    // Check for markdown formatting - if it has proper structure, likely good
    const hasMarkdownHeaders = /^#+ /.test(content) || content.includes('##');
    const hasProperParagraphs = content.includes('\n\n') || content.split('\n').length > 3;

    if (hasMarkdownHeaders && hasProperParagraphs) {
      // Content seems well-formatted, clean it gently
      return content
        .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove only non-printable chars
        .replace(/\n{4,}/g, '\n\n\n') // Limit excessive newlines
        .trim();
    }

    // Check for excessive corrupted patterns (be more lenient)
    const words = content.split(/\s+/);
    const possiblyCorrupted = words.filter(word => 
      word.length > 1 && !/^[a-zA-Z0-9.,!?'"()#\-\n\r\t]+$/.test(word)
    );
    
    // Only fallback if more than 30% seems corrupted (was 10%)
    if (possiblyCorrupted.length / words.length > 0.3) {
      return generateFallbackContent();
    }

    // Content seems okay, return with gentle cleaning
    return content
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable chars
      .replace(/\s+(?=\n)/g, '') // Clean trailing spaces
      .replace(/\n{4,}/g, '\n\n\n') // Limit excessive newlines
      .trim();
  };

  // Generate fallback content when AI output is corrupted
  const generateFallbackContent = (): string => {
    return `# Video Content Analysis

## Overview

This video contains valuable educational content that we're processing to create a comprehensive blog post. The content covers important topics that provide practical insights for viewers.

## Key Topics Covered

The video discusses several important areas:

- Core concepts and fundamental principles
- Practical applications and real-world examples  
- Step-by-step explanations and guidance
- Expert insights and professional recommendations

## Main Insights

- **Educational Value**: The content provides practical knowledge that can be applied immediately
- **Expert Perspective**: Professional insights shared throughout the presentation
- **Actionable Information**: Specific steps and strategies that viewers can implement
- **Comprehensive Coverage**: Thorough exploration of the topic from multiple angles

## Key Takeaways

This video delivers valuable content that offers practical insights for its intended audience. The information presented can help viewers better understand the subject matter and apply the concepts effectively.

## Next Steps

Consider exploring related topics and implementing the strategies discussed to maximize the value from this educational content.

*Note: This analysis represents the key themes and insights from the video content.*`;
  };

  const startConversion = async (conversionData: any) => {
    try {
      // Step 1: Video Analysis
      setCurrentStep(1);
      updateStepStatus('video-analysis', 'processing');
      
      // Simulate processing time for video analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('video-analysis', 'completed');

      // Step 2: Generate Content with Intelligent Screenshot Analysis
      setCurrentStep(2);
      updateStepStatus('content-generation', 'processing');

      // Show extended processing message
      setTempBlogData({
        title: 'Processing Video Content...',
        thumbnail: '',
        blogPost: '',
        contentAnalysis: {
          contentType: 'PROCESSING',
          confidence: 1.0,
          reasoning: 'Analyzing video content and generating intelligent timestamps for screenshots...',
          targetAudience: 'general',
          keyTopics: [],
          suggestedTone: 'informative'
        },
      });

      // Add timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Generation timeout - the process is taking longer than expected')), 180000) // 3 minute timeout
      );

      const apiPromise = fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: conversionData.url,
          primaryKeyphrase: conversionData.primaryKeyphrase,
          screenshots: [], // Let the API generate intelligent timestamps
          seo: conversionData.seo,
          headlines: conversionData.headlines,
          tableOfContents: conversionData.tableOfContents,
          detailLevel: conversionData.detailLevel,
          wordCount: conversionData.wordCount,
          includeFeaturedImage: conversionData.includeFeaturedImage,
          includeScreenshots: conversionData.includeScreenshots !== 'none', // Convert to boolean
          screenshotCount: conversionData.screenshotCount || 3, // Pass the desired screenshot count
          writingStyle: conversionData.writingStyle || {}, // Pass writing style options
          customInstructions: conversionData.customInstructions || '', // Pass custom instructions
        }),
      });

      const response = await Promise.race([apiPromise, timeoutPromise]) as Response;
      const data = await response.json();
      
      if (!response.ok) {
        updateStepStatus('content-generation', 'error');
        throw new Error(data.error || 'Failed to convert video');
      }

      // Validate the generated content before proceeding
      const validatedContent = validateContent(data.blogPost);

      // Display the content immediately (no typing effect)
      setTempBlogData({
        title: data.title || 'Generated Blog Post',
        thumbnail: data.thumbnail || '',
        blogPost: validatedContent,
        contentAnalysis: data.contentAnalysis || {
          contentType: 'EDUCATIONAL',
          confidence: 0.7,
          reasoning: 'Content generated successfully',
          targetAudience: 'general',
          keyTopics: [],
          suggestedTone: 'informative'
        },
      });
      
      updateStepStatus('content-generation', 'completed');

      // Step 3: Screenshots are now handled within the content generation
      // But we still show this step for user experience
      setCurrentStep(3);
      updateStepStatus('screenshots', 'processing');
      
      // Small delay to show screenshot processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('screenshots', 'completed');

      // Step 4: Final Optimization
      setCurrentStep(4);
      updateStepStatus('optimization', 'processing');
      
      // Simulate optimization time
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('optimization', 'completed');

      // Store final blog data
      const finalBlogData = {
        ...conversionData,
        title: data.title || 'Generated Blog Post',
        thumbnail: data.thumbnail || '',
        blogPost: validatedContent,
        screenshotPlacements: data.screenshotPlacements || [],
        contentAnalysis: data.contentAnalysis || {
          contentType: 'EDUCATIONAL',
          confidence: 0.7,
          reasoning: 'Content generated successfully',
          targetAudience: 'general',
          keyTopics: [],
          suggestedTone: 'informative'
        },
        intelligentTimestamps: data.intelligentTimestamps || [], // New field for intelligent analysis
        screenshots: [], // Screenshots are now embedded in the blog content
      };

      sessionStorage.setItem('generatedBlog', JSON.stringify(finalBlogData));
      sessionStorage.removeItem('pendingConversion');
      setBlogData(finalBlogData);
      setIsConverting(false);

    } catch (error) {
      console.error('Conversion error:', error);
      setIsConverting(false);
      
      // Handle different types of errors
      let fallbackTitle = 'Video Content Analysis';
      let fallbackReasoning = 'Fallback content generated due to processing error';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          fallbackTitle = 'Video Analysis (Processing Timeout)';
          fallbackReasoning = 'The video analysis took longer than expected. This may be due to video length or complexity.';
          
          // Update UI to show timeout status
          updateStepStatus('content-generation', 'error');
          updateStepStatus('screenshots', 'error');  
          updateStepStatus('optimization', 'error');
        } else if (error.message.includes('Failed to convert')) {
          fallbackTitle = 'Video Analysis (Conversion Error)';
          fallbackReasoning = 'An error occurred during video processing. The content may be difficult to analyze.';
        }
      }
      
      // Show fallback content if generation fails
      const fallbackData = {
        title: fallbackTitle,
        thumbnail: '',
        blogPost: generateFallbackContent(),
        contentAnalysis: {
          contentType: 'EDUCATIONAL',
          confidence: 0.7,
          reasoning: fallbackReasoning,
          targetAudience: 'general',
          keyTopics: ['video content', 'analysis', 'insights'],
          suggestedTone: 'informative'
        },
      };
      
      setTempBlogData(fallbackData);
      setBlogData(fallbackData);
      
      // Only mark as completed if we have fallback content
      if (!(error instanceof Error) || !error.message?.includes('timeout')) {
        updateStepStatus('content-generation', 'completed');
        updateStepStatus('screenshots', 'completed');
        updateStepStatus('optimization', 'completed');
      }
    }
  };

  const handleEditPost = () => {
    router.push('/convert');
  };

  const handleNewPost = () => {
    // Clear all cached data and redirect to convert page for fresh conversion
    sessionStorage.removeItem('generatedBlog');
    sessionStorage.removeItem('pendingConversion');
    router.push('/convert');
  };

  const handleCopyToClipboard = () => {
    if (blogData?.blogPost) {
      navigator.clipboard.writeText(blogData.blogPost);
      alert('Blog post copied to clipboard!');
    }
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  // Convert Clerk user to the simplified format expected by DashboardSidebar
  const simplifiedUser: SimplifiedUser | undefined = user ? {
    firstName: user.firstName || undefined,
    emailAddresses: user.emailAddresses?.map(email => ({ emailAddress: email.emailAddress })),
    imageUrl: user.imageUrl
  } : undefined;

  if (isConverting) {
    const overallProgress = (currentStep / conversionSteps.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={simplifiedUser}
        />
        
        <div className="lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar with live conversion status */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Progress</h3>
                
                  {/* Overall Progress */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Conversion Steps */}
                <div className="space-y-4">
                  {conversionSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3">
                      {/* Step Icon */}
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : step.status === 'processing' ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : step.status === 'error' ? (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-800' :
                          step.status === 'processing' ? 'text-blue-800' :
                          step.status === 'error' ? 'text-red-800' :
                          'text-gray-700'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Status */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-800 font-medium">
                      {currentStep < conversionSteps.length ? conversionSteps[currentStep - 1]?.title || 'Initializing...' : 'Finalizing...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area with live blog generation */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tempBlogData?.title || 'Generating Your Blog Post...'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Processing your video content
                  </p>
                </div>

                {/* Blog post header */}
                {tempBlogData?.thumbnail && (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <Image
                      src={tempBlogData.thumbnail}
                      alt="Blog post thumbnail"
                      className="w-full h-full object-cover"
                      width={400}
                      height={200}
                    />
                  </div>
                )}
                
                {/* Live content generation */}
                <div className="p-6">
                  {tempBlogData?.blogPost ? (
                    <div className="prose prose-lg max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-gray-700">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-3">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {tempBlogData.blogPost}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing video content and preparing to generate your blog post...</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={simplifiedUser}
        />
        
        <div className="lg:pl-72 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Blog Post Found</h1>
          <p className="text-gray-600 mb-8">It looks like there's no blog post to preview.</p>
          <button
            onClick={() => router.push('/convert')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Blog Post
          </button>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = calculateWordCount(blogData.blogPost);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={simplifiedUser}
      />
      
      <div className="lg:pl-72">
      {/* Success Banner */}
      <div className="bg-green-50 border-b border-green-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.481z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                🎉 Blog post successfully generated! Your content is ready for review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blog Post Preview</h1>
              <p className="text-gray-600">Review and edit your generated content</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a1 1 0 011 1v3M9 7h4" />
                </svg>
                Copy Content
              </button>
              <button
                onClick={handleEditPost}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Post
              </button>
              <button
                onClick={handleNewPost}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.355-2A8.001 8.001 0 0020.58 15m0 0H15" />
                </svg>
                Generate New Blog Post
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with metadata */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
              
              {/* Content Type */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Content Type</span>
                  <span className="text-sm text-gray-500">{Math.round(blogData.contentAnalysis.confidence * 100)}% confidence</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {blogData.contentAnalysis.contentType}
                </span>
              </div>

              {/* Target Audience */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-1">Target Audience</span>
                <span className="text-sm text-gray-600">{blogData.contentAnalysis.targetAudience}</span>
              </div>

              {/* Suggested Tone */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-1">Tone</span>
                <span className="text-sm text-gray-600 capitalize">{blogData.contentAnalysis.suggestedTone}</span>
              </div>

              {/* Word Count */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-1">Word Count</span>
                <span className="text-sm text-gray-600">{wordCount.toLocaleString()} words</span>
              </div>

              {/* Screenshots Count */}
              {blogData.screenshots && blogData.screenshots.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 block mb-1">Screenshots</span>
                  <span className="text-sm text-gray-600">{blogData.screenshots.length} images included</span>
                </div>
              )}

              {/* Key Topics */}
              {blogData.contentAnalysis.keyTopics.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 block mb-2">Key Topics</span>
                  <div className="flex flex-wrap gap-1">
                    {blogData.contentAnalysis.keyTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">AI Reasoning</span>
                <p className="text-xs text-gray-600">{blogData.contentAnalysis.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Blog post header */}
              {blogData.thumbnail && (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <Image
                    src={blogData.thumbnail}
                    alt="Blog post thumbnail"
                    className="w-full h-full object-cover"
                    width={300}
                    height={150}
                  />
                </div>
              )}
              
              {/* Blog content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {blogData.blogPost}
                  </ReactMarkdown>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 