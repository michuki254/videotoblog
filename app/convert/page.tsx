'use client'

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/navigation';

interface Screenshot {
  url: string;
  timestamp: number;
}

export default function ConvertPage() {
  const [url, setUrl] = useState('');
  const [primaryKeyphrase, setPrimaryKeyphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailLevel, setDetailLevel] = useState('comprehensive');
  const [wordCount, setWordCount] = useState(700);
  const [includeScreenshots, setIncludeScreenshots] = useState<'none' | 'auto' | 'custom'>('auto');
  const [screenshotCount, setScreenshotCount] = useState(3);
  const [customTimestamps, setCustomTimestamps] = useState('30, 60, 90');
  const [includeFeaturedImage, setIncludeFeaturedImage] = useState(true);
  
  // Writing Style States
  const [tone, setTone] = useState('auto');
  const [pointOfView, setPointOfView] = useState('auto');
  const [useEmojis, setUseEmojis] = useState(false);
  const [format, setFormat] = useState('auto');
  const [useChaptersAsOutline, setUseChaptersAsOutline] = useState(false);
  const [addTableOfContents, setAddTableOfContents] = useState(true);
  const [addFAQs, setAddFAQs] = useState(false);
  const [addVideoAttribution, setAddVideoAttribution] = useState(false);
  const [addCTA, setAddCTA] = useState(false);

  // Custom instructions
  const [customInstructions, setCustomInstructions] = useState('');

  // Collapsible section states
  const [showWritingStyle, setShowWritingStyle] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showScreenshotOptions, setShowScreenshotOptions] = useState(false);
  
  // Template management states
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  
  const router = useRouter();

  // Load templates on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('conversionTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save current settings as a template
  const saveAsTemplate = () => {
    if (!newTemplateName.trim()) return;

    const currentSettings = {
      id: Date.now().toString(),
      name: newTemplateName,
      settings: {
        primaryKeyphrase,
        detailLevel,
        wordCount,
        includeScreenshots,
        screenshotCount,
        customTimestamps,
        includeFeaturedImage,
        tone,
        pointOfView,
        useEmojis,
        format,
        useChaptersAsOutline,
        addTableOfContents,
        addFAQs,
        addVideoAttribution,
        addCTA,
        customInstructions,
        seo: true, // Default values since we can't access checkbox state here
        headlines: true
      },
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, currentSettings];
    setTemplates(updatedTemplates);
    localStorage.setItem('conversionTemplates', JSON.stringify(updatedTemplates));
    setNewTemplateName('');
    setShowSaveTemplate(false);
  };

  // Load template settings
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const settings = template.settings;
    setPrimaryKeyphrase(settings.primaryKeyphrase || '');
    setDetailLevel(settings.detailLevel || 'comprehensive');
    setWordCount(settings.wordCount || 700);
    setIncludeScreenshots(settings.includeScreenshots || 'auto');
    setScreenshotCount(settings.screenshotCount || 3);
    setCustomTimestamps(settings.customTimestamps || '30, 60, 90');
    setIncludeFeaturedImage(settings.includeFeaturedImage !== undefined ? settings.includeFeaturedImage : true);
    setTone(settings.tone || 'auto');
    setPointOfView(settings.pointOfView || 'auto');
    setUseEmojis(settings.useEmojis || false);
    setFormat(settings.format || 'auto');
    setUseChaptersAsOutline(settings.useChaptersAsOutline || false);
    setAddTableOfContents(settings.addTableOfContents !== undefined ? settings.addTableOfContents : true);
    setAddFAQs(settings.addFAQs || false);
    setAddVideoAttribution(settings.addVideoAttribution || false);
    setAddCTA(settings.addCTA || false);
    setCustomInstructions(settings.customInstructions || '');

    // Update checkboxes
    const seoCheckbox = document.getElementById('seo') as HTMLInputElement;
    const headlinesCheckbox = document.getElementById('headlines') as HTMLInputElement;
    if (seoCheckbox) seoCheckbox.checked = settings.seo !== undefined ? settings.seo : true;
    if (headlinesCheckbox) headlinesCheckbox.checked = settings.headlines !== undefined ? settings.headlines : true;

    setSelectedTemplate(templateId);
  };

  // Delete template
  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('conversionTemplates', JSON.stringify(updatedTemplates));
    if (selectedTemplate === templateId) {
      setSelectedTemplate('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with URL:', url);
    
    if (!url) {
      console.log('No URL provided, returning');
      return;
    }
    
    // Prevent double submission
    if (isLoading) {
      console.log('Already loading, preventing double submission');
      return;
    }

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
        primaryKeyphrase,
        timestamps,
        seo: (document.getElementById('seo') as HTMLInputElement)?.checked ?? true,
        headlines: (document.getElementById('headlines') as HTMLInputElement)?.checked ?? true,
        tableOfContents: addTableOfContents,
        detailLevel,
        wordCount,
        includeFeaturedImage,
        includeScreenshots,
        screenshotCount: includeScreenshots === 'auto' ? screenshotCount : (includeScreenshots === 'custom' ? timestamps.length : 0),
        // Writing Style Options
        writingStyle: {
          tone,
          pointOfView,
          useEmojis,
          format,
          useChaptersAsOutline,
          addTableOfContents,
          addFAQs,
          addVideoAttribution,
          addCTA
        },
        customInstructions
      };

      console.log('Storing conversion data:', conversionData);
      sessionStorage.setItem('pendingConversion', JSON.stringify(conversionData));

      // Redirect to preview page immediately - it will handle the conversion with progress bar
      console.log('Redirecting to preview page...');
      
      // Force navigation using window.location for reliability
      window.location.href = '/preview';
    } catch (err: unknown) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIsLoading(false); // Only set to false on error
    }
  }

  const CollapsibleSection = ({ 
    title, 
    isOpen, 
    onToggle, 
    children, 
    icon,
    description 
  }: { 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    icon?: React.ReactNode;
    description?: string;
  }) => (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          {icon && <div className="text-indigo-600">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transform Videos into Engaging Blog Posts
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by advanced AI to create SEO-optimized, compelling content from any YouTube video
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
            
            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <h2 className="text-lg font-semibold">Quick Convert</h2>
                    <p className="text-sm text-indigo-100">Start with just a URL</p>
                  </div>
                </div>
                
                {/* Template Quick Actions */}
                <div className="flex items-center space-x-2">
                  {templates.length > 0 && (
                    <select
                      value={selectedTemplate}
                      onChange={(e) => {
                        if (e.target.value) {
                          loadTemplate(e.target.value);
                        }
                      }}
                      className="bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="" className="text-gray-800">Select Template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id} className="text-gray-800">
                          {template.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTemplateManager(!showTemplateManager)}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
                  >
                    Templates
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Primary Input Section */}
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-3">
                    YouTube Video URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      name="url"
                      id="url"
                      required
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-gray-900 bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="primaryKeyphrase" className="block text-sm font-semibold text-gray-900 mb-3">
                    SEO Focus Keyphrase
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="primaryKeyphrase"
                      id="primaryKeyphrase"
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-gray-900 bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., machine learning tutorial, react hooks guide"
                      value={primaryKeyphrase}
                      onChange={(e) => setPrimaryKeyphrase(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Optional: Target keyphrase for SEO optimization
                  </p>
                </div>
              </div>

              {/* Quick Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Content Depth
                  </label>
                  <select
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                    className="w-full rounded-lg border-gray-300 bg-white text-gray-900"
                  >
                    <option value="basic">Basic Overview</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="expert">Expert Analysis</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Target Length
                  </label>
                  <select
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="w-full rounded-lg border-gray-300 bg-white text-gray-900"
                  >
                    <option value="400">~400 words</option>
                    <option value="700">~700 words</option>
                    <option value="1000">~1,000 words</option>
                    <option value="1500">~1,500 words</option>
                    <option value="2000">~2,000 words</option>
                    <option value="3000">~3,000 words</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Quick Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        id="seo"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">SEO Optimization</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        id="headlines"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Smart Headlines</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Advanced Options Sections */}
              <div className="space-y-4">
                
                {/* Writing Style */}
                <CollapsibleSection
                  title="Writing Style & Tone"
                  description="Customize how your blog post reads"
                  isOpen={showWritingStyle}
                  onToggle={() => setShowWritingStyle(!showWritingStyle)}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Writing Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full rounded-lg border-gray-300 bg-white text-gray-900"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="professional">Professional</option>
                        <option value="conversational">Conversational</option>
                        <option value="friendly">Friendly</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Point of View
                      </label>
                      <select
                        value={pointOfView}
                        onChange={(e) => setPointOfView(e.target.value)}
                        className="w-full rounded-lg border-gray-300 bg-white text-gray-900"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="first-person">First Person</option>
                        <option value="second-person">Second Person</option>
                        <option value="third-person">Third Person</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Format
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full rounded-lg border-gray-300 bg-white text-gray-900"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="article">Article</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="guide">Guide</option>
                        <option value="review">Review</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">
                        Include Emojis
                      </label>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          useEmojis ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        onClick={() => setUseEmojis(!useEmojis)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useEmojis ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Content Structure Options */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Content Structure</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'addTableOfContents', label: 'Table of Contents', state: addTableOfContents, setState: setAddTableOfContents },
                        { id: 'useChaptersAsOutline', label: 'Use Video Chapters', state: useChaptersAsOutline, setState: setUseChaptersAsOutline },
                        { id: 'addFAQs', label: 'Include FAQs', state: addFAQs, setState: setAddFAQs },
                        { id: 'addVideoAttribution', label: 'Video Attribution', state: addVideoAttribution, setState: setAddVideoAttribution },
                        { id: 'addCTA', label: 'Call-to-Action', state: addCTA, setState: setAddCTA }
                      ].map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-700">
                            {option.label}
                          </label>
                          <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              option.state ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                            onClick={() => option.setState(!option.state)}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                option.state ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Screenshot Options */}
                <CollapsibleSection
                  title="Visual Content"
                  description="Configure screenshots and images"
                  isOpen={showScreenshotOptions}
                  onToggle={() => setShowScreenshotOptions(!showScreenshotOptions)}
                  icon={
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Screenshot Generation
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { value: 'none', label: 'No Screenshots', icon: '❌', desc: 'Text only' },
                          { value: 'auto', label: 'Auto Generate', icon: '🤖', desc: 'AI-placed' },
                          { value: 'custom', label: 'Custom Times', icon: '⚙️', desc: 'Set timestamps' }
                        ].map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              includeScreenshots === mode.value 
                                ? 'border-indigo-600 bg-indigo-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => setIncludeScreenshots(mode.value as 'none' | 'auto' | 'custom')}
                          >
                            <div className="text-2xl mb-2">{mode.icon}</div>
                            <h4 className="text-sm font-medium text-gray-900">{mode.label}</h4>
                            <p className="text-xs text-gray-500 mt-1">{mode.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {includeScreenshots === 'auto' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Screenshots
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={screenshotCount}
                          onChange={(e) => setScreenshotCount(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1</span>
                          <span className="font-medium text-indigo-600">{screenshotCount} screenshots</span>
                          <span>10</span>
                        </div>
                      </div>
                    )}

                    {includeScreenshots === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timestamp List (seconds)
                        </label>
                        <input
                          type="text"
                          value={customTimestamps}
                          onChange={(e) => setCustomTimestamps(e.target.value)}
                          placeholder="30, 60, 90, 120"
                          className="w-full rounded-lg border-gray-300 bg-white"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Featured Image
                        </label>
                        <p className="text-xs text-gray-500">Use video thumbnail as hero image</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          includeFeaturedImage ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        onClick={() => setIncludeFeaturedImage(!includeFeaturedImage)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            includeFeaturedImage ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Custom Instructions */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Custom Instructions
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Add any specific instructions for the AI... (e.g., focus on beginners, include code examples, avoid jargon)"
                  />
                  {customInstructions && (
                    <p className="mt-2 text-xs text-gray-500">
                      {customInstructions.length} characters
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !url}
                  onClick={() => console.log('Button clicked, URL:', url, 'isLoading:', isLoading)}
                  className={`w-full py-4 px-6 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    (isLoading || !url) && 'opacity-50 cursor-not-allowed hover:scale-100'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Blog Post
                    </span>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Template Manager Modal */}
          {showTemplateManager && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Template Manager</h3>
                    <button
                      onClick={() => setShowTemplateManager(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <button
                    onClick={() => setShowSaveTemplate(true)}
                    className="mb-6 w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Current Settings as Template
                  </button>

                  {templates.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No templates saved yet. Save your first template to get started!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-500">
                              Created {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                loadTemplate(template.id);
                                setShowTemplateManager(false);
                              }}
                              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                            >
                              Use
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Template Modal */}
          {showSaveTemplate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Template</h3>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Template name..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        setShowSaveTemplate(false);
                        setNewTemplateName('');
                      }}
                      className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveAsTemplate}
                      disabled={!newTemplateName.trim()}
                      className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </DashboardLayout>
  )
}