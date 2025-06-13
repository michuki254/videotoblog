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
  const [wordCount, setWordCount] = useState(2000);
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
    setWordCount(settings.wordCount || 2000);
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
        primaryKeyphrase,
        timestamps,
        seo: (document.getElementById('seo') as HTMLInputElement)?.checked,
        headlines: (document.getElementById('headlines') as HTMLInputElement)?.checked,
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
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-3">
          {icon && <div className="text-indigo-600">{icon}</div>}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                  Convert Video to Blog Post
                </h1>
              <p className="text-indigo-100">
                Transform your YouTube videos into SEO-optimized, engaging blog content with AI
              </p>
            </div>

            <div className="p-6">
              {/* Success Banner */}
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.481z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                    <h3 className="text-sm font-semibold text-green-800">🚀 AI-Powered Blog Generation</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Intelligent content detection, smart screenshot placement, comprehensive SEO optimization, and flexible writing styles to create engaging blog posts from any YouTube video.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Template Management Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800">📋 Template Manager</h3>
                    <p className="text-xs text-blue-600 mt-1">Save and reuse your conversion settings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplateManager(!showTemplateManager)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {showTemplateManager ? 'Hide' : 'Manage Templates'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Template Selector */}
                  <div>
                    <label htmlFor="templateSelector" className="block text-xs font-medium text-gray-700 mb-1">
                      Load Template
                    </label>
                    <select
                      id="templateSelector"
                      value={selectedTemplate}
                      onChange={(e) => {
                        if (e.target.value) {
                          loadTemplate(e.target.value);
                        }
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select a template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Save Template Button */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Save Current Settings
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSaveTemplate(true)}
                      className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      💾 Save as Template
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quick Actions
                    </label>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          // Reset to defaults
                          setPrimaryKeyphrase('');
                          setDetailLevel('comprehensive');
                          setWordCount(2000);
                          setIncludeScreenshots('auto');
                          setScreenshotCount(3);
                          setCustomTimestamps('30, 60, 90');
                          setIncludeFeaturedImage(true);
                          setTone('auto');
                          setPointOfView('auto');
                          setUseEmojis(false);
                          setFormat('auto');
                          setUseChaptersAsOutline(false);
                          setAddTableOfContents(true);
                          setAddFAQs(false);
                          setAddVideoAttribution(false);
                          setAddCTA(false);
                          setSelectedTemplate('');
                        }}
                        className="flex-1 px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        🔄 Reset
                      </button>
                      {selectedTemplate && (
                        <button
                          type="button"
                          onClick={() => deleteTemplate(selectedTemplate)}
                          className="px-2 py-2 text-xs font-medium text-red-600 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Template Manager */}
                {showTemplateManager && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Saved Templates</h4>
                    {templates.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No templates saved yet. Save your first template above!</p>
                    ) : (
                      <div className="space-y-2">
                        {templates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{template.name}</span>
                              <p className="text-xs text-gray-500">
                                Created {new Date(template.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => loadTemplate(template.id)}
                                className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              >
                                Load
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTemplate(template.id)}
                                className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Save Template Modal */}
              {showSaveTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Template</h3>
                    <div className="mb-4">
                      <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        id="templateName"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="e.g. Tutorial Videos, Product Reviews"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveTemplate(false);
                          setNewTemplateName('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveAsTemplate}
                        disabled={!newTemplateName.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                </div>
              )}
                
              {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                      YouTube URL *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="url"
                        id="url"
                        required
                        className="block w-full rounded-lg border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="primaryKeyphrase" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                      Primary SEO Keyphrase (Optional)
                    </label>
                    <div className="relative">
                          <input
                        type="text"
                        name="primaryKeyphrase"
                        id="primaryKeyphrase"
                        className="block w-full rounded-lg border-0 py-3 pl-4 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. React hooks, digital marketing, machine learning"
                        value={primaryKeyphrase}
                        onChange={(e) => setPrimaryKeyphrase(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      🎯 Enter your target keyphrase to optimize the blog content for search engines. The AI will strategically incorporate this throughout the content.
                    </p>
                        </div>

                  {/* Custom Instructions */}
                  <div>
                    <label htmlFor="customInstructions" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                      Custom Instructions (Optional)
                          </label>
                    <div className="relative">
                      <textarea
                        name="customInstructions"
                        id="customInstructions"
                        rows={4}
                        className="block w-full rounded-lg border-0 py-3 pl-4 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-vertical"
                        placeholder="e.g. Focus on beginner-friendly explanations, include practical examples, avoid technical jargon, emphasize actionable tips, etc."
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                      />
                      <div className="absolute top-3 right-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      📝 Provide specific instructions to guide the AI in generating your blog post. Be as detailed as you want about style, focus areas, target audience, or special requirements.
                    </p>
                    {customInstructions.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        {customInstructions.length} characters • The AI will incorporate these instructions into the blog generation
                      </p>
                    )}
                    </div>

                  {/* Quick Settings Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="detailLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        Detail Level
                      </label>
                      <select
                        id="detailLevel"
                        name="detailLevel"
                        value={detailLevel}
                        onChange={(e) => setDetailLevel(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="basic">Basic (shorter)</option>
                        <option value="comprehensive">Comprehensive</option>
                        <option value="expert">Expert (in-depth)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
                        Target Word Count
                      </label>
                      <select
                        id="wordCount"
                        name="wordCount"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value))}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="1000">~1000 words</option>
                        <option value="1500">~1500 words</option>
                        <option value="2000">~2000 words</option>
                        <option value="3000">~3000 words</option>
                        <option value="4000">~4000 words</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basic Options
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="seo"
                            name="seo"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label htmlFor="seo" className="ml-2 text-sm text-gray-700">SEO Optimization</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="headlines"
                            name="headlines"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label htmlFor="headlines" className="ml-2 text-sm text-gray-700">Auto Headlines</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-4">
                  {/* Writing Style Section */}
                  <CollapsibleSection
                    title="Writing Style"
                    description="Customize tone, format, and content structure"
                    isOpen={showWritingStyle}
                    onToggle={() => setShowWritingStyle(!showWritingStyle)}
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                    }
                  >
                    <div className="space-y-6">
                      {/* Style Options */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Style Preferences</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          {/* Tone */}
                          <div>
                            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                              Tone
                            </label>
                            <select
                              id="tone"
                              name="tone"
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="auto">🔥 Auto</option>
                              <option value="professional">Professional</option>
                              <option value="conversational">Conversational</option>
                              <option value="friendly">Friendly</option>
                              <option value="formal">Formal</option>
                              <option value="casual">Casual</option>
                              <option value="enthusiastic">Enthusiastic</option>
                            </select>
                          </div>

                          {/* Point of View */}
                          <div>
                            <label htmlFor="pointOfView" className="block text-sm font-medium text-gray-700 mb-2">
                              Point of View
                            </label>
                            <select
                              id="pointOfView"
                              name="pointOfView"
                              value={pointOfView}
                              onChange={(e) => setPointOfView(e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="auto">🔥 Auto</option>
                              <option value="first-person">First Person (I, we)</option>
                              <option value="second-person">Second Person (You)</option>
                              <option value="third-person">Third Person (They, it)</option>
                            </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          {/* Format */}
                          <div>
                            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                              Content Format
                            </label>
                            <select
                              id="format"
                              name="format"
                              value={format}
                              onChange={(e) => setFormat(e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="auto">🔥 Auto</option>
                              <option value="article">Article</option>
                              <option value="tutorial">Tutorial</option>
                              <option value="listicle">Listicle</option>
                              <option value="guide">Guide</option>
                              <option value="review">Review</option>
                              <option value="how-to">How-to</option>
                            </select>
                          </div>

                          {/* Use Emojis */}
                          <div className="flex items-center justify-between h-full pt-6">
                            <label htmlFor="useEmojis" className="text-sm font-medium text-gray-700">
                              Use Emojis
                            </label>
                            <button
                              type="button"
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                useEmojis ? 'bg-indigo-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setUseEmojis(!useEmojis)}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                                  useEmojis ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                              </div>

                      {/* Structure Options */}
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Content Structure</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'useChaptersAsOutline', label: 'Use Video Chapters', state: useChaptersAsOutline, setState: setUseChaptersAsOutline },
                            { id: 'addTableOfContents', label: 'Table of Contents', state: addTableOfContents, setState: setAddTableOfContents },
                            { id: 'addFAQs', label: 'Include FAQs', state: addFAQs, setState: setAddFAQs },
                            { id: 'addVideoAttribution', label: 'Video Attribution', state: addVideoAttribution, setState: setAddVideoAttribution },
                            { id: 'addCTA', label: 'Call-to-Action', state: addCTA, setState: setAddCTA }
                          ].map((option, index) => (
                            <div key={option.id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${index >= 4 ? 'sm:col-span-2' : ''}`}>
                              <label htmlFor={option.id} className="text-sm font-medium text-gray-700">
                                {option.label}
                              </label>
                              <button
                                type="button"
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                  option.state ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                                onClick={() => option.setState(!option.state)}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                                    option.state ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Screenshot Options */}
                  <CollapsibleSection
                    title="Screenshot & Media Options"
                    description="Configure visual content and images"
                    isOpen={showScreenshotOptions}
                    onToggle={() => setShowScreenshotOptions(!showScreenshotOptions)}
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  >
                    <div className="space-y-6">
                      {/* Screenshot Mode Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Screenshot Mode
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { value: 'none', label: 'No Screenshots', icon: '🚫', desc: 'Text-only content' },
                            { value: 'auto', label: 'Auto Screenshots', icon: '🤖', desc: 'AI-placed visuals' },
                            { value: 'custom', label: 'Custom Times', icon: '⚙️', desc: 'Specify timestamps' }
                          ].map((mode) => (
                            <div
                              key={mode.value}
                              className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 p-4 ${
                                includeScreenshots === mode.value 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                              onClick={() => setIncludeScreenshots(mode.value as 'none' | 'auto' | 'custom')}
                        >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{mode.icon}</div>
                                <h3 className="text-sm font-medium text-gray-900">{mode.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">{mode.desc}</p>
                            </div>
                              {includeScreenshots === mode.value && (
                            <div className="absolute top-2 right-2">
                                  <div className="flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                          ))}
                      </div>
                    </div>

                    {/* Screenshot Count - Only show when auto screenshots selected */}
                    {includeScreenshots === 'auto' && (
                        <div>
                          <label htmlFor="screenshotCount" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Screenshots
                        </label>
                        <select
                          id="screenshotCount"
                          name="screenshotCount"
                          value={screenshotCount}
                          onChange={(e) => setScreenshotCount(parseInt(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                              <option key={num} value={num}>{num} screenshot{num > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Screenshots will be automatically spaced throughout the video.
                        </p>
                      </div>
                    )}

                    {/* Custom Timestamps - Only show when custom screenshots selected */}
                    {includeScreenshots === 'custom' && (
                        <div>
                          <label htmlFor="customTimestamps" className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Screenshot Timestamps
                        </label>
                          <input
                            type="text"
                            name="customTimestamps"
                            id="customTimestamps"
                            value={customTimestamps}
                            onChange={(e) => setCustomTimestamps(e.target.value)}
                            placeholder="30, 60, 90, 120"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Enter timestamps in seconds, separated by commas (e.g., 30, 60, 90)
                          </p>
                        </div>
                      )}

                      {/* Featured Image Option */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <label htmlFor="featuredImage" className="text-sm font-medium text-gray-700">
                            Include Featured Image
                          </label>
                          <p className="text-xs text-gray-500">Add video thumbnail as the main featured image</p>
                        </div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                            includeFeaturedImage ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                          onClick={() => setIncludeFeaturedImage(!includeFeaturedImage)}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                              includeFeaturedImage ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CollapsibleSection>
                  </div>

                  {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isLoading || !url}
                    className={`w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl ${
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
                      <>
                        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Convert to Blog Post
                      </>
                      )}
                    </button>
                  </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
