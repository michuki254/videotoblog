'use client'

import { useState } from 'react';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';

interface Screenshot {
  url: string;
  timestamp: number;
}

export default function ConvertPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailLevel, setDetailLevel] = useState('comprehensive');
  const [wordCount, setWordCount] = useState(2000);
  const [includeScreenshots, setIncludeScreenshots] = useState<'none' | 'auto' | 'custom'>('auto');
  const [screenshotCount, setScreenshotCount] = useState(3);
  const [customTimestamps, setCustomTimestamps] = useState('30, 60, 90');
  const [includeFeaturedImage, setIncludeFeaturedImage] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError('');

    try {
      // Clear any existing cached blog data to ensure fresh conversion
      sessionStorage.removeItem('generatedBlog');
      sessionStorage.removeItem('pendingConversion');
      
      // Parse custom timestamps if enabled, otherwise generate based on screenshot count
      let timestamps = [30, 60, 90]; // Default timestamps
      const shouldGenerateScreenshots = includeScreenshots !== 'none';
      
      if (shouldGenerateScreenshots) {
        if (includeScreenshots === 'custom' && customTimestamps.trim()) {
          try {
            timestamps = customTimestamps.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
            if (timestamps.length === 0) {
              timestamps = [30, 60, 90]; // Fallback to defaults if parsing failed
            }
          } catch (err) {
            console.error('Failed to parse custom timestamps:', err);
          }
        } else if (includeScreenshots === 'auto') {
          // Generate timestamps based on screenshot count
          // Use a more intelligent distribution for better coverage
          timestamps = Array.from({ length: screenshotCount }, (_, i) => {
            const position = (i + 1) / (screenshotCount + 1); // Evenly distribute
            return Math.max(30, Math.floor(position * 600) + (i * 20)); // Start at 30s minimum, add some variation
          });
        }
      }

      // Store conversion parameters in sessionStorage for the preview page to process
      const conversionData = {
        url,
        timestamps,
        seo: (document.getElementById('seo') as HTMLInputElement)?.checked,
        headlines: (document.getElementById('headlines') as HTMLInputElement)?.checked,
        tableOfContents: (document.getElementById('tableOfContents') as HTMLInputElement)?.checked,
        detailLevel,
        wordCount,
        includeFeaturedImage,
        includeScreenshots,
        screenshotCount: includeScreenshots === 'auto' ? screenshotCount : (includeScreenshots === 'custom' ? timestamps.length : 0),
      };

      sessionStorage.setItem('pendingConversion', JSON.stringify(conversionData));

      // Redirect to preview page immediately - it will handle the conversion with progress bar
      router.push('/preview');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="default" />
      <div className="py-8 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-3xl font-semibold text-gray-900 mb-8">
                  Convert Video to Blog Post
                </h1>

                {/* Improvements Banner */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.481z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">🚀 Enhanced Blog Generation</h3>
                      <div className="mt-1 text-sm text-green-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>🤖 Intelligent Content Detection:</strong> AI automatically detects content type (Tutorial, News, Review, etc.) and adapts structure</li>
                          <li><strong>📋 Smart Table of Contents:</strong> Automatically generates navigable section links for better readability</li>
                          <li><strong>AI-Powered Screenshot Placement:</strong> Screenshots are strategically positioned for maximum impact</li>
                          <li><strong>Enhanced Content Quality:</strong> Improved prompts generate more engaging and valuable content</li>
                          <li><strong>Flexible Screenshot Count:</strong> Choose exactly how many screenshots to include</li>
                          <li><strong>Smart Distribution:</strong> Screenshots are intelligently spaced throughout the video</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Conversion Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium leading-6 text-gray-900">
                      YouTube URL
                    </label>
                    <div className="mt-2">
                      <input
                        type="url"
                        name="url"
                        id="url"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Conversion Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Conversion Options</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="seo"
                            name="seo"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="seo" className="font-medium text-gray-900">
                            SEO Optimization
                          </label>
                          <p className="text-gray-500">Optimize content for search engines</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="headlines"
                            name="headlines"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="headlines" className="font-medium text-gray-900">
                            Auto Headlines
                          </label>
                          <p className="text-gray-500">Generate section headlines</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="tableOfContents"
                            name="tableOfContents"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="tableOfContents" className="font-medium text-gray-900">
                            Table of Contents
                          </label>
                          <p className="text-gray-500">Generate navigation links for sections</p>
                        </div>
                      </div>
                    </div>

                    {/* Detail Level */}
                    <div className="mt-4">
                      <label htmlFor="detailLevel" className="block text-sm font-medium text-gray-700">
                        Detail Level
                      </label>
                      <select
                        id="detailLevel"
                        name="detailLevel"
                        value={detailLevel}
                        onChange={(e) => setDetailLevel(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="basic">Basic (shorter, key points only)</option>
                        <option value="comprehensive">Comprehensive (detailed with examples)</option>
                        <option value="expert">Expert (in-depth analysis and insights)</option>
                      </select>
                    </div>

                    {/* Word Count */}
                    <div className="mt-4">
                      <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700">
                        Target Word Count
                      </label>
                      <select
                        id="wordCount"
                        name="wordCount"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="1000">~1000 words</option>
                        <option value="1500">~1500 words</option>
                        <option value="2000">~2000 words</option>
                        <option value="3000">~3000 words</option>
                        <option value="4000">~4000 words (comprehensive)</option>
                      </select>
                    </div>

                    {/* Screenshot Inclusion Options */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Screenshot Options
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {/* No Screenshots Option */}
                        <div 
                          className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            includeScreenshots === 'none' 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => setIncludeScreenshots('none')}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-100">
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 text-center">No Screenshots</h3>
                            <p className="text-xs text-gray-500 text-center mt-1">Text-only blog post</p>
                          </div>
                          {includeScreenshots === 'none' && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Auto Screenshots Option */}
                        <div 
                          className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            includeScreenshots === 'auto' 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => setIncludeScreenshots('auto')}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-100">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 text-center">Auto Screenshots</h3>
                            <p className="text-xs text-gray-500 text-center mt-1">AI-placed visuals</p>
                          </div>
                          {includeScreenshots === 'auto' && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Screenshots Option */}
                        <div 
                          className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            includeScreenshots === 'custom' 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => setIncludeScreenshots('custom')}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-100">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 text-center">Custom Times</h3>
                            <p className="text-xs text-gray-500 text-center mt-1">Specify timestamps</p>
                          </div>
                          {includeScreenshots === 'custom' && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Featured Image Option */}
                    <div className="mt-4">
                      <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            id="featuredImage"
                            name="featuredImage"
                            type="checkbox"
                            checked={includeFeaturedImage}
                            onChange={(e) => setIncludeFeaturedImage(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor="featuredImage" className="font-medium text-gray-900">
                            Include Featured Image
                          </label>
                          <p className="text-gray-500">Add video thumbnail as the main featured image</p>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Count - Only show when auto screenshots selected */}
                    {includeScreenshots === 'auto' && (
                      <div className="mt-4">
                        <label htmlFor="screenshotCount" className="block text-sm font-medium text-gray-700">
                          Number of Screenshots
                        </label>
                        <select
                          id="screenshotCount"
                          name="screenshotCount"
                          value={screenshotCount}
                          onChange={(e) => setScreenshotCount(parseInt(e.target.value))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="1">1 screenshot</option>
                          <option value="2">2 screenshots</option>
                          <option value="3">3 screenshots</option>
                          <option value="4">4 screenshots</option>
                          <option value="5">5 screenshots</option>
                          <option value="6">6 screenshots</option>
                          <option value="8">8 screenshots</option>
                          <option value="10">10 screenshots</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Screenshots will be automatically spaced throughout the video.
                        </p>
                      </div>
                    )}

                    {/* Custom Timestamps - Only show when custom screenshots selected */}
                    {includeScreenshots === 'custom' && (
                      <div className="mt-4">
                        <label htmlFor="customTimestamps" className="block text-sm font-medium text-gray-700">
                          Custom Screenshot Timestamps
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="customTimestamps"
                            id="customTimestamps"
                            value={customTimestamps}
                            onChange={(e) => setCustomTimestamps(e.target.value)}
                            placeholder="30, 60, 90, 120"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Enter timestamps in seconds, separated by commas (e.g., 30, 60, 90)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !url}
                      className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        (isLoading || !url) && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Converting...
                        </>
                      ) : (
                        'Convert to Blog Post'
                      )}
                    </button>
                  </div>
                </form>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
