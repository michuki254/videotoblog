'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import DashboardLayout from '../components/DashboardLayout'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

interface WordPressConfig {
  url: string
  username: string
  password: string
}

interface MediumConfig {
  accessToken: string
  publicationId: string
  authorId: string
}

interface BloggerConfig {
  apiKey: string
  blogId: string
  blogName: string
  blogUrl: string
}

interface GhostConfig {
  url: string
  adminApiKey: string
  apiUrl: string
  blogName: string
}

interface WebflowConfig {
  siteId: string
  apiToken: string
  collectionId: string
  siteName: string
  collectionName: string
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig>({
    url: '',
    username: '',
    password: ''
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [savedConfig, setSavedConfig] = useState(false)
  const [activeTab, setActiveTab] = useState('wordpress')
  const [showWordPressForm, setShowWordPressForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showMediumToken, setShowMediumToken] = useState(false)
  const [showBloggerApiKey, setShowBloggerApiKey] = useState(false)
  const [showGhostApiKey, setShowGhostApiKey] = useState(false)
  const [showWebflowApiToken, setShowWebflowApiToken] = useState(false)
  const [showInstructions, setShowInstructions] = useState<string | null>(null)

  // Medium Integration State
  const [mediumConfig, setMediumConfig] = useState<MediumConfig>({
    accessToken: '',
    publicationId: '',
    authorId: ''
  })
  const [testingMediumConnection, setTestingMediumConnection] = useState(false)
  const [mediumConnectionStatus, setMediumConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mediumConnectionError, setMediumConnectionError] = useState<string | null>(null)
  const [savedMediumConfig, setSavedMediumConfig] = useState(false)
  const [showMediumForm, setShowMediumForm] = useState(false)
  const [mediumPublications, setMediumPublications] = useState<Array<{id: string, name: string}>>([])

  // Blogger Integration State
  const [bloggerConfig, setBloggerConfig] = useState<BloggerConfig>({
    apiKey: '',
    blogId: '',
    blogName: '',
    blogUrl: ''
  })
  const [testingBloggerConnection, setTestingBloggerConnection] = useState(false)
  const [bloggerConnectionStatus, setBloggerConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [bloggerConnectionError, setBloggerConnectionError] = useState<string | null>(null)
  const [savedBloggerConfig, setSavedBloggerConfig] = useState(false)
  const [showBloggerForm, setShowBloggerForm] = useState(false)

  // Ghost Integration State
  const [ghostConfig, setGhostConfig] = useState<GhostConfig>({
    url: '',
    adminApiKey: '',
    apiUrl: '',
    blogName: ''
  })
  const [testingGhostConnection, setTestingGhostConnection] = useState(false)
  const [ghostConnectionStatus, setGhostConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [ghostConnectionError, setGhostConnectionError] = useState<string | null>(null)
  const [savedGhostConfig, setSavedGhostConfig] = useState(false)
  const [showGhostForm, setShowGhostForm] = useState(false)

  // Webflow Integration State
  const [webflowConfig, setWebflowConfig] = useState<WebflowConfig>({
    siteId: '',
    apiToken: '',
    collectionId: '',
    siteName: '',
    collectionName: ''
  })
  const [testingWebflowConnection, setTestingWebflowConnection] = useState(false)
  const [webflowConnectionStatus, setWebflowConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [webflowConnectionError, setWebflowConnectionError] = useState<string | null>(null)
  const [savedWebflowConfig, setSavedWebflowConfig] = useState(false)
  const [showWebflowForm, setShowWebflowForm] = useState(false)

  // Load saved configuration from database
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            const { wordpress, medium, blogger, ghost, webflow } = data.settings;
            
            // Load WordPress configuration
            if (wordpress) {
              setWordpressConfig({
                url: wordpress.url || '',
                username: wordpress.username || '',
                password: wordpress.password || ''
              });
              setSavedConfig(!!wordpress.url && !!wordpress.username && !!wordpress.password);
              if (wordpress.connectionStatus === 'connected') {
                setConnectionStatus('success');
              }
            }

            // Load Medium configuration
            if (medium) {
              setMediumConfig({
                accessToken: medium.accessToken || '',
                publicationId: medium.publicationId || '',
                authorId: medium.authorId || ''
              });
              setSavedMediumConfig(!!medium.accessToken);
              if (medium.connectionStatus === 'success') {
                setMediumConnectionStatus('success');
              }
            }

            // Load Blogger configuration
            if (blogger) {
              setBloggerConfig({
                apiKey: blogger.apiKey || '',
                blogId: blogger.blogId || '',
                blogName: blogger.blogName || '',
                blogUrl: blogger.blogUrl || ''
              });
              setSavedBloggerConfig(!!blogger.apiKey && !!blogger.blogId);
              if (blogger.connectionStatus === 'success') {
                setBloggerConnectionStatus('success');
              }
            }

            // Load Ghost configuration
            if (ghost) {
              setGhostConfig({
                url: ghost.url || '',
                adminApiKey: ghost.adminApiKey || '',
                apiUrl: ghost.apiUrl || '',
                blogName: ghost.blogName || ''
              });
              setSavedGhostConfig(!!ghost.url && !!ghost.adminApiKey);
              if (ghost.connectionStatus === 'success') {
                setGhostConnectionStatus('success');
              }
            }

            // Load Webflow configuration
            if (webflow) {
              setWebflowConfig({
                siteId: webflow.siteId || '',
                apiToken: webflow.apiToken || '',
                collectionId: webflow.collectionId || '',
                siteName: webflow.siteName || '',
                collectionName: webflow.collectionName || ''
              });
              setSavedWebflowConfig(!!webflow.siteId && !!webflow.apiToken);
              if (webflow.connectionStatus === 'success') {
                setWebflowConnectionStatus('success');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (isLoaded && user) {
      loadUserSettings();
    }
  }, [isLoaded, user]);

  // WordPress functions
  const saveWordPressConfig = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpress: {
            url: wordpressConfig.url,
            username: wordpressConfig.username,
            password: wordpressConfig.password,
            connectionStatus: 'idle'
          }
        }),
      });

      if (response.ok) {
        setSavedConfig(true);
        setShowWordPressForm(false);
        setConnectionStatus('idle');
        setConnectionError(null);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Settings Saved!</div>
              <div class="text-sm text-green-100">WordPress configuration has been saved successfully.</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error saving WordPress configuration:', error);
    }
  };

  const testWordPressConnection = async () => {
    if (!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password) {
      setConnectionError('Please fill in all fields');
      setConnectionStatus('error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionError(null);

    try {
      const response = await fetch('/api/wordpress/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: wordpressConfig.url,
          username: wordpressConfig.username,
          password: wordpressConfig.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus('success');
      } else {
        setConnectionError(data.error || 'Connection failed');
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionError('Network error occurred');
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  // Medium functions
  const saveMediumConfig = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medium: {
            accessToken: mediumConfig.accessToken,
            publicationId: mediumConfig.publicationId,
            authorId: mediumConfig.authorId,
            connectionStatus: 'idle'
          }
        }),
      });

      if (response.ok) {
        setSavedMediumConfig(true);
        setShowMediumForm(false);
        setMediumConnectionStatus('idle');
        setMediumConnectionError(null);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Settings Saved!</div>
              <div class="text-sm text-green-100">Medium configuration has been saved successfully.</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error saving Medium configuration:', error);
    }
  };

  const testMediumConnection = async () => {
    if (!mediumConfig.accessToken) {
      setMediumConnectionError('Please provide an access token');
      setMediumConnectionStatus('error');
      return;
    }

    setTestingMediumConnection(true);
    setMediumConnectionStatus('idle');
    setMediumConnectionError(null);

    try {
      const response = await fetch('/api/medium/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: mediumConfig.accessToken
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMediumConnectionStatus('success');
        if (data.user) {
          setMediumConfig(prev => ({ ...prev, authorId: data.user.id }));
        }
        if (data.publications && data.publications.length > 0) {
          setMediumPublications(data.publications);
        }
      } else {
        setMediumConnectionError(data.error || 'Connection failed');
        setMediumConnectionStatus('error');
      }
    } catch (error) {
      setMediumConnectionError('Network error occurred');
      setMediumConnectionStatus('error');
    } finally {
      setTestingMediumConnection(false);
    }
  };

  // Blogger functions
  const saveBloggerConfig = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogger: {
            apiKey: bloggerConfig.apiKey,
            blogId: bloggerConfig.blogId,
            blogName: bloggerConfig.blogName,
            blogUrl: bloggerConfig.blogUrl,
            connectionStatus: 'idle'
          }
        }),
      });

      if (response.ok) {
        setSavedBloggerConfig(true);
        setShowBloggerForm(false);
        setBloggerConnectionStatus('idle');
        setBloggerConnectionError(null);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Settings Saved!</div>
              <div class="text-sm text-green-100">Blogger configuration has been saved successfully.</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error saving Blogger configuration:', error);
    }
  };

  const testBloggerConnection = async () => {
    if (!bloggerConfig.apiKey || !bloggerConfig.blogId) {
      setBloggerConnectionError('Please provide both API Key and Blog ID');
      setBloggerConnectionStatus('error');
      return;
    }

    setTestingBloggerConnection(true);
    setBloggerConnectionStatus('idle');
    setBloggerConnectionError(null);

    try {
      const response = await fetch('/api/blogger/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: bloggerConfig.apiKey,
          blogId: bloggerConfig.blogId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBloggerConnectionStatus('success');
        if (data.blog) {
          setBloggerConfig(prev => ({ 
            ...prev, 
            blogName: data.blog.name,
            blogUrl: data.blog.url
          }));
        }
      } else {
        setBloggerConnectionError(data.error || 'Connection failed');
        setBloggerConnectionStatus('error');
      }
    } catch (error) {
      setBloggerConnectionError('Network error occurred');
      setBloggerConnectionStatus('error');
    } finally {
      setTestingBloggerConnection(false);
    }
  };

  // Ghost functions
  const saveGhostConfig = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ghost: {
            url: ghostConfig.url,
            adminApiKey: ghostConfig.adminApiKey,
            apiUrl: ghostConfig.apiUrl,
            blogName: ghostConfig.blogName,
            connectionStatus: 'idle'
          }
        }),
      });

      if (response.ok) {
        setSavedGhostConfig(true);
        setShowGhostForm(false);
        setGhostConnectionStatus('idle');
        setGhostConnectionError(null);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Settings Saved!</div>
              <div class="text-sm text-green-100">Ghost configuration has been saved successfully.</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error saving Ghost configuration:', error);
    }
  };

  const testGhostConnection = async () => {
    if (!ghostConfig.url || !ghostConfig.adminApiKey) {
      setGhostConnectionError('Please provide both Ghost URL and Admin API Key');
      setGhostConnectionStatus('error');
      return;
    }

    setTestingGhostConnection(true);
    setGhostConnectionStatus('idle');
    setGhostConnectionError(null);

    try {
      const response = await fetch('/api/ghost/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: ghostConfig.url,
          adminApiKey: ghostConfig.adminApiKey
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGhostConnectionStatus('success');
        if (data.site) {
          setGhostConfig(prev => ({ 
            ...prev, 
            blogName: data.site.title,
            apiUrl: data.site.url
          }));
        }
      } else {
        setGhostConnectionError(data.error || 'Connection failed');
        setGhostConnectionStatus('error');
      }
    } catch (error) {
      setGhostConnectionError('Network error occurred');
      setGhostConnectionStatus('error');
    } finally {
      setTestingGhostConnection(false);
    }
  };

  // Webflow functions
  const saveWebflowConfig = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webflow: {
            siteId: webflowConfig.siteId,
            apiToken: webflowConfig.apiToken,
            collectionId: webflowConfig.collectionId,
            siteName: webflowConfig.siteName,
            collectionName: webflowConfig.collectionName,
            connectionStatus: 'idle'
          }
        }),
      });

      if (response.ok) {
        setSavedWebflowConfig(true);
        setShowWebflowForm(false);
        setWebflowConnectionStatus('idle');
        setWebflowConnectionError(null);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Settings Saved!</div>
              <div class="text-sm text-green-100">Webflow configuration has been saved successfully.</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error saving Webflow configuration:', error);
    }
  };

  const testWebflowConnection = async () => {
    if (!webflowConfig.siteId || !webflowConfig.apiToken) {
      setWebflowConnectionError('Please provide both Site ID and API Token');
      setWebflowConnectionStatus('error');
      return;
    }

    setTestingWebflowConnection(true);
    setWebflowConnectionStatus('idle');
    setWebflowConnectionError(null);

    try {
      const response = await fetch('/api/webflow/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: webflowConfig.siteId,
          apiToken: webflowConfig.apiToken,
          collectionId: webflowConfig.collectionId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setWebflowConnectionStatus('success');
        if (data.site) {
          setWebflowConfig(prev => ({ 
            ...prev, 
            siteName: data.site.name
          }));
        }
        if (data.collection) {
          setWebflowConfig(prev => ({ 
            ...prev, 
            collectionName: data.collection.name
          }));
        }
      } else {
        setWebflowConnectionError(data.error || 'Connection failed');
        setWebflowConnectionStatus('error');
      }
    } catch (error) {
      setWebflowConnectionError('Network error occurred');
      setWebflowConnectionStatus('error');
    } finally {
      setTestingWebflowConnection(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'wordpress', name: 'WordPress', configured: savedConfig },
    { id: 'medium', name: 'Medium', configured: savedMediumConfig },
    { id: 'blogger', name: 'Blogger', configured: savedBloggerConfig },
    { id: 'ghost', name: 'Ghost', configured: savedGhostConfig },
    { id: 'webflow', name: 'Webflow', configured: savedWebflowConfig }
  ];

  // Instructions for each platform
  const instructions = {
    wordpress: {
      title: 'How to Configure WordPress',
      steps: [
        'Log in to your WordPress admin dashboard',
        'Go to Users → Profile',
        'Scroll down to "Application Passwords"',
        'Enter a name for this application (e.g., "VideotoBlog")',
        'Click "Add New Application Password"',
        'Copy the generated password (you won\'t be able to see it again)',
        'Enter your WordPress URL, username, and the application password here'
      ]
    },
    medium: {
      title: 'How to Configure Medium',
      steps: [
        'Go to Medium.com and sign in',
        'Click on your profile picture → Settings',
        'Go to "Integration tokens"',
        'Enter a description for your token',
        'Click "Get integration token"',
        'Copy the token and paste it here',
        'The publication ID is optional - leave blank to post to your personal stories'
      ]
    },
    blogger: {
      title: 'How to Configure Blogger',
      steps: [
        'Go to Google Cloud Console (console.cloud.google.com)',
        'Create a new project or select an existing one',
        'Navigate to "APIs & Services" → "Library"',
        'Search for "Blogger API v3" and enable it',
        'Go to "APIs & Services" → "Credentials"',
        'Click "Create Credentials" → "API Key"',
        'Copy the API key (you may want to restrict it to Blogger API)',
        'Go to your Blogger dashboard (blogger.com)',
        'Select your blog and look at the URL',
        'Copy the Blog ID from the URL (e.g., blogID=1234567890)',
        'Enter both the API Key and Blog ID here'
      ]
    },
    ghost: {
      title: 'How to Configure Ghost',
      steps: [
        'Log in to your Ghost admin panel (yourdomain.com/ghost)',
        'Navigate to Settings → Integrations',
        'Click "Add custom integration" button',
        'Give it a name like "VideotoBlog"',
        'Click "Create" and you\'ll see the integration details',
        'Copy the "Admin API Key" (it looks like: 1234567890abcdef:1234567890abcdef...)',
        'Enter your Ghost site URL (e.g., https://yourblog.com)',
        'Paste the Admin API Key here',
        'Test the connection to verify everything works'
      ]
    },
    webflow: {
      title: 'How to Configure Webflow',
      steps: [
        'Log in to your Webflow account',
        'Go to Project Settings → Integrations',
        'Generate an API token',
        'Find your Site ID in the URL',
        'Go to CMS → Collections',
        'Note the Collection ID for your blog posts',
        'Enter all the information here'
      ]
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access settings.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-md text-white bg-[#FF385C] hover:bg-[#E0314F]"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="pb-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Premium Header */}
            <div className="mb-8">
              <nav className="flex items-center space-x-2 text-sm mb-8">
                <Link
                  href="/dashboard"
                  className="flex items-center text-gray-500 hover:text-[#FF385C] transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Dashboard
                </Link>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </span>
            </nav>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Premium Hero Section */}
              <div className="bg-[#FF385C] rounded-xl shadow-lg p-4 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold">Integration Hub</h1>
                      <p className="text-white/80 text-xs sm:text-sm hidden sm:block">Connect your blogging platforms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/80 hidden sm:block">Logged in as</div>
                    <div className="text-white text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                      {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>

                {/* Compact Stats */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded p-2 shadow-sm">
                    <div className="text-lg font-bold">{[savedConfig, savedMediumConfig, savedBloggerConfig, savedGhostConfig, savedWebflowConfig].filter(Boolean).length}</div>
                    <div className="text-[10px] text-white/80">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded p-2 shadow-sm">
                    <div className="text-lg font-bold">5</div>
                    <div className="text-[10px] text-white/80">Platforms</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded p-2 shadow-sm">
                    <div className="text-lg font-bold">∞</div>
                    <div className="text-[10px] text-white/80">Posts</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded p-2 shadow-sm">
                    <div className="text-lg font-bold">API</div>
                    <div className="text-[10px] text-white/80">Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Active Integrations Card */}
          <div className="mb-4 bg-[#FAFAFA] rounded-xl p-4 shadow-lg">
            <div className="flex items-center mb-3">
              <div className="bg-[#00A699] rounded-lg p-2 mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#484848]">Active Integrations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedConfig && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00A699] text-white shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  WordPress: {wordpressConfig.url}
                </span>
              )}
              {savedMediumConfig && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00A699] text-white shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Medium: Connected
                </span>
              )}
              {savedBloggerConfig && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FC642D] text-white shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Blogger: {bloggerConfig.blogName || 'Connected'}
                </span>
              )}
              {savedGhostConfig && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#484848] text-white shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Ghost: {ghostConfig.blogName || ghostConfig.url}
                </span>
              )}
              {savedWebflowConfig && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00A699] text-white shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Webflow: {webflowConfig.siteName || 'Connected'}
                </span>
              )}
              {!savedConfig && !savedMediumConfig && !savedBloggerConfig && !savedGhostConfig && !savedWebflowConfig && (
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs">No integrations configured yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-gray-100 p-1">
              <nav className="flex overflow-x-auto bg-white rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-white bg-[#FF385C] shadow-lg rounded-xl mx-1'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl mx-1'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{tab.name}</span>
                      {tab.configured && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Premium Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl shadow-lg">
            {activeTab === 'wordpress' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">WordPress Integration</h2>
                    <p className="mt-1 text-sm text-gray-600">Connect your WordPress blog to automatically publish content</p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(showInstructions === 'wordpress' ? null : 'wordpress')}
                    className="text-[#FF385C] hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                    How to Configure
                  </button>
                </div>

                {/* Instructions */}
                {showInstructions === 'wordpress' && (
                  <div className="mb-6 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">{instructions.wordpress.title}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      {instructions.wordpress.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Current Configuration Display */}
                {savedConfig && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">WordPress URL:</span>
                        <span className="text-sm font-medium text-gray-900">{wordpressConfig.url}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Username:</span>
                        <span className="text-sm font-medium text-gray-900">{wordpressConfig.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connection Status:</span>
                        <span className={`inline-flex items-center text-sm ${
                          connectionStatus === 'success' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {connectionStatus === 'success' ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not tested'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div>
                  <button
                    onClick={() => setShowWordPressForm(!showWordPressForm)}
                    className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showWordPressForm ? 'Hide Form' : savedConfig ? 'Update Configuration' : 'Add Configuration'}
                  </button>

                  {showWordPressForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="wp-url" className="block text-sm font-medium text-gray-700">
                          WordPress URL
                        </label>
                        <input
                          type="url"
                          id="wp-url"
                          value={wordpressConfig.url}
                          onChange={(e) => setWordpressConfig({ ...wordpressConfig, url: e.target.value })}
                          placeholder="https://yourblog.wordpress.com"
                          className="mt-1 block w-full px-3 py-2 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">The full URL of your WordPress site</p>
                      </div>

                      <div>
                        <label htmlFor="wp-username" className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          id="wp-username"
                          value={wordpressConfig.username}
                          onChange={(e) => setWordpressConfig({ ...wordpressConfig, username: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Your WordPress admin username</p>
                      </div>

                      <div>
                        <label htmlFor="wp-password" className="block text-sm font-medium text-gray-700">
                          Application Password
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="wp-password"
                            value={wordpressConfig.password}
                            onChange={(e) => setWordpressConfig({ ...wordpressConfig, password: e.target.value })}
                            className="block w-full px-3 py-2 pr-10 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Generated from WordPress admin panel</p>
                      </div>

                      {connectionStatus === 'error' && connectionError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                              <p className="mt-1 text-sm text-red-700">{connectionError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={testWordPressConnection}
                          disabled={testingConnection}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {testingConnection ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={saveWordPressConfig}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E0314F]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medium Integration */}
            {activeTab === 'medium' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Medium Integration</h2>
                    <p className="mt-1 text-sm text-gray-600">Connect your Medium account to publish stories and articles</p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(showInstructions === 'medium' ? null : 'medium')}
                    className="text-[#FF385C] hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                    How to Configure
                  </button>
                </div>

                {/* Instructions */}
                {showInstructions === 'medium' && (
                  <div className="mb-6 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">{instructions.medium.title}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      {instructions.medium.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Current Configuration Display */}
                {savedMediumConfig && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Access Token:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {mediumConfig.accessToken ? '••••••••' + mediumConfig.accessToken.slice(-4) : 'Not set'}
                        </span>
                      </div>
                      {mediumConfig.authorId && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Author ID:</span>
                          <span className="text-sm font-medium text-gray-900">{mediumConfig.authorId}</span>
                        </div>
                      )}
                      {mediumConfig.publicationId && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Publication ID:</span>
                          <span className="text-sm font-medium text-gray-900">{mediumConfig.publicationId}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connection Status:</span>
                        <span className={`inline-flex items-center text-sm ${
                          mediumConnectionStatus === 'success' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {mediumConnectionStatus === 'success' ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not tested'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Available Publications */}
                    {mediumPublications.length > 0 && (
                      <div className="mt-4 pt-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Publications</h4>
                        <div className="space-y-1">
                          {mediumPublications.map((pub) => (
                            <div key={pub.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{pub.name}</span>
                              <span className="text-gray-400 text-xs">{pub.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Configuration Form */}
                <div>
                  <button
                    onClick={() => setShowMediumForm(!showMediumForm)}
                    className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showMediumForm ? 'Hide Form' : savedMediumConfig ? 'Update Configuration' : 'Add Configuration'}
                  </button>

                  {showMediumForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="medium-token" className="block text-sm font-medium text-gray-700">
                          Integration Token
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showMediumToken ? "text" : "password"}
                            id="medium-token"
                            value={mediumConfig.accessToken}
                            onChange={(e) => setMediumConfig({ ...mediumConfig, accessToken: e.target.value })}
                            placeholder="Enter your Medium integration token"
                            className="block w-full px-3 py-2 pr-10 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowMediumToken(!showMediumToken)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showMediumToken ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Your Medium integration token from Settings → Integration tokens</p>
                      </div>

                      <div>
                        <label htmlFor="medium-publication" className="block text-sm font-medium text-gray-700">
                          Publication ID (Optional)
                        </label>
                        <input
                          type="text"
                          id="medium-publication"
                          value={mediumConfig.publicationId}
                          onChange={(e) => setMediumConfig({ ...mediumConfig, publicationId: e.target.value })}
                          placeholder="Leave empty to post to personal stories"
                          className="mt-1 block w-full px-3 py-2 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">The ID of the publication to post to (will be populated after testing connection)</p>
                      </div>

                      {/* Publication Selector */}
                      {mediumPublications.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or select from your publications
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value=""
                                checked={mediumConfig.publicationId === ''}
                                onChange={(e) => setMediumConfig({ ...mediumConfig, publicationId: e.target.value })}
                                className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Personal Stories (No publication)</span>
                            </label>
                            {mediumPublications.map((pub) => (
                              <label key={pub.id} className="flex items-center">
                                <input
                                  type="radio"
                                  value={pub.id}
                                  checked={mediumConfig.publicationId === pub.id}
                                  onChange={(e) => setMediumConfig({ ...mediumConfig, publicationId: e.target.value })}
                                  className="h-4 w-4 text-[#FF385C] focus:ring-[#FF385C] border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{pub.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {mediumConnectionStatus === 'error' && mediumConnectionError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                              <p className="mt-1 text-sm text-red-700">{mediumConnectionError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {mediumConnectionStatus === 'success' && (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
                              <p className="mt-1 text-sm text-green-700">
                                Your Medium account has been connected successfully.
                                {mediumPublications.length > 0 && ` Found ${mediumPublications.length} publication(s).`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={testMediumConnection}
                          disabled={testingMediumConnection}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {testingMediumConnection ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={saveMediumConfig}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E0314F]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-yellow-50 shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Medium allows a maximum of 5 tags per post</li>
                        <li>Posts can be published as drafts, unlisted, or public</li>
                        <li>Once published, posts cannot be edited via the API</li>
                        <li>Integration tokens never expire, keep them secure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blogger Integration */}
            {activeTab === 'blogger' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Blogger Integration</h2>
                    <p className="mt-1 text-sm text-gray-600">Connect your Blogger account to publish blog posts</p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(showInstructions === 'blogger' ? null : 'blogger')}
                    className="text-[#FF385C] hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                    How to Configure
                  </button>
                </div>

                {/* Instructions */}
                {showInstructions === 'blogger' && (
                  <div className="mb-6 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">{instructions.blogger.title}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      {instructions.blogger.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Current Configuration Display */}
                {savedBloggerConfig && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Key:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {bloggerConfig.apiKey ? '••••••••' + bloggerConfig.apiKey.slice(-4) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Blog ID:</span>
                        <span className="text-sm font-medium text-gray-900">{bloggerConfig.blogId || 'Not set'}</span>
                      </div>
                      {bloggerConfig.blogName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Blog Name:</span>
                          <span className="text-sm font-medium text-gray-900">{bloggerConfig.blogName}</span>
                        </div>
                      )}
                      {bloggerConfig.blogUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Blog URL:</span>
                          <a 
                            href={bloggerConfig.blogUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#FF385C] hover:text-blue-700"
                          >
                            {bloggerConfig.blogUrl}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connection Status:</span>
                        <span className={`inline-flex items-center text-sm ${
                          bloggerConnectionStatus === 'success' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {bloggerConnectionStatus === 'success' ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not tested'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div>
                  <button
                    onClick={() => setShowBloggerForm(!showBloggerForm)}
                    className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showBloggerForm ? 'Hide Form' : savedBloggerConfig ? 'Update Configuration' : 'Add Configuration'}
                  </button>

                  {showBloggerForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="blogger-api-key" className="block text-sm font-medium text-gray-700">
                          Google API Key
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showBloggerApiKey ? "text" : "password"}
                            id="blogger-api-key"
                            value={bloggerConfig.apiKey}
                            onChange={(e) => setBloggerConfig({ ...bloggerConfig, apiKey: e.target.value })}
                            placeholder="Enter your Google API key"
                            className="block w-full px-3 py-2 pr-10 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowBloggerApiKey(!showBloggerApiKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showBloggerApiKey ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">API key from Google Cloud Console with Blogger API enabled</p>
                      </div>

                      <div>
                        <label htmlFor="blogger-blog-id" className="block text-sm font-medium text-gray-700">
                          Blog ID
                        </label>
                        <input
                          type="text"
                          id="blogger-blog-id"
                          value={bloggerConfig.blogId}
                          onChange={(e) => setBloggerConfig({ ...bloggerConfig, blogId: e.target.value })}
                          placeholder="e.g., 1234567890123456789"
                          className="mt-1 block w-full px-3 py-2 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Found in your Blogger dashboard URL after 'blogID='</p>
                      </div>

                      {/* Help Section for Finding Blog ID */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">How to find your Blog ID:</h4>
                        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                          <li>Go to blogger.com and sign in</li>
                          <li>Click on your blog from the dashboard</li>
                          <li>Look at the URL in your browser</li>
                          <li>Find the number after "blogID=" in the URL</li>
                          <li>Example: https://www.blogger.com/blog/posts/1234567890123456789</li>
                        </ol>
                      </div>

                      {bloggerConnectionStatus === 'error' && bloggerConnectionError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                              <p className="mt-1 text-sm text-red-700">{bloggerConnectionError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {bloggerConnectionStatus === 'success' && (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
                              <p className="mt-1 text-sm text-green-700">
                                Connected to: {bloggerConfig.blogName || 'Your Blogger blog'}
                              </p>
                              {bloggerConfig.blogUrl && (
                                <p className="mt-1 text-sm">
                                  <a 
                                    href={bloggerConfig.blogUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-green-700 underline hover:text-green-800"
                                  >
                                    Visit your blog →
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={testBloggerConnection}
                          disabled={testingBloggerConnection}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {testingBloggerConnection ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={saveBloggerConfig}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E0314F]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-yellow-50 shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Make sure the Blogger API v3 is enabled in Google Cloud Console</li>
                        <li>API keys can be restricted for security (recommended)</li>
                        <li>Blog posts will be published as drafts by default</li>
                        <li>You can add labels (tags) to organize your posts</li>
                        <li>HTML content is supported in blog posts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* API Key Security Tips */}
                <div className="mt-4 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Security Tips</h3>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Restrict your API key to only the Blogger API</li>
                        <li>Set referrer restrictions if using from a web app</li>
                        <li>Monitor usage in Google Cloud Console</li>
                        <li>Rotate keys periodically for better security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ghost Integration */}
            {activeTab === 'ghost' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Ghost Integration</h2>
                    <p className="mt-1 text-sm text-gray-600">Connect your Ghost publication to publish content</p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(showInstructions === 'ghost' ? null : 'ghost')}
                    className="text-[#FF385C] hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                    How to Configure
                  </button>
                </div>

                {/* Instructions */}
                {showInstructions === 'ghost' && (
                  <div className="mb-6 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">{instructions.ghost.title}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      {instructions.ghost.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Current Configuration Display */}
                {savedGhostConfig && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ghost URL:</span>
                        <span className="text-sm font-medium text-gray-900">{ghostConfig.url || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Admin API Key:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {ghostConfig.adminApiKey ? '••••••••' + ghostConfig.adminApiKey.slice(-8) : 'Not set'}
                        </span>
                      </div>
                      {ghostConfig.blogName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Site Name:</span>
                          <span className="text-sm font-medium text-gray-900">{ghostConfig.blogName}</span>
                        </div>
                      )}
                      {ghostConfig.apiUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Site URL:</span>
                          <a 
                            href={ghostConfig.apiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#FF385C] hover:text-blue-700"
                          >
                            {ghostConfig.apiUrl}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connection Status:</span>
                        <span className={`inline-flex items-center text-sm ${
                          ghostConnectionStatus === 'success' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {ghostConnectionStatus === 'success' ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not tested'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div>
                  <button
                    onClick={() => setShowGhostForm(!showGhostForm)}
                    className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showGhostForm ? 'Hide Form' : savedGhostConfig ? 'Update Configuration' : 'Add Configuration'}
                  </button>

                  {showGhostForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="ghost-url" className="block text-sm font-medium text-gray-700">
                          Ghost Site URL
                        </label>
                        <input
                          type="url"
                          id="ghost-url"
                          value={ghostConfig.url}
                          onChange={(e) => setGhostConfig({ ...ghostConfig, url: e.target.value })}
                          placeholder="https://yourblog.com"
                          className="mt-1 block w-full px-3 py-2 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">The URL of your Ghost site (without /ghost at the end)</p>
                      </div>

                      <div>
                        <label htmlFor="ghost-api-key" className="block text-sm font-medium text-gray-700">
                          Admin API Key
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showGhostApiKey ? "text" : "password"}
                            id="ghost-api-key"
                            value={ghostConfig.adminApiKey}
                            onChange={(e) => setGhostConfig({ ...ghostConfig, adminApiKey: e.target.value })}
                            placeholder="1234567890abcdef:1234567890abcdef..."
                            className="block w-full px-3 py-2 pr-10 shadow-sm rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGhostApiKey(!showGhostApiKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showGhostApiKey ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Found in Ghost Admin → Settings → Integrations → Your Integration</p>
                      </div>

                      {/* API Key Format Help */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Admin API Key Format:</h4>
                        <div className="space-y-2 text-xs text-gray-600">
                          <p>The Admin API Key consists of two parts separated by a colon (:)</p>
                          <p className="font-mono bg-white px-2 py-1 rounded shadow-sm">
                            id:secret
                          </p>
                          <p>Example: <span className="font-mono">5f3d4b2a1c9d8e7f6a5b4c3d:2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f</span></p>
                        </div>
                      </div>

                      {ghostConnectionStatus === 'error' && ghostConnectionError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                              <p className="mt-1 text-sm text-red-700">{ghostConnectionError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ghostConnectionStatus === 'success' && (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
                              <p className="mt-1 text-sm text-green-700">
                                Connected to: {ghostConfig.blogName || 'Your Ghost site'}
                              </p>
                              {ghostConfig.apiUrl && (
                                <p className="mt-1 text-sm">
                                  <a 
                                    href={ghostConfig.apiUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-green-700 underline hover:text-green-800"
                                  >
                                    Visit your site →
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={testGhostConnection}
                          disabled={testingGhostConnection}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {testingGhostConnection ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={saveGhostConfig}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E0314F]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-yellow-50 shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Ghost uses JWT authentication with Admin API keys</li>
                        <li>Posts can be published as drafts or live</li>
                        <li>Supports Markdown and HTML content</li>
                        <li>Featured images and tags are supported</li>
                        <li>SEO meta data can be customized per post</li>
                        <li>Ghost API version 5.0 is used for compatibility</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Ghost Pro vs Self-hosted */}
                <div className="mt-4 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Ghost Pro vs Self-hosted</h3>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li><strong>Ghost Pro:</strong> Use your .ghost.io domain (e.g., https://yourblog.ghost.io)</li>
                        <li><strong>Self-hosted:</strong> Use your custom domain (e.g., https://yourdomain.com)</li>
                        <li>Both versions work the same way with the Admin API</li>
                        <li>Make sure your Ghost version is 5.0 or higher</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Webflow Integration */}
            {activeTab === 'webflow' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Webflow Integration</h2>
                    <p className="mt-1 text-sm text-gray-600">Connect your Webflow site to publish content to your CMS collections</p>
                  </div>
                  <button
                    onClick={() => setShowInstructions(showInstructions === 'webflow' ? null : 'webflow')}
                    className="text-[#FF385C] hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                    How to Configure
                  </button>
                </div>

                {/* Instructions */}
                {showInstructions === 'webflow' && (
                  <div className="mb-6 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">{instructions.webflow.title}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      {instructions.webflow.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Current Configuration Display */}
                {savedWebflowConfig && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Configuration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Site ID:</span>
                        <span className="text-sm font-medium text-gray-900">{webflowConfig.siteId || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Token:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {webflowConfig.apiToken ? '••••••••' + webflowConfig.apiToken.slice(-8) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Collection ID:</span>
                        <span className="text-sm font-medium text-gray-900">{webflowConfig.collectionId || 'Not set'}</span>
                      </div>
                      {webflowConfig.siteName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Site Name:</span>
                          <span className="text-sm font-medium text-gray-900">{webflowConfig.siteName}</span>
                        </div>
                      )}
                      {webflowConfig.collectionName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Collection Name:</span>
                          <span className="text-sm font-medium text-gray-900">{webflowConfig.collectionName}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connection Status:</span>
                        <span className={`inline-flex items-center text-sm ${
                          webflowConnectionStatus === 'success' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {webflowConnectionStatus === 'success' ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            'Not tested'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div>
                  <button
                    onClick={() => setShowWebflowForm(!showWebflowForm)}
                    className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {showWebflowForm ? 'Hide Form' : savedWebflowConfig ? 'Update Configuration' : 'Add Configuration'}
                  </button>

                  {showWebflowForm && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="webflow-site-id" className="block text-sm font-medium text-gray-700">
                          Site ID
                        </label>
                        <input
                          type="text"
                          id="webflow-site-id"
                          value={webflowConfig.siteId}
                          onChange={(e) => setWebflowConfig({ ...webflowConfig, siteId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                          placeholder="e.g., 5f7b3d..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Found in Site Settings → General → Site ID
                        </p>
                      </div>

                      <div>
                        <label htmlFor="webflow-api-token" className="block text-sm font-medium text-gray-700">
                          API Token
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showWebflowApiToken ? 'text' : 'password'}
                            id="webflow-api-token"
                            value={webflowConfig.apiToken}
                            onChange={(e) => setWebflowConfig({ ...webflowConfig, apiToken: e.target.value })}
                            className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                            placeholder="Your Webflow API token"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebflowApiToken(!showWebflowApiToken)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showWebflowApiToken ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Generate in Account Settings → API Access
                        </p>
                      </div>

                      <div>
                        <label htmlFor="webflow-collection-id" className="block text-sm font-medium text-gray-700">
                          Collection ID
                        </label>
                        <input
                          type="text"
                          id="webflow-collection-id"
                          value={webflowConfig.collectionId}
                          onChange={(e) => setWebflowConfig({ ...webflowConfig, collectionId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF385C] focus:border-[#FF385C] sm:text-sm"
                          placeholder="e.g., 5f7b3d..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Found in CMS → Collection Settings → Collection ID
                        </p>
                      </div>

                      {/* Connection Status */}
                      {webflowConnectionStatus === 'error' && webflowConnectionError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Connection failed</h3>
                              <p className="mt-1 text-sm text-red-700">{webflowConnectionError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {webflowConnectionStatus === 'success' && (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Connection successful!</h3>
                              <p className="mt-1 text-sm text-green-700">Your Webflow site is connected and ready to receive content.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={testWebflowConnection}
                          disabled={testingWebflowConnection}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {testingWebflowConnection ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={saveWebflowConfig}
                          className="inline-flex items-center px-4 py-2 shadow-sm rounded-md shadow-sm text-sm font-medium text-white bg-[#FF385C] hover:bg-[#E0314F]"
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collection Structure Help */}
                <div className="mt-8 bg-[#FAFAFA] shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Collection Field Requirements</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Your Webflow collection should have these fields:
                      </p>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li><strong>name</strong> (Text) - Post title</li>
                        <li><strong>slug</strong> (Slug) - URL path</li>
                        <li><strong>content</strong> (Rich Text) - Post content</li>
                        <li><strong>excerpt</strong> (Text, optional) - Post summary</li>
                        <li><strong>published-date</strong> (Date/Time) - Publication date</li>
                        <li><strong>featured-image</strong> (Image, optional) - Main image</li>
                        <li><strong>tags</strong> (Text, optional) - Post tags</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-4 bg-yellow-50 shadow-sm rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Webflow API has rate limits: 60 requests per minute</li>
                        <li>Changes are published automatically to your live site</li>
                        <li>Rich text content supports HTML and markdown</li>
                        <li>Images must be hosted externally (use URLs)</li>
                        <li>Collection items have a 10,000 item limit per collection</li>
                        <li>Make sure your API token has CMS permissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content */}
            {activeTab !== 'wordpress' && activeTab !== 'medium' && activeTab !== 'blogger' && activeTab !== 'ghost' && activeTab !== 'webflow' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">{activeTab} Integration</h2>
                <p className="text-gray-600">Configuration for {activeTab} will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  )
}