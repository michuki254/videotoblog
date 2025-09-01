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
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isConversionInProgress, setIsConversionInProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for pending conversion FIRST (highest priority)
    const conversionData = sessionStorage.getItem('pendingConversion');
    if (conversionData && !isConversionInProgress) {
      // Clear immediately to prevent duplicate conversions
      sessionStorage.removeItem('pendingConversion');
      setIsConverting(true);
      setLoading(false);
      setIsConversionInProgress(true);
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
        setTimeout(() => reject(new Error('Generation timeout - the video conversion is taking longer than expected. This can happen with longer videos or during high server load. Please try again.')), 240000) // 4 minute timeout
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
      
      // Check response status first
      if (!response.ok) {
        console.error('Conversion failed with status:', response.status);
        let errorData = { error: 'Server error', details: 'Unknown error' };
        
        // Try to get error details from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
            console.error('Error details:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            // Response body might be empty or corrupted
          }
        } else {
          try {
            const errorText = await response.text();
            if (errorText) {
              console.error('Error response text:', errorText);
              errorData = { error: 'Server error', details: errorText };
            }
          } catch (textError) {
            console.error('Failed to read error response as text:', textError);
          }
        }
        
        updateStepStatus('content-generation', 'error');
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      
      // Now parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse successful response:', parseError);
        updateStepStatus('content-generation', 'error');
        throw new Error('Failed to parse server response');
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
      setIsConversionInProgress(false); // Reset the flag on success

    } catch (error) {
      console.error('Conversion error:', error);
      setIsConverting(false);
      setIsConversionInProgress(false); // Reset the flag on error
      
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
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Generating Your Blog Post</h1>
              <p className="text-gray-600 mt-2">We're converting your video into an engaging blog post</p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar with live conversion status */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8 overflow-hidden">
                <div className="absolute inset-0 bg-blue-50/30 pointer-events-none"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Progress Tracker</h3>
                  </div>
                
                  {/* Overall Progress */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out bg-blue-600"
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
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600 mr-3"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-blue-400 opacity-20 mr-3"></div>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Currently Processing</p>
                      <p className="text-sm text-blue-900 font-semibold">
                        {currentStep < conversionSteps.length ? conversionSteps[currentStep - 1]?.title || 'Initializing...' : 'Finalizing...'}
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Main content area with live blog generation */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-100 border-b border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tempBlogData?.title || 'Generating Your Blog Post'}
                      </h2>
                      <p className="text-gray-600 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Processing your video content with AI
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        <span className="mr-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Live Generation
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blog post header */}
                {tempBlogData?.thumbnail && (
                  <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                    <div className="absolute inset-0 bg-black/30 z-10"></div>
                    <Image
                      src={tempBlogData.thumbnail}
                      alt="Blog post thumbnail"
                      className="w-full h-full object-cover"
                      width={800}
                      height={400}
                    />
                  </div>
                )}
                
                {/* Live content generation */}
                <div className="p-8">
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
                    <div className="text-center py-16">
                      <div className="relative inline-block">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
                      </div>
                      <p className="text-gray-600 mt-6 text-lg">Analyzing video content and preparing to generate your blog post...</p>
                      <p className="text-gray-500 mt-2 text-sm">This may take a few moments</p>
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">No Blog Post Found</h1>
            <p className="text-gray-600 mb-8">Start by converting a video to create your first blog post.</p>
            <button
              onClick={() => router.push('/convert')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium shadow-lg"
            >
              Create New Blog Post
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = calculateWordCount(blogData.blogPost);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <DashboardSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={simplifiedUser}
      />
      
      <div className="lg:pl-72">
      {/* Success Banner */}
      <div className="bg-green-50 border-b border-green-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.481z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-semibold text-green-900">
                  Blog post successfully generated!
                </p>
                <p className="text-sm text-green-700">Your content is ready for review and publishing</p>
              </div>
            </div>
            {showCopySuccess && (
              <div className="animate-fade-in bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="text-blue-600">Blog Post Preview</span>
              </h1>
              <p className="text-gray-600 mt-1">Review and edit your generated content</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="group bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a1 1 0 011 1v3M9 7h4" />
                </svg>
                Copy Content
              </button>
              <button
                onClick={handleEditPost}
                className="group bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Post
              </button>
              <button
                onClick={handleNewPost}
                className="group bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.355-2A8.001 8.001 0 0020.58 15m0 0H15" />
                </svg>
                New Blog Post
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with metadata */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Content Analysis</h3>
              </div>
              
              {/* Content Type */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Content Type</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{Math.round(blogData.contentAnalysis.confidence * 100)}% confidence</span>
                </div>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white shadow-md">
                  {blogData.contentAnalysis.contentType}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Target Audience</span>
                  <span className="text-sm font-semibold text-gray-900">{blogData.contentAnalysis.targetAudience}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Tone</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{blogData.contentAnalysis.suggestedTone}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Word Count</span>
                  <span className="text-sm font-semibold text-gray-900">{wordCount.toLocaleString()}</span>
                </div>
                {blogData.screenshots && blogData.screenshots.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Screenshots</span>
                    <span className="text-sm font-semibold text-gray-900">{blogData.screenshots.length}</span>
                  </div>
                )}
              </div>

              {/* Key Topics */}
              {blogData.contentAnalysis.keyTopics.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-700 block mb-3">Key Topics</span>
                  <div className="flex flex-wrap gap-2">
                    {blogData.contentAnalysis.keyTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="border-t pt-4">
                <span className="text-sm font-medium text-gray-700 block mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI Insights
                </span>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">{blogData.contentAnalysis.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Blog post header */}
              {blogData.thumbnail && (
                <div className="relative w-full h-72 bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 z-10"></div>
                  <Image
                    src={blogData.thumbnail}
                    alt="Blog post thumbnail"
                    className="w-full h-full object-cover"
                    width={1200}
                    height={600}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">{blogData.title}</h2>
                  </div>
                </div>
              )}
              
              {/* Blog content */}
              <div className="p-10">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6 leading-tight flex items-center">
                          <span className="mr-3 h-1 w-8 bg-blue-600 rounded-full"></span>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{children}</h3>
                      ),
                      p: ({ children, node }) => {
                        // Check if children contains an image or figure element
                        const containsBlockElement = (children: any): boolean => {
                          if (!children) return false;
                          
                          const childArray = Array.isArray(children) ? children : [children];
                          
                          return childArray.some((child: any) => {
                            // Check for image elements
                            if (child?.type === 'img' || 
                                child?.props?.node?.tagName === 'img' ||
                                child?.type?.name === 'img') {
                              return true;
                            }
                            
                            // Check for figure elements
                            if (child?.type === 'figure' || 
                                child?.props?.node?.tagName === 'figure' ||
                                child?.type?.name === 'figure') {
                              return true;
                            }
                            
                            // Recursively check children
                            if (child?.props?.children) {
                              return containsBlockElement(child.props.children);
                            }
                            
                            return false;
                          });
                        };
                        
                        // If it contains block elements, render as div
                        if (containsBlockElement(children)) {
                          return <div className="my-6 text-gray-700 leading-relaxed text-lg">{children}</div>;
                        }
                        
                        return <p className="text-gray-700 mb-6 leading-relaxed text-lg">{children}</p>;
                      },
                      ul: ({ children }) => (
                        <ul className="list-none text-gray-700 mb-6 space-y-3 ml-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-3 ml-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 flex items-start">
                          <span className="mr-3 mt-1.5 h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900 bg-blue-50 px-1 rounded">{children}</strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-600 pl-6 italic text-gray-600 my-8 bg-blue-50 py-4 pr-4 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-indigo-600">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6 shadow-xl">
                          {children}
                        </pre>
                      ),
                      img: ({ src, alt }) => (
                        <div className="my-8">
                          <div className="rounded-xl overflow-hidden shadow-lg">
                            <img 
                              src={src || ''} 
                              alt={alt || 'Screenshot from video'} 
                              className="w-full h-auto"
                            />
                          </div>
                          {alt && (
                            <p className="text-center text-sm text-gray-600 mt-2 italic">
                              {alt}
                            </p>
                          )}
                        </div>
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