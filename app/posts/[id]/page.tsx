'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import DashboardSidebar from '../../components/DashboardSidebar'
import JSZip from 'jszip'

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  videoUrl: string;
  videoId: string;
  thumbnail?: string;
  wordCount: number;
  contentType: string;
  status: 'draft' | 'published';
  seoOptimized: boolean;
  hasScreenshots: boolean;
  screenshotCount: number;
  hasTableOfContents: boolean;
  detailLevel: string;
  contentAnalysis: {
    contentType: string;
    targetAudience: string;
    keyTopics: string[];
  };
  createdAt: string;
  updatedAt: string;
  wordpress?: {
    url: string;
  };
}

// Image Gallery Component
const ImageModal = ({ src, alt, isOpen, onClose }: { src: string; alt: string; isOpen: boolean; onClose: () => void }) => {
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      setDownloading(true);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.textContent = 'Image downloaded successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.textContent = 'Download failed. Please try again.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } finally {
      setDownloading(false);
    }
  };

  const generateImageName = (url: string, alt: string) => {
    // Try to get filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (filename && filename.includes('.')) {
      return filename;
    }
    
    // Generate name from alt text or use default
    const safeName = (alt || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${safeName}.jpg`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-5xl max-h-full p-4">
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(src, generateImageName(src, alt));
            }}
            disabled={downloading}
            className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download image"
          >
            {downloading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {alt && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded">
            {alt}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Image Component
const EnhancedImage = ({ src, alt, ...props }: { src?: string; alt?: string }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      setDownloading(true);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.textContent = 'Image downloaded successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.textContent = 'Download failed. Please try again.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    } finally {
      setDownloading(false);
    }
  };

  const generateImageName = (url: string, alt: string) => {
    // Try to get filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (filename && filename.includes('.')) {
      return filename;
    }
    
    // Generate name from alt text or use default
    const safeName = (alt || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${safeName}.jpg`;
  };

  if (!src || imageError) {
    return (
      <div className="my-6 p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">
          {imageError ? 'Failed to load image' : 'Image not available'}
        </p>
        {alt && <p className="text-gray-400 text-xs mt-1">{alt}</p>}
      </div>
    );
  }

  return (
    <>
      <span className="block my-8 group">
        <span className="block relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
          {!imageLoaded && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 block"></span>
            </span>
          )}
          <img
            src={src}
            alt={alt || ''}
            className={`w-full h-auto cursor-pointer transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setModalOpen(true)}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          
          {/* Image Overlay with Controls */}
          <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <span className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Zoom Icon */}
              <button
                onClick={() => setModalOpen(true)}
                className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                title="View full size"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              
              {/* Download Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(src, generateImageName(src, alt || ''));
                }}
                disabled={downloading}
                className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download image"
              >
                {downloading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 block"></span>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </button>
            </span>
          </span>
        </span>
        
        {alt && (
          <span className="block text-center text-sm text-gray-600 mt-3 italic">
            {alt}
          </span>
        )}
      </span>

      <ImageModal
        src={src}
        alt={alt || ''}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)
  const [aiMetadata, setAiMetadata] = useState<{
    urlSlug: string
    metaTitle: string
    metaDescription: string
  } | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)
  const [fieldLoading, setFieldLoading] = useState<{
    urlSlug: boolean
    metaTitle: boolean
    metaDescription: boolean
  }>({
    urlSlug: false,
    metaTitle: false,
    metaDescription: false
  })
  const [showWordPressModal, setShowWordPressModal] = useState(false)
  const [wordpressConfig, setWordpressConfig] = useState({
    url: '',
    username: '',
    password: ''
  })
  const [metaData, setMetaData] = useState({
    urlSlug: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft' as 'draft' | 'publish'
  })
  const [wordpressLoading, setWordpressLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [facebookContent, setFacebookContent] = useState({
    title: '',
    description: '',
    imageSource: '',
    articleSection: '',
    tags: ''
  });

  // Instagram Modal State
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [instagramContent, setInstagramContent] = useState({
    caption: '',
    hashtags: '',
    imageSource: '',
    cta: '',
    mentions: ''
  });

  // X/Twitter Modal State
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [twitterContent, setTwitterContent] = useState({
    text: '',
    hashtags: '',
    mentions: '',
    thread: ''
  });

  // LinkedIn Modal State
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInContent, setLinkedInContent] = useState({
    title: '',
    description: '',
    imageSource: '',
    tags: '',
    cta: ''
  });

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    preheader: '',
    content: '',
    cta: '',
    imageSource: ''
  });

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Blog Scoring State
  const [blogScoring, setBlogScoring] = useState<any>(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // Medium Integration State
  const [showMediumModal, setShowMediumModal] = useState(false)
  const [mediumConfig, setMediumConfig] = useState({
    accessToken: '',
    publicationId: '',
    authorId: ''
  })
  const [mediumLoading, setMediumLoading] = useState(false)
  const [testingMediumConnection, setTestingMediumConnection] = useState(false)
  const [mediumConnectionStatus, setMediumConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mediumConnectionError, setMediumConnectionError] = useState<string | null>(null)
  const [mediumPublications, setMediumPublications] = useState<Array<{id: string, name: string}>>([])

  // Blogger Integration State
  const [showBloggerModal, setShowBloggerModal] = useState(false)
  const [bloggerConfig, setBloggerConfig] = useState({
    apiKey: '',
    blogId: '',
    blogName: '',
    blogUrl: ''
  })
  const [bloggerLoading, setBloggerLoading] = useState(false)
  const [testingBloggerConnection, setTestingBloggerConnection] = useState(false)
  const [bloggerConnectionStatus, setBloggerConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [bloggerConnectionError, setBloggerConnectionError] = useState<string | null>(null)

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { isLoaded, paramsId: params.id, paramType: typeof params.id });
    if (isLoaded && params.id && params.id !== 'undefined') {
      console.log('✅ Fetching post with ID:', params.id);
      fetchPost(params.id as string)
    } else {
      console.log('❌ Skipping fetch - invalid params:', { isLoaded, paramsId: params.id });
    }
  }, [isLoaded, params.id])

  // Load saved WordPress configuration when modal opens
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!showWordPressModal || !user) return;
      
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings && data.settings.wordpress) {
            setWordpressConfig(prev => ({
              ...prev,
              url: data.settings.wordpress.url || '',
              username: data.settings.wordpress.username || '',
              password: data.settings.wordpress.password || ''
            }));
            
            if (data.settings.wordpress.connectionStatus === 'success') {
              setConnectionStatus('success');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user settings:', error);
      }
    };

    loadUserSettings();
  }, [showWordPressModal, user]);

  useEffect(() => {
    const loadMediumSettings = async () => {
      if (!showMediumModal || !user) return;
      
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings && data.settings.medium) {
            setMediumConfig(prev => ({
              ...prev,
              accessToken: data.settings.medium.accessToken || '',
              publicationId: data.settings.medium.publicationId || '',
              authorId: data.settings.medium.authorId || ''
            }));
            
            if (data.settings.medium.connectionStatus === 'success') {
              setMediumConnectionStatus('success');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load Medium settings:', error);
      }
    };

    loadMediumSettings();
  }, [showMediumModal, user]);

  // Load Blogger settings when modal opens
  useEffect(() => {
    const loadBloggerSettings = async () => {
      if (!showBloggerModal || !user) return;
      
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings && data.settings.blogger) {
            setBloggerConfig(prev => ({
              ...prev,
              apiKey: data.settings.blogger.apiKey || '',
              blogId: data.settings.blogger.blogId || '',
              blogName: data.settings.blogger.blogName || '',
              blogUrl: data.settings.blogger.blogUrl || ''
            }));
            
            if (data.settings.blogger.connectionStatus === 'success') {
              setBloggerConnectionStatus('success');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load Blogger settings:', error);
      }
    };

    loadBloggerSettings();
  }, [showBloggerModal, user]);

  const fetchPost = async (postId: string) => {
    console.log('🚀 fetchPost called with:', postId);
    
    if (!postId || postId === 'undefined') {
      console.error('❌ Invalid postId:', postId);
      setError('Invalid post ID');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true)
      console.log('📡 Making API call to:', `/api/posts/${postId}`);
      const response = await fetch(`/api/posts/${postId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog post not found')
        } else if (response.status === 401) {
          setError('Please sign in to view this post')
        } else {
          setError('Failed to load blog post')
        }
        return
      }
      
      const data = await response.json()
      setPost(data.post)
      
      // Fetch AI-generated content
      fetchAITags(postId)
      fetchAIMetadata(postId)
      fetchBlogScoring(postId)
    } catch (err) {
      console.error('❌ Error in fetchPost:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  const fetchAITags = async (postId: string) => {
    if (!postId || postId === 'undefined') {
      console.error('❌ Invalid postId for tags:', postId);
      return;
    }
    
    try {
      setTagsLoading(true)
      console.log('📡 Fetching tags for post:', postId);
      const response = await fetch(`/api/posts/${postId}/tags`)
      
      if (response.ok) {
        const data = await response.json()
        setAiTags(data.tags || [])
      } else {
        // Fallback to basic tags if AI generation fails
        setAiTags(['Content', 'Video', 'Analysis'])
      }
    } catch (error) {
      console.error('Failed to fetch AI tags:', error)
      setAiTags(['Content', 'Video', 'Analysis'])
    } finally {
      setTagsLoading(false)
    }
  }

  const fetchAIMetadata = async (postId: string) => {
    if (!postId || postId === 'undefined') {
      console.error('❌ Invalid postId for metadata:', postId);
      return;
    }
    
    try {
      setMetadataLoading(true)
      console.log('📡 Fetching metadata for post:', postId);
      const response = await fetch(`/api/posts/${postId}/metadata`)
      
      if (response.ok) {
        const data = await response.json()
        setAiMetadata(data.metadata)
      } else {
        // Fallback will be handled by the original functions
        setAiMetadata(null)
      }
    } catch (error) {
      console.error('Failed to fetch AI metadata:', error)
      setAiMetadata(null)
    } finally {
      setMetadataLoading(false)
    }
  }

  const fetchBlogScoring = async (postId: string) => {
    if (!postId || postId === 'undefined') {
      console.error('❌ Invalid postId for scoring:', postId);
      return;
    }
    
    try {
      setScoringLoading(true)
      console.log('📡 Fetching blog scoring for post:', postId);
      const response = await fetch(`/api/posts/${postId}/score`)
      
      if (response.ok) {
        const data = await response.json()
        setBlogScoring(data.analysis)
      } else {
        console.error('Failed to fetch blog scoring')
        setBlogScoring(null)
      }
    } catch (error) {
      console.error('Failed to fetch blog scoring:', error)
      setBlogScoring(null)
    } finally {
      setScoringLoading(false)
    }
  }

  const regenerateField = async (field: 'urlSlug' | 'metaTitle' | 'metaDescription') => {
    if (!post) return
    
    try {
      setFieldLoading(prev => ({ ...prev, [field]: true }))
      const response = await fetch(`/api/posts/${post._id}/metadata?field=${field}`)
      
      if (response.ok) {
        const data = await response.json()
        setAiMetadata(prev => ({
          ...prev,
          [field]: data.value
        } as any))
      } else {
        console.error(`Failed to regenerate ${field}`)
        alert(`Failed to regenerate ${field}. Please try again.`)
      }
    } catch (error) {
      console.error(`Error regenerating ${field}:`, error)
      alert(`Error regenerating ${field}. Please try again.`)
    } finally {
      setFieldLoading(prev => ({ ...prev, [field]: false }))
    }
  }

  const copyToClipboard = () => {
    if (post?.content) {
      navigator.clipboard.writeText(post.content)
      alert('Blog content copied to clipboard!')
    }
  }

  const copyMetadata = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    alert(`${type} copied to clipboard!`)
  }

  const downloadAsFile = () => {
    if (post?.content && post?.title) {
      const element = document.createElement('a')
      const file = new Blob([post.content], { type: 'text/markdown' })
      element.href = URL.createObjectURL(file)
      element.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const publishToWordPress = async () => {
    if (!post) return

    setWordpressLoading(true)
    try {
      const response = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post._id,
          wordpressConfig,
          publishSettings: {
            ...metaData,
            status: 'draft',
            metaTitle: metaData.metaTitle || post.title,
            metaDescription: metaData.metaDescription || generateMetaDescription(post.content)
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 max-w-md'
        const imageCount = (post?.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
        notification.innerHTML = `
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Successfully Published!</div>
              <div class="text-sm text-green-100 mt-1">
                Your blog post${imageCount > 0 ? ` and ${imageCount} image${imageCount !== 1 ? 's' : ''}` : ''} 
                ${imageCount > 0 ? 'have' : 'has'} been published to WordPress.
              </div>
              <a href="${data.wordpress.url}" target="_blank" rel="noopener noreferrer" class="text-sm text-green-100 underline hover:text-white">
                View on WordPress →
              </a>
            </div>
          </div>
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.style.opacity = '0'
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification)
            }
          }, 300)
        }, 5000)

        // Close modal and refresh post data
        setShowWordPressModal(false)
        if (post && post._id && post._id !== 'undefined') {
          fetchPost(post._id)
        } else {
          console.error('❌ Cannot refresh post data - invalid post ID:', post?._id);
        }
      } else {
        throw new Error(data.error || 'Failed to publish to WordPress')
      }
    } catch (error) {
      console.error('WordPress publishing error:', error)
      
      // Show error notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 max-w-md'
      notification.innerHTML = `
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div class="font-medium">Publishing Failed</div>
            <div class="text-sm text-red-100 mt-1">${error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.opacity = '0'
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }, 5000)
    } finally {
      setWordpressLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Generate URL slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Generate meta title (usually the blog title, truncated if needed)
  const generateMetaTitle = (title: string) => {
    if (title.length <= 60) return title
    return title.substring(0, 57) + '...'
  }

  // Generate meta description from content
  const generateMetaDescription = (content: string) => {
    // Remove markdown syntax and get plain text
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
      .replace(/`(.+?)`/g, '$1') // Remove code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    // Get first sentence or 145 characters
    const sentences = plainText.split('. ')
    let description = sentences[0]
    
    if (description.length > 145) {
      description = plainText.substring(0, 142) + '...'
    } else if (sentences.length > 1 && (description + '. ' + sentences[1]).length <= 145) {
      description = description + '. ' + sentences[1]
    }

    return description
  }

  // Generate relevant tags from content
  const generateTagsFromContent = (content: string, title: string) => {
    // Combine title and content for analysis
    const fullText = `${title} ${content}`.toLowerCase()
    
    // Remove markdown and common words
    const cleanText = fullText
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
      .replace(/`(.+?)`/g, '$1') // Remove code
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'
    ])

    // Extract words and count frequency
    const words = cleanText.split(' ').filter(word => 
      word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word)
    )

    const wordFreq = new Map<string, number>()
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })

    // Sort by frequency and get top 8-12 relevant words
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word]) => word)

    // Capitalize first letter of each tag
    const tags = sortedWords.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    )

    return tags.length > 0 ? tags : ['Content', 'Video', 'Analysis']
  }

  // Blog Scoring System
  const analyzeBlogContent = (content: string, title: string, metaDescription?: string) => {
    // Remove markdown for analysis
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
      .replace(/`(.+?)`/g, '$1') // Remove code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    // Extract keyphrase (most common meaningful word from title)
    const titleWords = title.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['the', 'and', 'for', 'with', 'how', 'what', 'why', 'when', 'where'].includes(word)
    )
    const keyphrase = titleWords[0] || 'content'

    // 1. READABILITY ANALYSIS
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = plainText.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((total, word) => {
      // Simple syllable counting (rough approximation)
      const vowels = word.match(/[aeiouy]+/gi) || []
      return total + Math.max(1, vowels.length)
    }, 0)

    // Flesch-Kincaid Grade Level
    const avgSentenceLength = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length
    const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59

    // 2. CONTENT STRUCTURE ANALYSIS
    const wordCount = words.length
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 120)
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25)
    
    // Count images and links
    const imageCount = (content.match(/!\[.*?\]\(.+?\)/g) || []).length
    const linkCount = (content.match(/\[.+?\]\(.+?\)/g) || []).length

    // 3. KEYPHRASE ANALYSIS
    const keyphraseInContent = (plainText.toLowerCase().match(new RegExp(keyphrase, 'gi')) || []).length
    const keyphraseInTitle = title.toLowerCase().includes(keyphrase) ? 1 : 0
    const keyphraseInIntro = paragraphs[0]?.toLowerCase().includes(keyphrase) ? 1 : 0
    const keyphraseInMeta = metaDescription?.toLowerCase().includes(keyphrase) ? 1 : 0
    const keyphraseDensity = (keyphraseInContent / words.length) * 100

    // SCORING SYSTEM (100 points total)
    let score = 0
    const details = {
      readability: {
        gradeLevel: Math.round(fleschKincaid * 10) / 10,
        score: 0,
        status: ''
      },
      structure: {
        wordCount,
        longParagraphsPercent: Math.round((longParagraphs.length / paragraphs.length) * 100),
        longSentencesPercent: Math.round((longSentences.length / sentences.length) * 100),
        imageCount,
        linkCount,
        score: 0,
        status: ''
      },
      keyphrase: {
        phrase: keyphrase,
        density: Math.round(keyphraseDensity * 100) / 100,
        inTitle: keyphraseInTitle,
        inIntro: keyphraseInIntro,
        inMeta: keyphraseInMeta,
        score: 0,
        status: ''
      }
    }

    // Calculate Readability Score (20 points)
    if (fleschKincaid >= 7 && fleschKincaid <= 8) {
      details.readability.score = 20
      details.readability.status = 'Excellent'
    } else if (fleschKincaid >= 6 && fleschKincaid <= 9) {
      details.readability.score = 15
      details.readability.status = 'Good'
    } else if (fleschKincaid >= 5 && fleschKincaid <= 10) {
      details.readability.score = 10
      details.readability.status = 'Fair'
    } else {
      details.readability.score = 5
      details.readability.status = 'Needs Improvement'
    }

    // Calculate Structure Score (50 points)
    let structureScore = 0
    
    // Word count (10 points)
    if (wordCount >= 300) structureScore += 10
    else if (wordCount >= 200) structureScore += 7
    else if (wordCount >= 100) structureScore += 4
    
    // Long paragraphs (10 points)
    const longParaPercent = (longParagraphs.length / paragraphs.length) * 100
    if (longParaPercent <= 25) structureScore += 10
    else if (longParaPercent <= 50) structureScore += 5
    
    // Long sentences (10 points)
    const longSentPercent = (longSentences.length / sentences.length) * 100
    if (longSentPercent <= 25) structureScore += 10
    else if (longSentPercent <= 50) structureScore += 5
    
    // Images (10 points)
    if (imageCount > 0) structureScore += 10
    
    // Links (10 points)
    if (linkCount > 0) structureScore += 10

    details.structure.score = structureScore
    if (structureScore >= 40) details.structure.status = 'Excellent'
    else if (structureScore >= 30) details.structure.status = 'Good'
    else if (structureScore >= 20) details.structure.status = 'Fair'
    else details.structure.status = 'Needs Improvement'

    // Calculate Keyphrase Score (30 points)
    let keyphraseScore = 0
    
    // Density (10 points)
    if (keyphraseDensity >= 1 && keyphraseDensity <= 5) keyphraseScore += 10
    else if (keyphraseDensity >= 0.5 && keyphraseDensity <= 7) keyphraseScore += 7
    else if (keyphraseDensity > 0) keyphraseScore += 4
    
    // In title (7 points)
    if (keyphraseInTitle) keyphraseScore += 7
    
    // In intro (7 points)
    if (keyphraseInIntro) keyphraseScore += 7
    
    // In meta (6 points)
    if (keyphraseInMeta) keyphraseScore += 6

    details.keyphrase.score = keyphraseScore
    if (keyphraseScore >= 25) details.keyphrase.status = 'Excellent'
    else if (keyphraseScore >= 20) details.keyphrase.status = 'Good'
    else if (keyphraseScore >= 15) details.keyphrase.status = 'Fair'
    else details.keyphrase.status = 'Needs Improvement'

    // Total Score
    score = details.readability.score + details.structure.score + details.keyphrase.score

    return {
      totalScore: score,
      grade: score >= 85 ? 'A' : score >= 75 ? 'B' : score >= 65 ? 'C' : score >= 50 ? 'D' : 'F',
      details
    }
  }

  const testWordPressConnection = async () => {
    if (!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password) {
      setConnectionError('Please fill in all WordPress configuration fields');
      setConnectionStatus('error');
      return;
    }

    try {
      setTestingConnection(true);
      setConnectionStatus('idle');
      setConnectionError(null);

      console.log('🔍 Testing WordPress connection...');
      console.log('📊 Config:', {
        url: wordpressConfig.url,
        username: wordpressConfig.username,
        hasPassword: !!wordpressConfig.password
      });

      const response = await fetch('/api/wordpress/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: wordpressConfig.url,
          username: wordpressConfig.username,
          password: wordpressConfig.password
        })
      });

      console.log('📡 WordPress test response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ WordPress test failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ WordPress test success:', data);
      
      if (data.success) {
        setConnectionStatus('success');
        
        // Save the configuration to database
        await fetch('/api/user/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            wordpress: {
              ...wordpressConfig,
              connectionStatus: 'success'
            }
          })
        });
        
        console.log('✅ WordPress configuration saved to database');
      } else {
        setConnectionError(data.error || 'Connection test failed');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ WordPress connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Network error occurred');
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const testMediumConnection = async () => {
    if (!mediumConfig.accessToken) {
      setMediumConnectionError('Please provide a Medium access token');
      setMediumConnectionStatus('error');
      return;
    }

    try {
      setTestingMediumConnection(true);
      setMediumConnectionStatus('idle');
      setMediumConnectionError(null);

      console.log('🔍 Testing Medium connection...');

      const response = await fetch('/api/medium/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: mediumConfig.accessToken
        })
      });

      console.log('📡 Medium test response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Medium test failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Medium test success:', data);
      
      if (data.success) {
        setMediumConnectionStatus('success');
        
        // Update config with user info
        setMediumConfig(prev => ({
          ...prev,
          authorId: data.user.id
        }));

        // Load publications
        if (data.publications && data.publications.length > 0) {
          setMediumPublications(data.publications);
        }
        
        // Save the configuration to database
        await fetch('/api/user/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            medium: {
              ...mediumConfig,
              authorId: data.user.id,
              connectionStatus: 'success'
            }
          })
        });
        
        console.log('✅ Medium configuration saved to database');
      } else {
        setMediumConnectionError(data.error || 'Connection test failed');
        setMediumConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Medium connection error:', error);
      setMediumConnectionError(error instanceof Error ? error.message : 'Network error occurred');
      setMediumConnectionStatus('error');
    } finally {
      setTestingMediumConnection(false);
    }
  };

  const publishToMedium = async () => {
    if (!post) return;

    if (!mediumConfig.accessToken) {
      alert('Please configure Medium integration first');
      setShowMediumModal(true);
      return;
    }

    try {
      setMediumLoading(true);
      console.log('📝 Publishing to Medium...');

      const response = await fetch('/api/medium/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: mediumConfig.accessToken,
          authorId: mediumConfig.authorId,
          publicationId: mediumConfig.publicationId || null,
          title: post.title,
          content: post.content,
          contentFormat: 'markdown',
          publishStatus: 'draft', // Can be 'public', 'draft', or 'unlisted'
          tags: aiTags.slice(0, 5) // Medium allows up to 5 tags
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Medium publish failed:', errorData);
        throw new Error(`Failed to publish: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Medium publish success:', data);

      if (data.success) {
        alert(`✅ Successfully published to Medium! View at: ${data.url}`);
      } else {
        throw new Error(data.error || 'Publishing failed');
      }
    } catch (error) {
      console.error('❌ Medium publishing error:', error);
      alert(`❌ Failed to publish to Medium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setMediumLoading(false);
    }
  };

  const testBloggerConnection = async () => {
    if (!bloggerConfig.apiKey || !bloggerConfig.blogId) {
      setBloggerConnectionError('Please provide both API Key and Blog ID');
      setBloggerConnectionStatus('error');
      return;
    }

    try {
      setTestingBloggerConnection(true);
      setBloggerConnectionStatus('idle');
      setBloggerConnectionError(null);

      console.log('🔍 Testing Blogger connection...');

      const response = await fetch('/api/blogger/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: bloggerConfig.apiKey,
          blogId: bloggerConfig.blogId
        })
      });

      console.log('📡 Blogger test response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Blogger test failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Blogger test success:', data);
      
      if (data.success) {
        setBloggerConnectionStatus('success');
        
        // Update config with blog info
        setBloggerConfig(prev => ({
          ...prev,
          blogName: data.blog.name,
          blogUrl: data.blog.url
        }));
        
        console.log('✅ Blogger configuration updated');
      } else {
        setBloggerConnectionError(data.error || 'Connection test failed');
        setBloggerConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Blogger connection error:', error);
      setBloggerConnectionError(error instanceof Error ? error.message : 'Network error occurred');
      setBloggerConnectionStatus('error');
    } finally {
      setTestingBloggerConnection(false);
    }
  };

  const publishToBlogger = async () => {
    if (!post) return;

    if (!bloggerConfig.apiKey || !bloggerConfig.blogId) {
      alert('Please configure Blogger integration first');
      setShowBloggerModal(true);
      return;
    }

    try {
      setBloggerLoading(true);
      console.log('📝 Publishing to Blogger...');

      const response = await fetch('/api/blogger/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: bloggerConfig.apiKey,
          blogId: bloggerConfig.blogId,
          title: post.title,
          content: post.content,
          isDraft: true, // Publish as draft by default
          labels: aiTags.slice(0, 20) // Blogger allows many labels
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Blogger publish failed:', errorData);
        throw new Error(`Failed to publish: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Blogger publish success:', data);

      if (data.success) {
        alert(`✅ Successfully published to Blogger! View at: ${data.url}`);
      } else {
        throw new Error(data.error || 'Publishing failed');
      }
    } catch (error) {
      console.error('❌ Blogger publishing error:', error);
      alert(`❌ Failed to publish to Blogger: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBloggerLoading(false);
    }
  };

  const initializeFacebookContent = () => {
    if (!post) return;
    
    // Get all images from post content, prioritizing screenshots
    const imageMatches = post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
    let selectedImage = '';
    
    if (imageMatches && imageMatches.length > 0) {
      // Extract URLs from all matches
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return urlMatch ? urlMatch[2] : '';
      }).filter(url => url !== '');
      
      // Prefer the first screenshot from content
      selectedImage = imageUrls[0];
    }
    
    // Fallback to featured image if no screenshots found
    if (!selectedImage && post.thumbnail) {
      selectedImage = post.thumbnail;
    }
    
    // Generate article section from content type and target audience
    const articleSection = `${post.contentAnalysis.contentType} | ${post.contentAnalysis.targetAudience}`;
    
    // Get tags from AI tags or generate from content
    const tagsString = aiTags.length > 0 
      ? aiTags.slice(0, 5).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : generateTagsFromContent(post.content, post.title).slice(0, 5).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');

    setFacebookContent({
      title: aiMetadata?.metaTitle || generateMetaTitle(post.title),
      description: aiMetadata?.metaDescription || generateMetaDescription(post.content),
      imageSource: selectedImage,
      articleSection: articleSection,
      tags: tagsString
    });
    
    setShowFacebookModal(true);
  };

  const initializeInstagramContent = () => {
    if (!post) return;
    
    // Get first image from post content or use featured image
    const imageMatches = post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
    let selectedImage = '';
    
    if (imageMatches && imageMatches.length > 0) {
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return urlMatch ? urlMatch[2] : '';
      }).filter(url => url !== '');
      selectedImage = imageUrls[0];
    }
    
    if (!selectedImage && post.thumbnail) {
      selectedImage = post.thumbnail;
    }

    // Generate caption with title and description
    const caption = `${post.title}\n\n${aiMetadata?.metaDescription || generateMetaDescription(post.content)}\n\nLink in bio 👆`;
    
    // Generate hashtags from AI tags or content
    const hashtags = aiTags.length > 0 
      ? aiTags.slice(0, 10).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : generateTagsFromContent(post.content, post.title).slice(0, 10).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');

    setInstagramContent({
      caption: caption,
      hashtags: hashtags,
      imageSource: selectedImage,
      cta: 'Check out the full article in our bio! 🔗',
      mentions: '@videotoblog'
    });
    
    setShowInstagramModal(true);
  };

  const initializeTwitterContent = () => {
    if (!post) return;
    
    // Generate tweet text (max 280 characters)
    const baseText = `${post.title}\n\n${(aiMetadata?.metaDescription || generateMetaDescription(post.content)).substring(0, 120)}...`;
    
    // Generate hashtags from AI tags
    const hashtags = aiTags.length > 0 
      ? aiTags.slice(0, 3).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : generateTagsFromContent(post.content, post.title).slice(0, 3).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');

    // Generate thread content
    const threadContent = `1/3 ${post.title}\n\n2/3 ${aiMetadata?.metaDescription || generateMetaDescription(post.content)}\n\n3/3 Read the full article: ${window.location.href}`;

    setTwitterContent({
      text: baseText,
      hashtags: hashtags,
      mentions: '@videotoblog',
      thread: threadContent
    });
    
    setShowTwitterModal(true);
  };

  const initializeLinkedInContent = () => {
    if (!post) return;
    
    // Get first image from post content or use featured image
    const imageMatches = post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
    let selectedImage = '';
    
    if (imageMatches && imageMatches.length > 0) {
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return urlMatch ? urlMatch[2] : '';
      }).filter(url => url !== '');
      selectedImage = imageUrls[0];
    }
    
    if (!selectedImage && post.thumbnail) {
      selectedImage = post.thumbnail;
    }

    // Generate professional description
    const description = `${aiMetadata?.metaDescription || generateMetaDescription(post.content)}\n\nKey insights from this ${post.contentAnalysis.contentType.toLowerCase()}:\n\n🎯 Target audience: ${post.contentAnalysis.targetAudience}\n📊 Word count: ${post.wordCount.toLocaleString()} words\n\nWhat are your thoughts on this topic?`;
    
    // Generate hashtags from AI tags
    const tags = aiTags.length > 0 
      ? aiTags.slice(0, 5).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : generateTagsFromContent(post.content, post.title).slice(0, 5).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');

    setLinkedInContent({
      title: post.title,
      description: description,
      imageSource: selectedImage,
      tags: tags,
      cta: 'Read the full article and share your insights in the comments! 👇'
    });
    
    setShowLinkedInModal(true);
  };

  const initializeEmailContent = () => {
    if (!post) return;
    
    // Get first image from post content or use featured image
    const imageMatches = post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
    let selectedImage = '';
    
    if (imageMatches && imageMatches.length > 0) {
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return urlMatch ? urlMatch[2] : '';
      }).filter(url => url !== '');
      selectedImage = imageUrls[0];
    }
    
    if (!selectedImage && post.thumbnail) {
      selectedImage = post.thumbnail;
    }

    // Generate email content
    const emailBody = `Hi there!

I wanted to share this valuable ${post.contentAnalysis.contentType.toLowerCase()} with you:

"${post.title}"

${aiMetadata?.metaDescription || generateMetaDescription(post.content)}

This ${post.wordCount.toLocaleString()}-word piece is perfect for ${post.contentAnalysis.targetAudience.toLowerCase()} and covers key insights that I think you'll find valuable.

You can read the full article here: ${window.location.href}

Best regards,
[Your Name]`;

    setEmailContent({
      subject: `Check out: ${post.title}`,
      preheader: aiMetadata?.metaDescription || generateMetaDescription(post.content).substring(0, 100),
      content: emailBody,
      cta: 'Read Full Article',
      imageSource: selectedImage
    });
    
    setShowEmailModal(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation variant="default" />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Please sign in to view this blog post.</p>
            <Link 
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={{
          id: user.id,
          fullName: user.fullName,
          emailAddress: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl
        }}
      />
      
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Post</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          ) : post ? (
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-5">
                {/* Header */}
                <div className="mb-8">
                  <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <span>›</span>
                    <span className="text-gray-900">Blog Post</span>
                  </nav>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Title and Meta Info */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Created: {formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{post.wordCount.toLocaleString()} words</span>
                          <span>•</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>

                      {/* Publishing & Action Buttons - Clean Design */}
                      <div className="pt-6 border-t border-gray-100">
                        {/* Main Publish Button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1">
                            <button
                              onClick={() => setShowPublishModal(true)}
                              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                            >
                              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                              Publish Blog Post
                              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <p className="text-sm text-gray-600 mt-2">Choose from WordPress, Medium, Blogger and more</p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={post.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group"
                              title="Watch original video"
                            >
                              <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Watch Video
                            </a>

                            <button
                              onClick={copyToClipboard}
                              className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group"
                              title="Copy content to clipboard"
                            >
                              <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </button>
                            
                            <button
                              onClick={downloadAsFile}
                              className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group"
                              title="Download as markdown file"
                            >
                              <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.wordCount.toLocaleString()} words
                          </span>
                          
                          {post.hasScreenshots && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {post.screenshotCount} images
                            </span>
                          )}
                          
                          {post.hasTableOfContents && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                              Table of Contents
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {post.seoOptimized && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              SEO Optimized
                            </span>
                          )}
                          
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                            {post.contentAnalysis.contentType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Image Section */}
                {post.thumbnail && (
                  <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="relative h-64 md:h-80 lg:h-96">
                        <Image
                          src={post.thumbnail}
                          alt={`Featured image for ${post.title}`}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        
                        {/* Play Button Overlay */}
                        <a
                          href={post.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center group"
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                            <svg className="w-8 h-8 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </a>

                        {/* Video Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white shadow-lg">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Original Video
                          </span>
                        </div>

                        {/* Content Type Badge */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-lg">
                            {post.contentAnalysis.contentType}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 border-t">
                        <p className="text-sm text-gray-600 text-center">
                          📺 This blog post was generated from the video shown above. 
                          <a 
                            href={post.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 ml-1 underline"
                          >
                            Watch the original video
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blog Content */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-blue-500 prose-code:text-blue-600 prose-pre:bg-gray-100">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h3>,
                        p: ({ children, node }) => {
                          // Check if paragraph contains only an image
                          if (node && node.children && node.children.length === 1) {
                            const child = node.children[0];
                            if (child.type === 'element' && child.tagName === 'img') {
                              // Return the image directly without wrapping in <p>
                              return children;
                            }
                          }
                          return <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>;
                        },
                        a: ({ href, children }) => (
                          <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        img: ({ src, alt }) => (
                          <EnhancedImage src={src} alt={alt} />
                        ),
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-700">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-700">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-blue-600">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            {children}
                          </pre>
                        )
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Image Gallery Section */}
                {(() => {
                  const imageMatches = post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
                  const images = imageMatches.map(match => {
                    const altMatch = match.match(/!\[([^\]]*)\]/);
                    const srcMatch = match.match(/\]\(([^)]+)\)/);
                    return {
                      alt: altMatch ? altMatch[1] : '',
                      src: srcMatch ? srcMatch[1] : ''
                    };
                  }).filter(img => img.src);

                  // Bulk download function
                  const downloadAllImages = async () => {
                    if (!post) return;
                    
                    const zip = new JSZip();
                    let downloadedCount = 0;
                    
                    // Show progress notification
                    const progressNotification = document.createElement('div');
                    progressNotification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                    progressNotification.innerHTML = `
                      <div class="flex items-center space-x-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Preparing images... (0/${images.length})</span>
                      </div>
                    `;
                    document.body.appendChild(progressNotification);

                    try {
                      // Download all images
                      for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        try {
                          const response = await fetch(image.src);
                          const blob = await response.blob();
                          
                          // Generate filename
                          const safeName = (image.alt || `image-${i + 1}`)
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                          
                          const extension = image.src.split('.').pop()?.toLowerCase() || 'jpg';
                          const filename = `${safeName}.${extension}`;
                          
                          zip.file(filename, blob);
                          downloadedCount++;
                          
                          // Update progress
                          progressNotification.innerHTML = `
                            <div class="flex items-center space-x-2">
                              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Preparing images... (${downloadedCount}/${images.length})</span>
                            </div>
                          `;
                        } catch (error) {
                          console.error(`Failed to download image ${i + 1}:`, error);
                        }
                      }

                      // Generate and download zip
                      progressNotification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating zip file...</span>
                        </div>
                      `;

                      const content = await zip.generateAsync({ type: 'blob' });
                      const url = window.URL.createObjectURL(content);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${post?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_images.zip`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);

                      // Success notification
                      progressNotification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      progressNotification.innerHTML = `✓ Downloaded ${downloadedCount} images successfully!`;
                      
                      setTimeout(() => {
                        progressNotification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(progressNotification), 300);
                      }, 3000);

                    } catch (error) {
                      console.error('Bulk download failed:', error);
                      
                      // Error notification
                      progressNotification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      progressNotification.innerHTML = '✗ Bulk download failed. Please try again.';
                      
                      setTimeout(() => {
                        progressNotification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(progressNotification), 300);
                      }, 3000);
                    }
                  };

                  // Individual image download function
                  const downloadSingleImage = async (imageUrl: string, imageName: string) => {
                    try {
                      const response = await fetch(imageUrl);
                      const blob = await response.blob();
                      
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = imageName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      
                      // Success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.textContent = 'Image downloaded!';
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 2000);
                    } catch (error) {
                      console.error('Download failed:', error);
                      
                      // Error notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.textContent = 'Download failed!';
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 2000);
                    }
                  };

                  if (images.length > 1) {
                    return (
                      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Image Gallery ({images.length} images)
                          </h3>
                          
                          <button
                            onClick={downloadAllImages}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            title="Download all images as ZIP"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download All
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {images.map((image, index) => (
                            <div key={index} className="group">
                              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                      onClick={() => {
                                        const modal = document.createElement('div');
                                        modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
                                        modal.onclick = () => document.body.removeChild(modal);
                                        modal.innerHTML = `
                                          <div class="relative max-w-5xl max-h-full p-4">
                                            <button onclick="document.body.removeChild(this.closest('.fixed'))" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
                                              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                            <img src="${image.src}" alt="${image.alt}" class="max-w-full max-h-full object-contain" onclick="event.stopPropagation()">
                                            ${image.alt ? `<div class="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded">${image.alt}</div>` : ''}
                                          </div>
                                        `;
                                        document.body.appendChild(modal);
                                      }}
                                      className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                                      title="View full size"
                                    >
                                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const safeName = (image.alt || `image-${index + 1}`)
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, '-')
                                          .replace(/^-|-$/g, '');
                                        const extension = image.src.split('.').pop()?.toLowerCase() || 'jpg';
                                        downloadSingleImage(image.src, `${safeName}.${extension}`);
                                      }}
                                      className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                                      title="Download image"
                                    >
                                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {image.alt && (
                                <p className="text-sm text-gray-600 mt-2 truncate">{image.alt}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Navigation Footer */}
                <div className="mt-8 flex justify-between items-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </Link>

                  <div className="text-sm text-gray-600">
                    Target Audience: {post.contentAnalysis.targetAudience}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {/* Blog Scoring Section */}
                  {(() => {
                    const analysis = analyzeBlogContent(
                      post.content, 
                      post.title, 
                      aiMetadata?.metaDescription || generateMetaDescription(post.content)
                    )
                    
                    return (
                      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            Blog Quality Score
                          </h3>
                        </div>

                        {/* Overall Score */}
                        <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-gray-800">Overall Performance</span>
                            <div className="flex items-center space-x-3">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                                analysis.grade === 'A' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                analysis.grade === 'B' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                analysis.grade === 'C' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                analysis.grade === 'D' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}>
                                {analysis.grade}
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">{analysis.totalScore}</div>
                                <div className="text-sm text-gray-500">out of 100</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                              <div 
                                className={`h-4 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                  analysis.totalScore >= 85 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                  analysis.totalScore >= 75 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                  analysis.totalScore >= 65 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                  analysis.totalScore >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                  'bg-gradient-to-r from-red-400 to-red-500'
                                }`}
                                style={{ width: `${analysis.totalScore}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>Poor (0-49)</span>
                              <span>Good (50-74)</span>
                              <span>Excellent (75+)</span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-4">
                          {/* Readability */}
                          <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white text-sm font-bold">✓</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-800">Readability</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                analysis.details.readability.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                                analysis.details.readability.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                                analysis.details.readability.status === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {analysis.details.readability.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              Reading Level: <span className="font-semibold">{analysis.details.readability.gradeLevel}</span> 
                              <span className="text-xs text-gray-500 ml-1">(Target: 7-8th grade)</span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                                  style={{ width: `${(analysis.details.readability.score / 20) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{analysis.details.readability.score}/20 points</span>
                                <span>{Math.round((analysis.details.readability.score / 20) * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Content Structure */}
                          <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="text-lg font-semibold text-gray-800">Content Structure</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                analysis.details.structure.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                                analysis.details.structure.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                                analysis.details.structure.status === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {analysis.details.structure.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Words</div>
                                <div className="text-lg font-bold text-gray-900">{analysis.details.structure.wordCount}</div>
                                <div className="text-xs text-gray-500">Target: &gt;300</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Long Paragraphs</div>
                                <div className="text-lg font-bold text-gray-900">{analysis.details.structure.longParagraphsPercent}%</div>
                                <div className="text-xs text-gray-500">Target: &lt;25%</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Images</div>
                                <div className="text-lg font-bold text-gray-900">{analysis.details.structure.imageCount}</div>
                                <div className="text-xs text-gray-500">Target: &gt;0</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1">Links</div>
                                <div className="text-lg font-bold text-gray-900">{analysis.details.structure.linkCount}</div>
                                <div className="text-xs text-gray-500">Target: &gt;0</div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                                  style={{ width: `${(analysis.details.structure.score / 50) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{analysis.details.structure.score}/50 points</span>
                                <span>{Math.round((analysis.details.structure.score / 50) * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Keyphrase Analysis */}
                          <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                                <span className="text-lg font-semibold text-gray-800">SEO Keywords</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                analysis.details.keyphrase.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                                analysis.details.keyphrase.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                                analysis.details.keyphrase.status === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {analysis.details.keyphrase.status}
                              </span>
                            </div>
                            
                            <div className="bg-purple-50 rounded-lg p-3 mb-3">
                              <div className="text-xs text-purple-600 mb-1">Focus Keyphrase</div>
                              <div className="text-lg font-bold text-purple-900">"{analysis.details.keyphrase.phrase}"</div>
                              <div className="text-sm text-purple-600 mt-1">Density: {analysis.details.keyphrase.density}% (Target: 1-5%)</div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className={`p-2 rounded-lg text-center ${analysis.details.keyphrase.inTitle ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className={`text-xs font-medium ${analysis.details.keyphrase.inTitle ? 'text-green-700' : 'text-red-700'}`}>Title</div>
                                <div className={`text-lg ${analysis.details.keyphrase.inTitle ? 'text-green-600' : 'text-red-600'}`}>
                                  {analysis.details.keyphrase.inTitle ? '✓' : '✗'}
                                </div>
                              </div>
                              <div className={`p-2 rounded-lg text-center ${analysis.details.keyphrase.inIntro ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className={`text-xs font-medium ${analysis.details.keyphrase.inIntro ? 'text-green-700' : 'text-red-700'}`}>Intro</div>
                                <div className={`text-lg ${analysis.details.keyphrase.inIntro ? 'text-green-600' : 'text-red-600'}`}>
                                  {analysis.details.keyphrase.inIntro ? '✓' : '✗'}
                                </div>
                              </div>
                              <div className={`p-2 rounded-lg text-center ${analysis.details.keyphrase.inMeta ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className={`text-xs font-medium ${analysis.details.keyphrase.inMeta ? 'text-green-700' : 'text-red-700'}`}>Meta</div>
                                <div className={`text-lg ${analysis.details.keyphrase.inMeta ? 'text-green-600' : 'text-red-600'}`}>
                                  {analysis.details.keyphrase.inMeta ? '✓' : '✗'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-700"
                                  style={{ width: `${(analysis.details.keyphrase.score / 30) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{analysis.details.keyphrase.score}/30 points</span>
                                <span>{Math.round((analysis.details.keyphrase.score / 30) * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Improvement Tips */}
                        {analysis.totalScore < 85 && (
                          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-5">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <h4 className="text-lg font-bold text-amber-800">Smart Improvement Tips</h4>
                            </div>
                            <div className="space-y-2">
                              {analysis.details.readability.score < 15 && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Break down complex sentences for better readability</span>
                                </div>
                              )}
                              {analysis.details.structure.wordCount < 300 && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Expand your content to reach 300+ words for better SEO</span>
                                </div>
                              )}
                              {analysis.details.structure.imageCount === 0 && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Add relevant images to boost engagement and visual appeal</span>
                                </div>
                              )}
                              {analysis.details.structure.linkCount === 0 && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Include internal/external links for better SEO performance</span>
                                </div>
                              )}
                              {analysis.details.keyphrase.density < 1 && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Increase keyphrase usage to 1-5% density for optimal SEO</span>
                                </div>
                              )}
                              {!analysis.details.keyphrase.inTitle && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Include your focus keyphrase in the title</span>
                                </div>
                              )}
                              {!analysis.details.keyphrase.inIntro && (
                                <div className="flex items-start p-3 bg-white rounded-lg">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">Mention your keyphrase in the introduction paragraph</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Metadata Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Metadata
                    </h3>

                    <div className="space-y-4">
                      {/* URL Slug */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL Slug
                          {metadataLoading && (
                            <span className="ml-2 text-xs text-purple-600">
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></span>
                              AI generating...
                            </span>
                          )}
                        </label>
                        <div className="bg-gray-50 rounded-md p-3 border relative group">
                          <code className="text-sm text-gray-800 break-all pr-16">
                            /{aiMetadata?.urlSlug || generateSlug(post.title)}
                          </code>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <button
                              onClick={() => regenerateField('urlSlug')}
                              disabled={fieldLoading.urlSlug}
                              className="p-1 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Regenerate URL slug"
                            >
                              {fieldLoading.urlSlug ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-purple-600"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => copyMetadata(`/${aiMetadata?.urlSlug || generateSlug(post.title)}`, 'URL Slug')}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                              title="Copy URL slug"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Meta Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Title
                          {metadataLoading && (
                            <span className="ml-2 text-xs text-purple-600">
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></span>
                              AI generating...
                            </span>
                          )}
                        </label>
                        <div className="bg-gray-50 rounded-md p-3 border relative group">
                          <p className="text-sm text-gray-800 mb-2 pr-16">
                            {aiMetadata?.metaTitle || generateMetaTitle(post.title)}
                          </p>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <button
                              onClick={() => regenerateField('metaTitle')}
                              disabled={fieldLoading.metaTitle}
                              className="p-1 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Regenerate meta title"
                            >
                              {fieldLoading.metaTitle ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-purple-600"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => copyMetadata(aiMetadata?.metaTitle || generateMetaTitle(post.title), 'Meta Title')}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                              title="Copy meta title"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Recommended: 60 characters
                            </span>
                            <span className={`font-medium ${
                              (aiMetadata?.metaTitle || generateMetaTitle(post.title)).length <= 60 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              You've used {(aiMetadata?.metaTitle || generateMetaTitle(post.title)).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Description
                          {metadataLoading && (
                            <span className="ml-2 text-xs text-purple-600">
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></span>
                              AI generating...
                            </span>
                          )}
                        </label>
                        <div className="bg-gray-50 rounded-md p-3 border relative group">
                          <p className="text-sm text-gray-800 mb-2 pr-16">
                            {aiMetadata?.metaDescription || generateMetaDescription(post.content)}
                          </p>
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <button
                              onClick={() => regenerateField('metaDescription')}
                              disabled={fieldLoading.metaDescription}
                              className="p-1 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Regenerate meta description"
                            >
                              {fieldLoading.metaDescription ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-purple-600"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => copyMetadata(aiMetadata?.metaDescription || generateMetaDescription(post.content), 'Meta Description')}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                              title="Copy meta description"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Recommended: 145 characters
                            </span>
                            <span className={`font-medium ${
                              (aiMetadata?.metaDescription || generateMetaDescription(post.content)).length <= 145 
                                ? 'text-green-600' 
                                : (aiMetadata?.metaDescription || generateMetaDescription(post.content)).length <= 160
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              You've used {(aiMetadata?.metaDescription || generateMetaDescription(post.content)).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blog Scoring Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Blog Score
                      {scoringLoading && (
                        <span className="ml-2 text-xs text-green-600">
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-1"></span>
                          Analyzing...
                        </span>
                      )}
                    </h3>

                    {blogScoring ? (
                      <div className="space-y-4">
                        {/* Overall Score */}
                        <div className="text-center">
                          <div className={`text-4xl font-bold mb-2 ${
                            blogScoring.scoring.score >= 80 ? 'text-green-600' :
                            blogScoring.scoring.score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {blogScoring.scoring.score}/100
                          </div>
                          <div className="text-sm text-gray-600">Overall Blog Score</div>
                          <div className={`w-full bg-gray-200 rounded-full h-2 mt-2`}>
                            <div 
                              className={`h-2 rounded-full ${
                                blogScoring.scoring.score >= 80 ? 'bg-green-600' :
                                blogScoring.scoring.score >= 60 ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${blogScoring.scoring.score}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Readability */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Readability</span>
                            <span className={`text-sm font-semibold ${
                              blogScoring.readability.recommendation === 'Excellent' ? 'text-green-600' :
                              blogScoring.readability.recommendation === 'Good' ? 'text-blue-600' :
                              blogScoring.readability.recommendation === 'Fair' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {blogScoring.readability.recommendation}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            Grade Level: {blogScoring.readability.gradeLevel} (Target: {blogScoring.readability.target})
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${
                                blogScoring.readability.recommendation === 'Excellent' ? 'bg-green-600' :
                                blogScoring.readability.recommendation === 'Good' ? 'bg-blue-600' :
                                blogScoring.readability.recommendation === 'Fair' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${blogScoring.scoring.breakdown.readability * 10}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Content Structure */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Content Structure</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-900">{blogScoring.structure.wordCount}</div>
                              <div className="text-gray-600">Words</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-900">{blogScoring.structure.sectionCount}</div>
                              <div className="text-gray-600">Sections</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-900">{blogScoring.structure.imageCount}</div>
                              <div className="text-gray-600">Images</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-900">{blogScoring.structure.linkCount}</div>
                              <div className="text-gray-600">Links</div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-600">
                            <div>Long paragraphs: {blogScoring.structure.longParagraphsPercent}%</div>
                            <div>Long sentences: {blogScoring.structure.longSentencesPercent}%</div>
                          </div>
                        </div>

                        {/* Keyphrase Analysis */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Keyphrase Analysis</h4>
                          {blogScoring.keyphrase.keyphrase ? (
                            <div className="space-y-2">
                              <div className="bg-blue-50 p-2 rounded text-xs">
                                <div className="font-medium text-blue-900">"{blogScoring.keyphrase.keyphrase}"</div>
                                <div className="text-blue-700 mt-1">
                                  Density: {blogScoring.keyphrase.density}% • 
                                  Frequency: {blogScoring.keyphrase.frequency}
                                </div>
                              </div>
                              <div className="flex space-x-2 text-xs">
                                <span className={`px-2 py-1 rounded ${
                                  blogScoring.keyphrase.inTitle ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {blogScoring.keyphrase.inTitle ? '✓' : '✗'} Title
                                </span>
                                <span className={`px-2 py-1 rounded ${
                                  blogScoring.keyphrase.inIntroduction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {blogScoring.keyphrase.inIntroduction ? '✓' : '✗'} Intro
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">No significant keyphrase detected</div>
                          )}
                        </div>

                        {/* Score Breakdown */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</h4>
                          <div className="space-y-1 text-xs">
                            {Object.entries(blogScoring.scoring.breakdown).map(([key, score]: [string, any]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-12 bg-gray-200 rounded-full h-1">
                                    <div 
                                      className={`h-1 rounded-full ${
                                        score >= 8 ? 'bg-green-600' :
                                        score >= 6 ? 'bg-yellow-600' :
                                        'bg-red-600'
                                      }`}
                                      style={{ width: `${score * 10}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-medium text-gray-900 w-6 text-right">{score}/10</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="border-t pt-4">
                          <button
                            onClick={() => post && fetchBlogScoring(post._id)}
                            disabled={scoringLoading}
                            className="w-full px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {scoringLoading ? 'Analyzing...' : 'Refresh Score'}
                          </button>
                        </div>
                      </div>
                    ) : scoringLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 mb-3">Score analysis unavailable</p>
                        <button
                          onClick={() => post && fetchBlogScoring(post._id)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Analyze Blog
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Tags
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {tagsLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span className="text-sm text-gray-500">Generating AI tags...</span>
                        </div>
                      ) : aiTags.length > 0 ? (
                        aiTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags available</span>
                      )}
                    </div>
                  </div>

                  {/* Social Media Sharing Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share on Social Media
                    </h3>

                    <div className="space-y-3">
                      {/* Facebook */}
                      <button
                        onClick={initializeFacebookContent}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-blue-800">Facebook Post</div>
                            <div className="text-sm text-blue-600">Generate optimized content</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>

                      {/* X (Twitter) */}
                      <button
                        onClick={initializeTwitterContent}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">X Post</div>
                            <div className="text-sm text-gray-600">Tweet to your followers</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>

                      {/* LinkedIn */}
                      <button
                        onClick={initializeLinkedInContent}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-blue-800">LinkedIn Post</div>
                            <div className="text-sm text-blue-600">Share professionally</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>

                      {/* Instagram */}
                      <button
                        onClick={initializeInstagramContent}
                        className="w-full flex items-center justify-between p-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-pink-800">Instagram Post</div>
                            <div className="text-sm text-pink-600">Copy text for posting</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-pink-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>

                      {/* Email Promotion */}
                      <button
                        onClick={initializeEmailContent}
                        className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-green-800">Email Promotion</div>
                            <div className="text-sm text-green-600">Send via email</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href).then(() => {
                            // Show success notification
                            const notification = document.createElement('div');
                            notification.className = 'fixed top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                            notification.innerHTML = `
                              <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Link copied to clipboard!</span>
                              </div>
                            `;
                            document.body.appendChild(notification);
                            
                            setTimeout(() => {
                              notification.style.opacity = '0';
                              setTimeout(() => document.body.removeChild(notification), 300);
                            }, 2000);
                          });
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">Copy Link</div>
                            <div className="text-sm text-gray-600">Share anywhere</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <div className="font-medium mb-1">Sharing Tips:</div>
                          <ul className="text-blue-700 space-y-1">
                            <li>• For Instagram: Use the copied text with your image post</li>
                            <li>• Add relevant hashtags to increase reach</li>
                            <li>• Tag relevant accounts to expand your audience</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Stats
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reading Time</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.ceil(post.wordCount / 200)} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Content Type</span>
                        <span className="text-sm font-medium text-gray-900">
                          {post.contentAnalysis.contentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Images</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(() => {
                            const imageCount = (post.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
                            return imageCount > 0 ? `${imageCount} images` : 'No images';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Detail Level</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {post.detailLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* WordPress Publishing Modal */}
      {showWordPressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Publish to WordPress
                </h2>
                <button
                  onClick={() => setShowWordPressModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Check if WordPress is configured */}
              {wordpressConfig.url && wordpressConfig.username && wordpressConfig.password ? (
                // WordPress is configured - show quick publish interface
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">WordPress Configured</h3>
                          <p className="text-green-700 text-sm">Connected to: {wordpressConfig.url}</p>
                        </div>
                      </div>
                      <Link
                        href="/settings"
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Edit Settings
                      </Link>
                    </div>
                    
                    {/* What will be published info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What will be published:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center">
                          <svg className="w-3 h-3 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Blog post content and formatting
                        </li>
                        <li className="flex items-center">
                          <svg className="w-3 h-3 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          All images uploaded to WordPress media library
                        </li>
                        <li className="flex items-center">
                          <svg className="w-3 h-3 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          SEO metadata and tags
                        </li>
                        {(() => {
                          const imageCount = (post?.content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
                          if (imageCount > 0) {
                            return (
                              <li className="flex items-center text-green-700 font-medium">
                                <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {imageCount} image{imageCount !== 1 ? 's' : ''} will be uploaded automatically
                              </li>
                            );
                          }
                          return null;
                        })()}
                      </ul>
                    </div>
                    
                    {/* Test Connection Button */}
                    <button
                      onClick={testWordPressConnection}
                      disabled={testingConnection}
                      className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        connectionStatus === 'success'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                      }`}
                    >
                      {testingConnection ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          Testing Connection...
                        </>
                      ) : connectionStatus === 'success' ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Connection Verified!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                          </svg>
                          Test WordPress Connection
                        </>
                      )}
                    </button>

                    {/* Connection Status Messages */}
                    {connectionStatus === 'success' && (
                      <div className="mt-4 flex items-start p-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                        <svg className="w-5 h-5 mr-2 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-semibold">Perfect! WordPress connection verified.</div>
                          <div className="text-green-700 mt-1">Ready to publish your blog post to WordPress!</div>
                        </div>
                      </div>
                    )}

                    {connectionStatus === 'error' && connectionError && (
                      <div className="mt-4 flex items-start p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                        <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-semibold">Connection failed:</div>
                          <div className="text-red-700 mt-1">{connectionError}</div>
                          <Link
                            href="/settings"
                            className="inline-flex items-center mt-2 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Update configuration in Settings →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publishing Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-semibold text-sm">2</span>
                      </div>
                      Publishing Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Publish Status
                        </label>
                        <select
                          value={metaData.status}
                          onChange={(e) => setMetaData(prev => ({ ...prev, status: e.target.value as 'draft' | 'publish' }))}
                          className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                        >
                          <option value="draft">Draft (Preview Only)</option>
                          <option value="publish">Publish Immediately</option>
                        </select>
                        <p className="mt-2 text-sm text-gray-600">Choose whether to save as draft or publish immediately to your WordPress site</p>
                      </div>

                      <div>
                        <label htmlFor="meta-title" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Meta Title (Optional)
                        </label>
                        <input
                          type="text"
                          id="meta-title"
                          value={metaData.metaTitle}
                          onChange={(e) => setMetaData(prev => ({ ...prev, metaTitle: e.target.value }))}
                          placeholder={post?.title || "Leave empty to use post title"}
                          className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                        />
                        <p className="mt-2 text-sm text-gray-600">Custom title for SEO (will use post title if empty)</p>
                      </div>

                      <div>
                        <label htmlFor="meta-description" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          Meta Description (Optional)
                        </label>
                        <textarea
                          id="meta-description"
                          value={metaData.metaDescription}
                          onChange={(e) => setMetaData(prev => ({ ...prev, metaDescription: e.target.value }))}
                          placeholder="Leave empty to auto-generate from content"
                          rows={4}
                          className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200 placeholder-gray-500 resize-none"
                        />
                        <p className="mt-2 text-sm text-gray-600">Brief description for search engines (will auto-generate if empty)</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // WordPress is not configured - show setup prompt
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">WordPress Not Configured</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    To publish your blog posts to WordPress, you'll need to configure your WordPress site connection first.
                  </p>
                  
                  <div className="space-y-4">
                    <Link
                      href="/settings"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configure WordPress Settings
                    </Link>
                    
                    <p className="text-sm text-gray-500">
                      This will open the Settings page where you can safely configure your WordPress connection
                    </p>
                  </div>

                  <div className="mt-8 bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">What you'll need:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Your WordPress site URL</li>
                      <li>WordPress admin username</li>
                      <li>WordPress Application Password (we'll show you how to create one)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowWordPressModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={publishToWordPress}
                disabled={!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password || wordpressLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {wordpressLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Publish to WordPress
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medium Integration Modal */}
      {showMediumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Medium Integration</h3>
                    <p className="text-sm text-gray-600">Configure your Medium publishing settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMediumModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="medium-token" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  id="medium-token"
                  value={mediumConfig.accessToken}
                  onChange={(e) => setMediumConfig({...mediumConfig, accessToken: e.target.value})}
                  placeholder="Enter your Medium access token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your token from <a href="https://medium.com/me/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Medium Settings</a>
                </p>
              </div>

              {mediumPublications.length > 0 && (
                <div>
                  <label htmlFor="medium-publication" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication (Optional)
                  </label>
                  <select
                    id="medium-publication"
                    value={mediumConfig.publicationId}
                    onChange={(e) => setMediumConfig({...mediumConfig, publicationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Personal Account</option>
                    {mediumPublications.map(pub => (
                      <option key={pub.id} value={pub.id}>{pub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {mediumConnectionStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700 font-medium">Connected successfully!</span>
                  </div>
                </div>
              )}

              {mediumConnectionStatus === 'error' && mediumConnectionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{mediumConnectionError}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={testMediumConnection}
                disabled={testingMediumConnection || !mediumConfig.accessToken}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  testingMediumConnection || !mediumConfig.accessToken
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {testingMediumConnection ? 'Testing...' : 'Test Connection'}
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMediumModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={publishToMedium}
                  disabled={mediumLoading || mediumConnectionStatus !== 'success'}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    mediumLoading || mediumConnectionStatus !== 'success'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {mediumLoading ? 'Publishing...' : 'Publish to Medium'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Content Generation Modal */}
      {showFacebookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  Facebook Post Content Generator
                </h2>
                <button
                  onClick={() => setShowFacebookModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Auto-Generated Content</div>
                    <p className="text-blue-700">We've pre-filled the fields with optimized content from your blog post. Feel free to customize and edit as needed.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Facebook Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📝 Facebook Title
                    </label>
                    <input
                      type="text"
                      value={facebookContent.title}
                      onChange={(e) => setFacebookContent(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="Enter your Facebook post title..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Recommended: 40-80 characters</span>
                      <span className={`font-medium ${facebookContent.title.length <= 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {facebookContent.title.length}/80
                      </span>
                    </div>
                  </div>

                  {/* Facebook Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📄 Facebook Description
                    </label>
                    <textarea
                      value={facebookContent.description}
                      onChange={(e) => setFacebookContent(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Enter your Facebook post description..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Recommended: 125-150 characters</span>
                      <span className={`font-medium ${facebookContent.description.length <= 150 ? 'text-green-600' : 'text-red-600'}`}>
                        {facebookContent.description.length}/150
                      </span>
                    </div>
                  </div>

                  {/* Article Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📂 Article Section
                    </label>
                    <input
                      type="text"
                      value={facebookContent.articleSection}
                      onChange={(e) => setFacebookContent(prev => ({ ...prev, articleSection: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="e.g., Technology | Business"
                    />
                    <p className="text-xs text-gray-500 mt-1">Categorizes your content for better organization</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Image Source */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🖼️ Image Source
                    </label>
                    <input
                      type="url"
                      value={facebookContent.imageSource}
                      onChange={(e) => setFacebookContent(prev => ({ ...prev, imageSource: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL of the image to display with your post</p>
                    
                    {/* Image Preview */}
                    {facebookContent.imageSource && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={facebookContent.imageSource}
                            alt="Facebook post preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const imgElement = e.currentTarget as HTMLImageElement;
                              const nextElement = imgElement.nextElementSibling as HTMLElement;
                              imgElement.style.display = 'none';
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-100 items-center justify-center">
                            <span className="text-gray-500 text-sm">Invalid image URL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Article Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🏷️ Article Tags
                    </label>
                    <textarea
                      value={facebookContent.tags}
                      onChange={(e) => setFacebookContent(prev => ({ ...prev, tags: e.target.value }))}
                      rows={3}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="#technology #business #innovation #tips"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hashtags to increase post visibility and reach</p>
                  </div>

                  {/* Post Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Facebook Post Preview
                    </div>
                    <div className="space-y-2 text-sm">
                      {facebookContent.title && (
                        <div className="font-semibold text-gray-900">{facebookContent.title}</div>
                      )}
                      {facebookContent.description && (
                        <div className="text-gray-700">{facebookContent.description}</div>
                      )}
                      {facebookContent.articleSection && (
                        <div className="text-blue-600 text-xs">📂 {facebookContent.articleSection}</div>
                      )}
                      {facebookContent.tags && (
                        <div className="text-blue-600 text-xs">{facebookContent.tags}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowFacebookModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const fullContent = `${facebookContent.title}\n\n${facebookContent.description}\n\n${facebookContent.articleSection}\n\n${facebookContent.tags}\n\nRead more: ${window.location.href}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Facebook content copied to clipboard!</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  📋 Copy Content
                </button>
                
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const quote = encodeURIComponent(`${facebookContent.title}\n\n${facebookContent.description}\n\n${facebookContent.tags}`);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'width=600,height=400');
                    setShowFacebookModal(false);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Content Generation Modal */}
      {showInstagramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Instagram Content Generator</h2>
                    <p className="text-pink-100 text-sm">Create engaging Instagram posts with optimized content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstagramModal(false)}
                  className="text-white hover:text-pink-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Caption */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📝 Caption
                    </label>
                    <textarea
                      value={instagramContent.caption}
                      onChange={(e) => setInstagramContent(prev => ({ ...prev, caption: e.target.value }))}
                      rows={6}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Write your Instagram caption..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Recommended: 125-150 characters for first line</span>
                      <span className={`font-medium ${instagramContent.caption.length <= 2200 ? 'text-green-600' : 'text-red-600'}`}>
                        {instagramContent.caption.length}/2200
                      </span>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🏷️ Hashtags
                    </label>
                    <textarea
                      value={instagramContent.hashtags}
                      onChange={(e) => setInstagramContent(prev => ({ ...prev, hashtags: e.target.value }))}
                      rows={3}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="#technology #business #innovation #tips"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 5-10 relevant hashtags for better reach</p>
                  </div>

                  {/* Call to Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📢 Call to Action
                    </label>
                    <input
                      type="text"
                      value={instagramContent.cta}
                      onChange={(e) => setInstagramContent(prev => ({ ...prev, cta: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-100 focus:outline-none transition-all duration-200"
                      placeholder="Check out the full article in our bio! 🔗"
                    />
                    <p className="text-xs text-gray-500 mt-1">Encourage engagement and action</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Image Source */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🖼️ Image Source
                    </label>
                    <input
                      type="url"
                      value={instagramContent.imageSource}
                      onChange={(e) => setInstagramContent(prev => ({ ...prev, imageSource: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-100 focus:outline-none transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Square format (1:1) works best for Instagram</p>
                    
                    {/* Image Preview */}
                    {instagramContent.imageSource && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={instagramContent.imageSource}
                            alt="Instagram post preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const imgElement = e.currentTarget as HTMLImageElement;
                              const nextElement = imgElement.nextElementSibling as HTMLElement;
                              imgElement.style.display = 'none';
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-100 items-center justify-center">
                            <span className="text-gray-500 text-sm">Invalid image URL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mentions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      👥 Mentions
                    </label>
                    <input
                      type="text"
                      value={instagramContent.mentions}
                      onChange={(e) => setInstagramContent(prev => ({ ...prev, mentions: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-100 focus:outline-none transition-all duration-200"
                      placeholder="@videotoblog @partner"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tag relevant accounts to increase visibility</p>
                  </div>

                  {/* Post Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Instagram Post Preview
                    </div>
                    <div className="space-y-2 text-sm">
                      {instagramContent.caption && (
                        <div className="text-gray-900 whitespace-pre-wrap">{instagramContent.caption}</div>
                      )}
                      {instagramContent.hashtags && (
                        <div className="text-blue-600">{instagramContent.hashtags}</div>
                      )}
                      {instagramContent.mentions && (
                        <div className="text-purple-600">{instagramContent.mentions}</div>
                      )}
                      {instagramContent.cta && (
                        <div className="text-pink-600 font-medium">{instagramContent.cta}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowInstagramModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const fullContent = `${instagramContent.caption}\n\n${instagramContent.hashtags}\n\n${instagramContent.mentions}\n\n${instagramContent.cta}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Instagram content copied to clipboard!</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-pink-700 bg-pink-100 border border-pink-300 rounded-lg hover:bg-pink-200 transition-colors"
                >
                  📋 Copy Content
                </button>
                
                <button
                  onClick={() => {
                    const fullContent = `${instagramContent.caption}\n\n${instagramContent.hashtags}\n\n${instagramContent.mentions}\n\n${instagramContent.cta}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Content copied! Open Instagram to post.</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                    setShowInstagramModal(false);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 border border-transparent rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Copy for Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* X/Twitter Content Generation Modal */}
      {showTwitterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">X Post Generator</h2>
                    <p className="text-gray-300 text-sm">Create engaging posts for X (formerly Twitter)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTwitterModal(false)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Tweet Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📝 Tweet Text
                    </label>
                    <textarea
                      value={twitterContent.text}
                      onChange={(e) => setTwitterContent(prev => ({ ...prev, text: e.target.value }))}
                      rows={4}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="What's happening?"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Keep it concise and engaging</span>
                      <span className={`font-medium ${twitterContent.text.length <= 280 ? 'text-green-600' : 'text-red-600'}`}>
                        {twitterContent.text.length}/280
                      </span>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🏷️ Hashtags
                    </label>
                    <input
                      type="text"
                      value={twitterContent.hashtags}
                      onChange={(e) => setTwitterContent(prev => ({ ...prev, hashtags: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200"
                      placeholder="#technology #business #innovation"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 1-3 relevant hashtags for better discoverability</p>
                  </div>

                  {/* Mentions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      👥 Mentions
                    </label>
                    <input
                      type="text"
                      value={twitterContent.mentions}
                      onChange={(e) => setTwitterContent(prev => ({ ...prev, mentions: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200"
                      placeholder="@videotoblog @partner"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tag relevant accounts to increase engagement</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Thread Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🧵 Thread Content (Optional)
                    </label>
                    <textarea
                      value={twitterContent.thread}
                      onChange={(e) => setTwitterContent(prev => ({ ...prev, thread: e.target.value }))}
                      rows={8}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="1/3 First tweet...

2/3 Second tweet...

3/3 Final tweet..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Create a thread for longer content. Each tweet should be numbered.</p>
                  </div>

                  {/* Post Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      X Post Preview
                    </div>
                    <div className="space-y-2 text-sm">
                      {twitterContent.text && (
                        <div className="text-gray-900 whitespace-pre-wrap">{twitterContent.text}</div>
                      )}
                      {twitterContent.hashtags && (
                        <div className="text-blue-600">{twitterContent.hashtags}</div>
                      )}
                      {twitterContent.mentions && (
                        <div className="text-blue-600">{twitterContent.mentions}</div>
                      )}
                      {twitterContent.thread && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-600 mb-2">Thread Preview:</div>
                          <div className="text-gray-700 whitespace-pre-wrap text-xs">{twitterContent.thread}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">💡 X Tips</div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Keep tweets under 280 characters</li>
                      <li>• Use 1-3 hashtags maximum</li>
                      <li>• Ask questions to boost engagement</li>
                      <li>• Post during peak hours (9-10 AM, 7-9 PM)</li>
                      <li>• Include a call-to-action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowTwitterModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const fullContent = `${twitterContent.text}${twitterContent.hashtags ? `\n\n${twitterContent.hashtags}` : ''}${twitterContent.mentions ? `\n${twitterContent.mentions}` : ''}${twitterContent.thread ? `\n\nThread:\n${twitterContent.thread}` : ''}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>X content copied to clipboard!</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  📋 Copy Content
                </button>
                
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`${twitterContent.text}${twitterContent.hashtags ? ` ${twitterContent.hashtags}` : ''}${twitterContent.mentions ? ` ${twitterContent.mentions}` : ''}`);
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
                    setShowTwitterModal(false);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Post on X
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Content Generation Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">LinkedIn Post Generator</h2>
                    <p className="text-blue-100 text-sm">Create professional posts for your LinkedIn network</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLinkedInModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Post Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📝 Post Title/Hook
                    </label>
                    <input
                      type="text"
                      value={linkedInContent.title}
                      onChange={(e) => setLinkedInContent(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="Your compelling headline..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Keep it engaging and professional</span>
                      <span className={`font-medium ${linkedInContent.title.length <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {linkedInContent.title.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Post Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📄 Post Description
                    </label>
                    <textarea
                      value={linkedInContent.description}
                      onChange={(e) => setLinkedInContent(prev => ({ ...prev, description: e.target.value }))}
                      rows={8}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Share your professional insights, key takeaways, and thoughts..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Aim for 150-300 words for optimal engagement</span>
                      <span className={`font-medium ${linkedInContent.description.length <= 3000 ? 'text-green-600' : 'text-red-600'}`}>
                        {linkedInContent.description.length}/3000
                      </span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📢 Call to Action
                    </label>
                    <input
                      type="text"
                      value={linkedInContent.cta}
                      onChange={(e) => setLinkedInContent(prev => ({ ...prev, cta: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="What are your thoughts? Share your experience in the comments!"
                    />
                    <p className="text-xs text-gray-500 mt-1">Encourage professional discussion and engagement</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Image Source */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🖼️ Image Source
                    </label>
                    <input
                      type="url"
                      value={linkedInContent.imageSource}
                      onChange={(e) => setLinkedInContent(prev => ({ ...prev, imageSource: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                      placeholder="https://example.com/professional-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Professional images perform better on LinkedIn</p>
                    
                    {/* Image Preview */}
                    {linkedInContent.imageSource && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={linkedInContent.imageSource}
                            alt="LinkedIn post preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const imgElement = e.currentTarget as HTMLImageElement;
                              const nextElement = imgElement.nextElementSibling as HTMLElement;
                              imgElement.style.display = 'none';
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-100 items-center justify-center">
                            <span className="text-gray-500 text-sm">Invalid image URL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🏷️ Professional Tags
                    </label>
                    <textarea
                      value={linkedInContent.tags}
                      onChange={(e) => setLinkedInContent(prev => ({ ...prev, tags: e.target.value }))}
                      rows={3}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="#leadership #technology #business #innovation #professional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 3-5 professional hashtags relevant to your industry</p>
                  </div>

                  {/* Post Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      LinkedIn Post Preview
                    </div>
                    <div className="space-y-3 text-sm">
                      {linkedInContent.title && (
                        <div className="font-semibold text-gray-900">{linkedInContent.title}</div>
                      )}
                      {linkedInContent.description && (
                        <div className="text-gray-700 whitespace-pre-wrap">{linkedInContent.description}</div>
                      )}
                      {linkedInContent.cta && (
                        <div className="text-blue-700 font-medium">{linkedInContent.cta}</div>
                      )}
                      {linkedInContent.tags && (
                        <div className="text-blue-600">{linkedInContent.tags}</div>
                      )}
                    </div>
                  </div>

                  {/* LinkedIn Tips */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">💡 LinkedIn Best Practices</div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Start with a compelling hook or question</li>
                      <li>• Share personal insights and experiences</li>
                      <li>• Use line breaks for better readability</li>
                      <li>• Tag relevant people or companies</li>
                      <li>• Post during business hours (8 AM - 6 PM)</li>
                      <li>• Encourage discussion with questions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowLinkedInModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const fullContent = `${linkedInContent.title}\n\n${linkedInContent.description}\n\n${linkedInContent.cta}\n\n${linkedInContent.tags}\n\nRead the full article: ${window.location.href}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>LinkedIn content copied to clipboard!</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  📋 Copy Content
                </button>
                
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(linkedInContent.title || post?.title || '');
                    const summary = encodeURIComponent(linkedInContent.description || '');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank', 'width=600,height=400');
                    setShowLinkedInModal(false);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-lg hover:bg-blue-800 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Share on LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Promotion Content Generation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-green-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Email Promotion Generator</h2>
                    <p className="text-green-100 text-sm">Create professional email campaigns to share your content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Email Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📧 Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailContent.subject}
                      onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                      placeholder="Compelling subject line that gets opened..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Keep it under 50 characters for mobile</span>
                      <span className={`font-medium ${emailContent.subject.length <= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {emailContent.subject.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Email Preheader */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      👁️ Preheader Text
                    </label>
                    <input
                      type="text"
                      value={emailContent.preheader}
                      onChange={(e) => setEmailContent(prev => ({ ...prev, preheader: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                      placeholder="Preview text that appears after subject line..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Appears in email preview (90-100 chars)</span>
                      <span className={`font-medium ${emailContent.preheader.length <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {emailContent.preheader.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📝 Email Content
                    </label>
                    <textarea
                      value={emailContent.content}
                      onChange={(e) => setEmailContent(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200 resize-none"
                      placeholder="Write your email content here..."
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Keep it concise and valuable</span>
                      <span className="text-gray-500">{emailContent.content.length} characters</span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎯 Call to Action
                    </label>
                    <input
                      type="text"
                      value={emailContent.cta}
                      onChange={(e) => setEmailContent(prev => ({ ...prev, cta: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                      placeholder="Read Full Article"
                    />
                    <p className="text-xs text-gray-500 mt-1">Clear action you want readers to take</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🖼️ Featured Image
                    </label>
                    <input
                      type="url"
                      value={emailContent.imageSource}
                      onChange={(e) => setEmailContent(prev => ({ ...prev, imageSource: e.target.value }))}
                      className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-600 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                      placeholder="https://example.com/email-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">High-quality image for email header (600px width recommended)</p>
                    
                    {/* Image Preview */}
                    {emailContent.imageSource && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Preview:</div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={emailContent.imageSource}
                            alt="Email featured image preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const imgElement = e.currentTarget as HTMLImageElement;
                              const nextElement = imgElement.nextElementSibling as HTMLElement;
                              imgElement.style.display = 'none';
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-100 items-center justify-center">
                            <span className="text-gray-500 text-sm">Invalid image URL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Email Preview
                    </div>
                    
                    {/* Email Header */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                      <div className="text-xs text-gray-500 mb-1">Subject:</div>
                      <div className="font-semibold text-sm text-gray-900">{emailContent.subject || 'Your Subject Line'}</div>
                      {emailContent.preheader && (
                        <>
                          <div className="text-xs text-gray-500 mt-2 mb-1">Preheader:</div>
                          <div className="text-xs text-gray-600">{emailContent.preheader}</div>
                        </>
                      )}
                    </div>

                    {/* Email Body Preview */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                      {emailContent.content && (
                        <div className="text-xs text-gray-700 whitespace-pre-wrap">{emailContent.content}</div>
                      )}
                      {emailContent.cta && (
                        <div className="pt-2">
                          <span className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded">{emailContent.cta}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Marketing Tips */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-2">💡 Email Marketing Best Practices</div>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Write compelling subject lines (under 50 chars)</li>
                      <li>• Personalize the greeting when possible</li>
                      <li>• Keep content concise and scannable</li>
                      <li>• Use a clear, single call-to-action</li>
                      <li>• Test your emails before sending</li>
                      <li>• Optimize for mobile devices</li>
                      <li>• Include your contact information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const fullContent = `Subject: ${emailContent.subject}\n\nPreheader: ${emailContent.preheader}\n\n${emailContent.content}\n\n${emailContent.cta}: ${window.location.href}`;
                    navigator.clipboard.writeText(fullContent).then(() => {
                      // Show success notification
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Email content copied to clipboard!</span>
                        </div>
                      `;
                      document.body.appendChild(notification);
                      
                      setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                      }, 3000);
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors"
                >
                  📋 Copy Email Content
                </button>
                
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(emailContent.subject || `Check out: ${post?.title}`);
                    const body = encodeURIComponent(emailContent.content || '');
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
                    setShowEmailModal(false);
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Platform Selection Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Publish Your Blog Post</h2>
                    <p className="text-gray-600 mt-1">Choose where you'd like to publish your content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Blog Post Preview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{post?.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1 space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post?.wordCount.toLocaleString()} words
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {Math.ceil((post?.wordCount || 0) / 200)} min read
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Platform Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* WordPress Platform */}
                <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setShowPublishModal(false);
                       setShowWordPressModal(true);
                     }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.109m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.135-2.85-.135-.584-.031-.661.854-.067.899 0 0 .584.075 1.207.105l1.795 4.913-2.52 7.56L5.175 9.295c.42-.03.81-.105.81-.105.582-.075.516-.93-.065-.899 0 0-1.756.135-2.88.135C2.775 8.426 2.616 8.416 2.414 8.398A9.968 9.968 0 0 1 12 2c2.769 0 5.29 1.12 7.109 2.933-.045-.003-.087-.009-.138-.009-1.065 0-1.81.93-1.81 1.927 0 .9.517 1.65 1.067 2.55.42.75.914 1.717.914 3.113 0 .966-.37 2.085-.855 3.641L15.85 19.95a10.016 10.016 0 0 0 3.105-7.363c0-3.452-1.725-6.497-4.35-8.29l2.883 8.531zM12 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">Popular</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress</h3>
                  <p className="text-sm text-gray-600 mb-4">The world's most popular content management system. Perfect for blogs and professional websites.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      SEO optimized
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Full control over content
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Custom domains
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-medium text-blue-800">Best for:</div>
                    <div className="text-xs text-blue-700 mt-1">Professional blogs, business websites, full customization</div>
                  </div>
                </div>

                {/* Medium Platform */}
                <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setShowPublishModal(false);
                       setShowMediumModal(true);
                     }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">Viral</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Medium</h3>
                  <p className="text-sm text-gray-600 mb-4">A premium publishing platform with built-in audience discovery and social features.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Millions of active readers
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Smart content distribution
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Publication networks
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-medium text-green-800">Best for:</div>
                    <div className="text-xs text-green-700 mt-1">Thought leadership, viral content, reaching new audiences</div>
                  </div>
                </div>

                {/* Blogger Platform */}
                <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setShowPublishModal(false);
                       setShowBloggerModal(true);
                     }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full font-medium">Free</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Blogger</h3>
                  <p className="text-sm text-gray-600 mb-4">Google's free blogging platform with easy setup and reliable hosting.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completely free hosting
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Google integration
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Easy to get started
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xs font-medium text-orange-800">Best for:</div>
                    <div className="text-xs text-orange-700 mt-1">Beginners, hobby blogs, cost-effective publishing</div>
                  </div>
                </div>

                {/* Ghost Platform */}
                <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setShowPublishModal(false);
                       alert('Ghost integration is now available! Configure it in Settings first.');
                     }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full font-medium">Pro</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Ghost</h3>
                  <p className="text-sm text-gray-600 mb-4">Modern publishing platform built for professional content creators and publishers.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Professional publishing
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Built-in SEO optimization
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Newsletter & membership features
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-medium text-gray-800">Best for:</div>
                    <div className="text-xs text-gray-700 mt-1">Professional blogs, newsletters, membership sites</div>
                  </div>
                </div>

                {/* Webflow Platform */}
                <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => {
                       setShowPublishModal(false);
                       alert('Webflow integration is now available! Configure it in Settings first.');
                     }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">Design</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Webflow</h3>
                  <p className="text-sm text-gray-600 mb-4">Visual web design platform with powerful CMS for beautiful, responsive websites.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Visual design editor
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Responsive layouts
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Fast hosting & CDN
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xs font-medium text-purple-800">Best for:</div>
                    <div className="text-xs text-purple-700 mt-1">Design-focused sites, portfolios, visual branding</div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coming Soon
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'LinkedIn', color: 'blue', icon: '💼' },
                    { name: 'Dev.to', color: 'gray', icon: '👨‍💻' },
                    { name: 'Hashnode', color: 'blue', icon: '#' }
                  ].map((platform) => (
                    <div key={platform.name} className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                      <div className="text-center">
                        <div className="text-2xl mb-2">{platform.icon}</div>
                        <div className="font-medium text-gray-600">{platform.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Coming Soon</div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Soon</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Choose a platform to get started. You can always publish to multiple platforms later.
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 