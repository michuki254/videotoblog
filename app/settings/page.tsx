'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import DashboardLayout from '../components/DashboardLayout'

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

  // Load saved WordPress configuration from database
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        console.log('📥 Loading user settings from database...');
        
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
              
              // Set saved config status based on whether we have complete config
              const hasCompleteConfig = wordpress.url && wordpress.username && wordpress.password;
              setSavedConfig(hasCompleteConfig);
              
              // Set connection status if available
              if (wordpress.connectionStatus === 'connected') {
                setConnectionStatus('success');
              } else if (wordpress.connectionStatus === 'failed') {
                setConnectionStatus('error');
                setConnectionError('Last connection test failed');
              }
            }

            // Load Medium configuration
            if (medium) {
              setMediumConfig({
                accessToken: medium.accessToken || '',
                publicationId: medium.publicationId || '',
                authorId: medium.authorId || ''
              });
              
              // Set saved config status based on whether we have complete config
              const hasCompleteMediumConfig = medium.accessToken;
              setSavedMediumConfig(hasCompleteMediumConfig);
              
              // Set connection status if available
              if (medium.connectionStatus === 'success') {
                setMediumConnectionStatus('success');
              } else if (medium.connectionStatus === 'error') {
                setMediumConnectionStatus('error');
                setMediumConnectionError('Last connection test failed');
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
              
              // Set saved config status based on whether we have complete config
              const hasCompleteBloggerConfig = blogger.apiKey && blogger.blogId;
              setSavedBloggerConfig(hasCompleteBloggerConfig);
              
              // Set connection status if available
              if (blogger.connectionStatus === 'success') {
                setBloggerConnectionStatus('success');
              } else if (blogger.connectionStatus === 'error') {
                setBloggerConnectionStatus('error');
                setBloggerConnectionError('Last connection test failed');
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
              
              // Set saved config status based on whether we have complete config
              const hasCompleteGhostConfig = ghost.url && ghost.adminApiKey;
              setSavedGhostConfig(hasCompleteGhostConfig);
              
              // Set connection status if available
              if (ghost.connectionStatus === 'success') {
                setGhostConnectionStatus('success');
              } else if (ghost.connectionStatus === 'error') {
                setGhostConnectionStatus('error');
                setGhostConnectionError('Last connection test failed');
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
              
              // Set saved config status based on whether we have complete config
              const hasCompleteWebflowConfig = webflow.siteId && webflow.apiToken && webflow.collectionId;
              setSavedWebflowConfig(hasCompleteWebflowConfig);
              
              // Set connection status if available
              if (webflow.connectionStatus === 'success') {
                setWebflowConnectionStatus('success');
              } else if (webflow.connectionStatus === 'error') {
                setWebflowConnectionStatus('error');
                setWebflowConnectionError('Last connection test failed');
              }
            }
            
            console.log('✅ User settings loaded successfully');
            console.log('📊 WordPress config status:', {
              configured: wordpress?.url && wordpress?.username && wordpress?.password,
              connectionStatus: wordpress?.connectionStatus,
              lastTested: wordpress?.lastTested
            });
            console.log('📊 Medium config status:', {
              configured: !!medium?.accessToken,
              connectionStatus: medium?.connectionStatus,
              lastTested: medium?.lastTested
            });
            console.log('📊 Blogger config status:', {
              configured: !!(blogger?.apiKey && blogger?.blogId),
              connectionStatus: blogger?.connectionStatus,
              lastTested: blogger?.lastTested
            });
            console.log('📊 Ghost config status:', {
              configured: !!(ghost?.url && ghost?.adminApiKey),
              connectionStatus: ghost?.connectionStatus,
              lastTested: ghost?.lastTested
            });
            console.log('📊 Webflow config status:', {
              configured: !!(webflow?.siteId && webflow?.apiToken && webflow?.collectionId),
              connectionStatus: webflow?.connectionStatus,
              lastTested: webflow?.lastTested
            });
          }
        } else {
          console.error('❌ Failed to load user settings:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Error loading user settings:', error);
      }
    };

    if (isLoaded && user) {
      loadUserSettings();
    }
  }, [isLoaded, user]);

  const saveWordPressConfig = async () => {
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('💾 Saving WordPress configuration to database...');
      
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
            connectionStatus: 'not-tested' // Reset connection status when config changes
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedConfig(true);
          setShowWordPressForm(false); // Close form after saving
          setConnectionStatus('idle'); // Reset connection status
          setConnectionError(null);
          
          console.log('✅ WordPress configuration saved successfully');
          
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
                <div class="text-sm text-green-100">WordPress configuration has been saved securely to your account.</div>
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
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving WordPress configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div class="font-medium">Save Failed!</div>
            <div class="text-sm text-red-100">Could not save WordPress configuration. Please try again.</div>
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
  };

  const testWordPressConnection = async () => {
    if (!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password) {
      setConnectionError('Please fill in all WordPress configuration fields')
      setConnectionStatus('error')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionError(null)

    try {
      console.log('🔄 Testing WordPress connection via API...')

      const response = await fetch('/api/wordpress/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: wordpressConfig.url,
          username: wordpressConfig.username,
          password: wordpressConfig.password
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ WordPress connection successful:', data.user?.name)
        setConnectionStatus('success')
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300'
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Connection Successful!</div>
              <div class="text-sm text-green-100">Connected as: ${data.user?.name || wordpressConfig.username}</div>
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
        }, 3000)
      } else {
        console.error('❌ WordPress connection failed:', data.error)
        setConnectionError(data.error || 'Connection failed')
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('❌ WordPress connection error:', error)
      setConnectionError(error instanceof Error ? error.message : 'Network error occurred')
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const saveMediumConfig = async () => {
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('💾 Saving Medium configuration to database...');
      
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
            connectionStatus: 'idle' // Reset connection status when config changes
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedMediumConfig(true);
          setShowMediumForm(false); // Close form after saving
          setMediumConnectionStatus('idle'); // Reset connection status
          setMediumConnectionError(null);
          
          console.log('✅ Medium configuration saved successfully');
          
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
                <div class="text-sm text-green-100">Medium configuration has been saved securely to your account.</div>
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
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving Medium configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div class="font-medium">Save Failed!</div>
            <div class="text-sm text-red-100">Could not save Medium configuration. Please try again.</div>
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
  };

  const testMediumConnection = async () => {
    if (!mediumConfig.accessToken) {
      setMediumConnectionError('Please provide a Medium access token')
      setMediumConnectionStatus('error')
      return
    }

    setTestingMediumConnection(true)
    setMediumConnectionStatus('idle')
    setMediumConnectionError(null)

    try {
      console.log('🔄 Testing Medium connection via API...')

      const response = await fetch('/api/medium/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: mediumConfig.accessToken
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Medium connection successful:', data.user?.name)
        setMediumConnectionStatus('success')
        
        // Update config with user info
        setMediumConfig(prev => ({
          ...prev,
          authorId: data.user.id
        }));

        // Load publications
        if (data.publications && data.publications.length > 0) {
          setMediumPublications(data.publications);
        }
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300'
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Connection Successful!</div>
              <div class="text-sm text-green-100">Connected as: ${data.user?.name || 'Medium User'}</div>
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
        }, 3000)
      } else {
        console.error('❌ Medium connection failed:', data.error)
        setMediumConnectionError(data.error || 'Connection failed')
        setMediumConnectionStatus('error')
      }
    } catch (error) {
      console.error('❌ Medium connection error:', error)
      setMediumConnectionError(error instanceof Error ? error.message : 'Network error occurred')
      setMediumConnectionStatus('error')
    } finally {
      setTestingMediumConnection(false)
    }
  }

  const saveBloggerConfig = async () => {
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('💾 Saving Blogger configuration to database...');
      
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
            connectionStatus: 'idle' // Reset connection status when config changes
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedBloggerConfig(true);
          setShowBloggerForm(false); // Close form after saving
          setBloggerConnectionStatus('idle'); // Reset connection status
          setBloggerConnectionError(null);
          
          console.log('✅ Blogger configuration saved successfully');
          
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
                <div class="text-sm text-green-100">Blogger configuration has been saved securely to your account.</div>
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
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving Blogger configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div class="font-medium">Save Failed!</div>
            <div class="text-sm text-red-100">Could not save Blogger configuration. Please try again.</div>
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
  };

  const testBloggerConnection = async () => {
    if (!bloggerConfig.apiKey || !bloggerConfig.blogId) {
      setBloggerConnectionError('Please provide both API Key and Blog ID')
      setBloggerConnectionStatus('error')
      return
    }

    setTestingBloggerConnection(true)
    setBloggerConnectionStatus('idle')
    setBloggerConnectionError(null)

    try {
      console.log('🔄 Testing Blogger connection via API...')

      const response = await fetch('/api/blogger/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: bloggerConfig.apiKey,
          blogId: bloggerConfig.blogId
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Blogger connection successful:', data.blog?.name)
        setBloggerConnectionStatus('success')
        
        // Update config with blog info
        setBloggerConfig(prev => ({
          ...prev,
          blogName: data.blog.name,
          blogUrl: data.blog.url
        }));
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300'
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Connection Successful!</div>
              <div class="text-sm text-green-100">Connected to: ${data.blog?.name || 'Blogger Blog'}</div>
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
        }, 3000)
      } else {
        console.error('❌ Blogger connection failed:', data.error)
        setBloggerConnectionError(data.error || 'Connection failed')
        setBloggerConnectionStatus('error')
      }
    } catch (error) {
      console.error('❌ Blogger connection error:', error)
      setBloggerConnectionError(error instanceof Error ? error.message : 'Network error occurred')
      setBloggerConnectionStatus('error')
    } finally {
      setTestingBloggerConnection(false)
    }
  }

  // Ghost Configuration Functions
  const saveGhostConfig = async () => {
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('💾 Saving Ghost configuration to database...');
      
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
            connectionStatus: 'idle' // Reset connection status when config changes
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedGhostConfig(true);
          setShowGhostForm(false); // Close form after saving
          setGhostConnectionStatus('idle'); // Reset connection status
          setGhostConnectionError(null);
          
          console.log('✅ Ghost configuration saved successfully');
          
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
                <div class="text-sm text-green-100">Ghost configuration has been saved securely to your account.</div>
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
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving Ghost configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div class="font-medium">Save Failed!</div>
            <div class="text-sm text-red-100">Could not save Ghost configuration. Please try again.</div>
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
      console.log('🔄 Testing Ghost connection via API...');

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
        console.log('✅ Ghost connection successful:', data.site?.title);
        setGhostConnectionStatus('success');
        
        // Update config with site info
        setGhostConfig(prev => ({
          ...prev,
          blogName: data.site.title,
          apiUrl: data.site.url
        }));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Connection Successful!</div>
              <div class="text-sm text-green-100">Connected to: ${data.site?.title || 'Ghost Site'}</div>
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
        }, 3000);
      } else {
        console.error('❌ Ghost connection failed:', data.error);
        setGhostConnectionError(data.error || 'Connection failed');
        setGhostConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Ghost connection error:', error);
      setGhostConnectionError(error instanceof Error ? error.message : 'Network error occurred');
      setGhostConnectionStatus('error');
    } finally {
      setTestingGhostConnection(false);
    }
  };

  // Webflow Configuration Functions
  const saveWebflowConfig = async () => {
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }

    try {
      console.log('💾 Saving Webflow configuration to database...');
      
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
            connectionStatus: 'idle' // Reset connection status when config changes
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedWebflowConfig(true);
          setShowWebflowForm(false); // Close form after saving
          setWebflowConnectionStatus('idle'); // Reset connection status
          setWebflowConnectionError(null);
          
          console.log('✅ Webflow configuration saved successfully');
          
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
                <div class="text-sm text-green-100">Webflow configuration has been saved securely to your account.</div>
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
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving Webflow configuration:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <div class="font-medium">Save Failed!</div>
            <div class="text-sm text-red-100">Could not save Webflow configuration. Please try again.</div>
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
      console.log('🔄 Testing Webflow connection via API...');

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
        console.log('✅ Webflow connection successful:', data.site?.name);
        setWebflowConnectionStatus('success');
        
        // Update config with site info
        setWebflowConfig(prev => ({
          ...prev,
          siteName: data.site?.name || prev.siteName,
          collectionName: data.collection?.name || prev.collectionName
        }));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div class="font-medium">Connection Successful!</div>
              <div class="text-sm text-green-100">Connected to: ${data.site?.name || 'Webflow Site'}</div>
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
        }, 3000);
      } else {
        console.error('❌ Webflow connection failed:', data.error);
        setWebflowConnectionError(data.error || 'Connection failed');
        setWebflowConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Webflow connection error:', error);
      setWebflowConnectionError(error instanceof Error ? error.message : 'Network error occurred');
      setWebflowConnectionStatus('error');
    } finally {
      setTestingWebflowConnection(false);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Please sign in to access settings.</p>
            <Link 
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Link>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="pb-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm mb-6">
              <Link 
                href="/dashboard" 
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Application Settings
                  </h1>
                  <p className="text-gray-600">Manage your VideotoBlog configurations and integrations</p>
                </div>
                <div className="text-sm text-gray-500">
                  Logged in as: {user.emailAddresses[0]?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Moved to top */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('wordpress')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'wordpress'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    WordPress Integration
                    {savedConfig && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('medium')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'medium'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                    </svg>
                    Medium Integration
                    {savedMediumConfig && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('blogger')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'blogger'
                      ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Blogger Integration
                    {savedBloggerConfig && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('ghost')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'ghost'
                      ? 'border-gray-500 text-gray-600 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Ghost Integration
                    {savedGhostConfig && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('webflow')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === 'webflow'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Webflow Integration
                    {savedWebflowConfig && (
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('ai')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors opacity-50 cursor-not-allowed ${
                      activeTab === 'ai'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-400'
                    }`}
                    disabled
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Configuration
                  <span className="ml-2 text-xs">Coming Soon</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('appearance')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors opacity-50 cursor-not-allowed ${
                      activeTab === 'appearance'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-400'
                    }`}
                    disabled
                  >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    Appearance
                  <span className="ml-2 text-xs">Coming Soon</span>
                  </button>
                </nav>
              </div>
            </div>

          {/* Main Content - Full Width */}
          <div className="w-full">
              {activeTab === 'wordpress' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      Available Integrations
                    </h2>
                    <p className="text-gray-600">Connect your favorite platforms and services to streamline your content publishing workflow.</p>
                  </div>

                  <div className="space-y-4">
                    {/* WordPress Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">WordPress</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to WordPress</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowWordPressForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Site URL:</span>
                              <p className="text-gray-900 font-medium truncate">{wordpressConfig.url}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Username:</span>
                              <p className="text-gray-900 font-medium">{wordpressConfig.username}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {connectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testWordPressConnection}
                              disabled={testingConnection}
                              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {testingConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Medium Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Medium</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Medium</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedMediumConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowMediumForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedMediumConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedMediumConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Access Token:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Publication:</span>
                              <p className="text-gray-900 font-medium">
                                {mediumConfig.publicationId ? 
                                  mediumPublications.find(pub => pub.id === mediumConfig.publicationId)?.name || 'Custom Publication' 
                                  : 'Personal Account'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {mediumConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testMediumConnection}
                              disabled={testingMediumConnection}
                              className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {testingMediumConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blogger Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-yellow-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Blogger</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Blogger</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedBloggerConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowBloggerForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedBloggerConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedBloggerConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">API Key:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Blog ID:</span>
                              <p className="text-gray-900 font-medium">{bloggerConfig.blogId}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {bloggerConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testBloggerConnection}
                              disabled={testingBloggerConnection}
                              className="text-xs text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                            >
                              {testingBloggerConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coming Soon Integrations */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                            <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-700">More Integrations</h3>
                            <p className="text-gray-500 text-sm">Ghost, Webflow, Notion, and more coming soon!</p>
                          </div>
                        </div>
                        
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medium' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                        </svg>
                      </div>
                      Medium Integration
                    </h2>
                    <p className="text-gray-600">Configure your Medium publishing settings and reach a wider audience with your video blog content.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Medium Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Medium Publishing</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Medium for wider reach</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedMediumConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowMediumForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedMediumConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedMediumConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Access Token:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Publication:</span>
                              <p className="text-gray-900 font-medium">
                                {mediumConfig.publicationId ? 
                                  mediumPublications.find(pub => pub.id === mediumConfig.publicationId)?.name || 'Custom Publication' 
                                  : 'Personal Account'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {mediumConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testMediumConnection}
                              disabled={testingMediumConnection}
                              className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {testingMediumConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Medium Benefits */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Why Publish to Medium?
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Reach millions of readers on Medium</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Built-in SEO and discoverability</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Professional publishing platform</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Automatic cross-posting from VideotoBlog</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'blogger' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                        </svg>
                      </div>
                      Blogger Integration
                    </h2>
                    <p className="text-gray-600">Configure your Blogger publishing settings and reach a wider audience with your video blog content.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Blogger Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-yellow-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Blogger Publishing</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Blogger for wider reach</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedBloggerConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowBloggerForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedBloggerConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedBloggerConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">API Key:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Blog ID:</span>
                              <p className="text-gray-900 font-medium">{bloggerConfig.blogId}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {bloggerConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testBloggerConnection}
                              disabled={testingBloggerConnection}
                              className="text-xs text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                            >
                              {testingBloggerConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blogger Benefits */}
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Why Publish to Blogger?
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Reach millions of readers on Blogger</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Built-in SEO and discoverability</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Professional publishing platform</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Automatic cross-posting from VideotoBlog</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ghost' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      Ghost Integration
                    </h2>
                    <p className="text-gray-600">Configure your Ghost publishing settings and reach a wider audience with your professional blog content.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Ghost Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Ghost Publishing</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Ghost for professional readers</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedGhostConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowGhostForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {savedGhostConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedGhostConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Ghost URL:</span>
                              <p className="text-gray-900 font-medium truncate">{ghostConfig.url}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Admin API Key:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {ghostConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testGhostConnection}
                              disabled={testingGhostConnection}
                              className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                              {testingGhostConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ghost Benefits */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Why Publish to Ghost?
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Modern, professional publishing platform</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Built for performance and SEO</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Newsletter integration and memberships</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Automatic cross-posting from VideotoBlog</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'webflow' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      Webflow Integration
                    </h2>
                    <p className="text-gray-600">Configure your Webflow CMS publishing settings and reach audiences through beautiful, responsive websites.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Webflow Integration Card */}
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Webflow CMS</h3>
                            <p className="text-gray-600 text-sm">Publish your blog posts directly to Webflow CMS collections</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {savedWebflowConfig ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Connected</span>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">Not configured</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowWebflowForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                            </svg>
                            {savedWebflowConfig ? 'Manage' : 'Configure'}
                          </button>
                        </div>
                      </div>
                      
                      {savedWebflowConfig && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Site ID:</span>
                              <p className="text-gray-900 font-medium truncate">{webflowConfig.siteId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">API Token:</span>
                              <p className="text-gray-900 font-medium">••••••••••••••••</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Last tested: {webflowConnectionStatus === 'success' ? 'Connection verified' : 'Not tested'}</span>
                            <button
                              onClick={testWebflowConnection}
                              disabled={testingWebflowConnection}
                              className="text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50"
                            >
                              {testingWebflowConnection ? 'Testing...' : 'Test connection'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Webflow Benefits */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Why Publish to Webflow?
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Beautiful, responsive designs</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>No-code CMS management</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Fast, optimized hosting</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Automatic cross-posting from VideotoBlog</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Configuration</h3>
                    <p className="text-gray-600 mb-4">Configure AI models, API keys, and generation preferences</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Appearance Settings</h3>
                    <p className="text-gray-600 mb-4">Customize themes, layouts, and visual preferences</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* WordPress Configuration Modal */}
      {showWordPressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  WordPress Integration Setup
                </h2>
                <button
                  onClick={() => setShowWordPressForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* WordPress URL */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                <label htmlFor="wordpress-url" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  WordPress Site URL
                </label>
                <input
                  type="url"
                  id="wordpress-url"
                  value={wordpressConfig.url}
                  onChange={(e) => {
                    setWordpressConfig(prev => ({ ...prev, url: e.target.value }))
                    setConnectionStatus('idle')
                    setConnectionError(null)
                    setSavedConfig(false)
                  }}
                  placeholder="https://your-wordpress-site.com"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-3 text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter the full URL of your WordPress website (must start with https:// or http://)
                </p>
              </div>

              {/* Username */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                <label htmlFor="wordpress-username" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  WordPress Username
                </label>
                <input
                  type="text"
                  id="wordpress-username"
                  value={wordpressConfig.username}
                  onChange={(e) => {
                    setWordpressConfig(prev => ({ ...prev, username: e.target.value }))
                    setConnectionStatus('idle')
                    setConnectionError(null)
                    setSavedConfig(false)
                  }}
                  placeholder="your-wordpress-username"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-3 text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your WordPress admin username or email address
                </p>
              </div>

              {/* Application Password */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-dashed border-yellow-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="wordpress-password" className="block text-sm font-bold text-gray-800 mb-1">
                        Application Password (Required)
                      </label>
                      <p className="text-sm text-gray-600">This is NOT your regular WordPress password</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const modal = document.createElement('div')
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4'
                      modal.onclick = (e) => e.target === modal && document.body.removeChild(modal)
                      modal.innerHTML = `
                        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                          <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                              <h3 class="text-lg font-bold text-gray-900">How to Create Application Password</h3>
                              <button onclick="document.body.removeChild(this.closest('.fixed'))" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div class="space-y-4">
                              <div class="bg-blue-50 rounded-lg p-4">
                                <h4 class="font-semibold text-blue-900 mb-2">Step-by-Step Instructions:</h4>
                                <ol class="list-decimal list-inside text-sm text-blue-800 space-y-2">
                                  <li><strong>Login to WordPress Admin:</strong> Go to your WordPress admin dashboard (usually yoursite.com/wp-admin)</li>
                                  <li><strong>Navigate to Profile:</strong> Click on "Users" → "All Users" → Click on your username</li>
                                  <li><strong>Scroll Down:</strong> Find the "Application Passwords" section (at the bottom of the page)</li>
                                  <li><strong>Create Password:</strong> Enter "VideotoBlog" as the application name</li>
                                  <li><strong>Generate:</strong> Click "Add New Application Password"</li>
                                  <li><strong>Copy Password:</strong> Copy the generated password (it will look like: abcd efgh ijkl mnop)</li>
                                  <li><strong>Paste Here:</strong> Paste that password in the field above</li>
                                </ol>
                              </div>
                              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <div class="flex items-start">
                                  <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <div>
                                    <h5 class="font-medium text-yellow-800">Important Notes:</h5>
                                    <ul class="text-sm text-yellow-700 mt-1 space-y-1">
                                      <li>• This is more secure than using your regular password</li>
                                      <li>• The password will have spaces (this is normal)</li>
                                      <li>• You can revoke this password anytime from WordPress</li>
                                      <li>• If you don't see "Application Passwords", your WordPress might need updating</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      `
                      document.body.appendChild(modal)
                    }}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Help Guide
                  </button>
                </div>
                
                <input
                  type="password"
                  id="wordpress-password"
                  value={wordpressConfig.password}
                  onChange={(e) => {
                    setWordpressConfig(prev => ({ ...prev, password: e.target.value }))
                    setConnectionStatus('idle')
                    setConnectionError(null)
                    setSavedConfig(false)
                  }}
                  placeholder="abcd efgh ijkl mnop qrst uvwx"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-bold border-2 border-yellow-300 rounded-lg shadow-sm bg-white focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:outline-none transition-all duration-200 placeholder-gray-500 font-mono tracking-wide"
                />
                
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Quick Access:</p>
                    <p>WordPress Admin → Users → Your Profile → Application Passwords → "Add New"</p>
                    <p className="text-yellow-700 mt-1">⚠️ Don't have this option? Your WordPress may need to be updated to version 5.6+</p>
                  </div>
                </div>
              </div>

              {/* Connection Status Messages */}
              {connectionStatus === 'success' && (
                <div className="flex items-start p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Perfect! WordPress connection verified.</div>
                    <div className="text-green-700 mt-1">You can now publish blog posts directly to your WordPress site from any post page.</div>
                  </div>
                </div>
              )}

              {connectionStatus === 'error' && connectionError && (
                <div className="flex items-start p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Connection failed:</div>
                    <div className="text-red-700 mt-1">{connectionError}</div>
                    {connectionError.includes('Authentication failed') && (
                      <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded border">
                        <strong>💡 Common fixes:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>• Double-check you're using an Application Password (not regular password)</li>
                          <li>• Make sure you copied the entire password including spaces</li>
                          <li>• Verify your username is correct</li>
                          <li>• Try creating a new Application Password</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowWordPressForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={testWordPressConnection}
                  disabled={!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password || testingConnection}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : connectionStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveWordPressConfig}
                  disabled={!wordpressConfig.url || !wordpressConfig.username || !wordpressConfig.password}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medium Configuration Modal */}
      {showMediumForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                    </svg>
                  </div>
                  Medium Integration Setup
                </h2>
                <button
                  onClick={() => setShowMediumForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Access Token */}
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                <label htmlFor="medium-token" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Medium Access Token
                </label>
                <input
                  type="password"
                  id="medium-token"
                  value={mediumConfig.accessToken}
                  onChange={(e) => {
                    setMediumConfig(prev => ({ ...prev, accessToken: e.target.value }))
                    setMediumConnectionStatus('idle')
                    setMediumConnectionError(null)
                    setSavedMediumConfig(false)
                  }}
                  placeholder="Enter your Medium access token"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">How to get your Medium Access Token:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                      <li>Go to <a href="https://medium.com/me/settings" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Medium Settings</a></li>
                      <li>Scroll down to "Integration tokens"</li>
                      <li>Click "Get integration token"</li>
                      <li>Enter a description (e.g., "VideotoBlog")</li>
                      <li>Copy the generated token and paste it above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Publication Selection */}
              {mediumPublications.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                  <label htmlFor="medium-publication" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Publication (Optional)
                  </label>
                  <select
                    id="medium-publication"
                    value={mediumConfig.publicationId}
                    onChange={(e) => setMediumConfig(prev => ({ ...prev, publicationId: e.target.value }))}
                    className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Personal Account</option>
                    {mediumPublications.map(pub => (
                      <option key={pub.id} value={pub.id}>{pub.name}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    Choose whether to publish to your personal Medium account or to a publication you have access to.
                  </p>
                </div>
              )}

              {/* Connection Status Messages */}
              {mediumConnectionStatus === 'success' && (
                <div className="flex items-start p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Perfect! Medium connection verified.</div>
                    <div className="text-green-700 mt-1">You can now publish blog posts directly to Medium from any post page.</div>
                  </div>
                </div>
              )}

              {mediumConnectionStatus === 'error' && mediumConnectionError && (
                <div className="flex items-start p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Connection failed:</div>
                    <div className="text-red-700 mt-1">{mediumConnectionError}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowMediumForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={testMediumConnection}
                  disabled={!mediumConfig.accessToken || testingMediumConnection}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !mediumConfig.accessToken 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : mediumConnectionStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {testingMediumConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : mediumConnectionStatus === 'success' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveMediumConfig}
                  disabled={!mediumConfig.accessToken}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogger Configuration Modal */}
      {showBloggerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                    </svg>
                  </div>
                  Blogger Integration Setup
                </h2>
                <button
                  onClick={() => setShowBloggerForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* API Key */}
              <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                <label htmlFor="blogger-api-key" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Blogger API Key
                </label>
                <input
                  type="password"
                  id="blogger-api-key"
                  value={bloggerConfig.apiKey}
                  onChange={(e) => {
                    setBloggerConfig(prev => ({ ...prev, apiKey: e.target.value }))
                    setBloggerConnectionStatus('idle')
                    setBloggerConnectionError(null)
                    setSavedBloggerConfig(false)
                  }}
                  placeholder="Enter your Blogger API key"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">How to get your Blogger API Key:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                      <li>Go to <a href="https://www.blogger.com/blog-identity" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">Blogger Identity</a></li>
                      <li>Click on "Blog Identity"</li>
                      <li>Scroll down to "API Access"</li>
                      <li>Click "Create New API Key"</li>
                      <li>Enter a description (e.g., "VideotoBlog")</li>
                      <li>Copy the generated API key and paste it above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Blog ID */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                <label htmlFor="blogger-blog-id" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Blogger Blog ID
                </label>
                <input
                  type="text"
                  id="blogger-blog-id"
                  value={bloggerConfig.blogId}
                  onChange={(e) => {
                    setBloggerConfig(prev => ({ ...prev, blogId: e.target.value }))
                    setBloggerConnectionStatus('idle')
                    setBloggerConnectionError(null)
                    setSavedBloggerConfig(false)
                  }}
                  placeholder="Enter your Blogger blog ID"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the full URL of your Blogger blog (must start with https:// or http://)
                </p>
              </div>

              {/* Blog Name */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                <label htmlFor="blogger-blog-name" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Blogger Blog Name
                </label>
                <input
                  type="text"
                  id="blogger-blog-name"
                  value={bloggerConfig.blogName}
                  onChange={(e) => {
                    setBloggerConfig(prev => ({ ...prev, blogName: e.target.value }))
                    setBloggerConnectionStatus('idle')
                    setBloggerConnectionError(null)
                    setSavedBloggerConfig(false)
                  }}
                  placeholder="Enter your Blogger blog name"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the name of your Blogger blog
                </p>
              </div>

              {/* Blog URL */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                <label htmlFor="blogger-blog-url" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Blogger Blog URL
                </label>
                <input
                  type="url"
                  id="blogger-blog-url"
                  value={bloggerConfig.blogUrl}
                  onChange={(e) => {
                    setBloggerConfig(prev => ({ ...prev, blogUrl: e.target.value }))
                    setBloggerConnectionStatus('idle')
                    setBloggerConnectionError(null)
                    setSavedBloggerConfig(false)
                  }}
                  placeholder="https://your-blogger-blog.com"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the full URL of your Blogger blog (must start with https:// or http://)
                </p>
              </div>

              {/* Connection Status Messages */}
              {bloggerConnectionStatus === 'success' && (
                <div className="flex items-start p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Perfect! Blogger connection verified.</div>
                    <div className="text-green-700 mt-1">You can now publish blog posts directly to your Blogger blog from any post page.</div>
                  </div>
                </div>
              )}

              {bloggerConnectionStatus === 'error' && bloggerConnectionError && (
                <div className="flex items-start p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Connection failed:</div>
                    <div className="text-red-700 mt-1">{bloggerConnectionError}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowBloggerForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={testBloggerConnection}
                  disabled={!bloggerConfig.apiKey || !bloggerConfig.blogId || testingBloggerConnection}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !bloggerConfig.apiKey || !bloggerConfig.blogId 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : bloggerConnectionStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {testingBloggerConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : bloggerConnectionStatus === 'success' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveBloggerConfig}
                  disabled={!bloggerConfig.apiKey || !bloggerConfig.blogId}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Configuration Modal */}
      {showGhostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Ghost Integration Setup
                </h2>
                <button
                  onClick={() => setShowGhostForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ghost URL */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-500">
                <label htmlFor="ghost-url" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Ghost Site URL
                </label>
                <input
                  type="url"
                  id="ghost-url"
                  value={ghostConfig.url}
                  onChange={(e) => {
                    setGhostConfig(prev => ({ ...prev, url: e.target.value }))
                    setGhostConnectionStatus('idle')
                    setGhostConnectionError(null)
                    setSavedGhostConfig(false)
                  }}
                  placeholder="https://yourblog.ghost.io"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter the full URL of your Ghost site (e.g., https://yourblog.ghost.io)
                </p>
              </div>

              {/* Admin API Key */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-500">
                <label htmlFor="ghost-admin-api-key" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Admin API Key
                </label>
                <input
                  type="password"
                  id="ghost-admin-api-key"
                  value={ghostConfig.adminApiKey}
                  onChange={(e) => {
                    setGhostConfig(prev => ({ ...prev, adminApiKey: e.target.value }))
                    setGhostConnectionStatus('idle')
                    setGhostConnectionError(null)
                    setSavedGhostConfig(false)
                  }}
                  placeholder="Enter your Ghost Admin API key"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">How to get your Ghost Admin API Key:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                      <li>Go to your Ghost Admin panel</li>
                      <li>Navigate to "Settings" → "Advanced" → "Integrations"</li>
                      <li>Click "Add custom integration"</li>
                      <li>Give it a name (e.g., "VideotoBlog")</li>
                      <li>Copy the "Admin API Key" and paste it above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Connection Status Messages */}
              {ghostConnectionStatus === 'success' && (
                <div className="flex items-start p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Perfect! Ghost connection verified.</div>
                    <div className="text-green-700 mt-1">You can now publish blog posts directly to your Ghost site from any post page.</div>
                  </div>
                </div>
              )}

              {ghostConnectionStatus === 'error' && ghostConnectionError && (
                <div className="flex items-start p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Connection failed:</div>
                    <div className="text-red-700 mt-1">{ghostConnectionError}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowGhostForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={testGhostConnection}
                  disabled={!ghostConfig.url || !ghostConfig.adminApiKey || testingGhostConnection}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !ghostConfig.url || !ghostConfig.adminApiKey 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : ghostConnectionStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {testingGhostConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : ghostConnectionStatus === 'success' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveGhostConfig}
                  disabled={!ghostConfig.url || !ghostConfig.adminApiKey}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webflow Configuration Modal */}
      {showWebflowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  Webflow Integration Setup
                </h2>
                <button
                  onClick={() => setShowWebflowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Site ID */}
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <label htmlFor="webflow-site-id" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Webflow Site ID
                </label>
                <input
                  type="text"
                  id="webflow-site-id"
                  value={webflowConfig.siteId}
                  onChange={(e) => {
                    setWebflowConfig(prev => ({ ...prev, siteId: e.target.value }))
                    setWebflowConnectionStatus('idle')
                    setWebflowConnectionError(null)
                    setSavedWebflowConfig(false)
                  }}
                  placeholder="Enter your Webflow Site ID"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Find this in your Webflow site settings under "General" tab
                </p>
              </div>

              {/* API Token */}
              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <label htmlFor="webflow-api-token" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Token
                </label>
                <input
                  type="password"
                  id="webflow-api-token"
                  value={webflowConfig.apiToken}
                  onChange={(e) => {
                    setWebflowConfig(prev => ({ ...prev, apiToken: e.target.value }))
                    setWebflowConnectionStatus('idle')
                    setWebflowConnectionError(null)
                    setSavedWebflowConfig(false)
                  }}
                  placeholder="Enter your Webflow API token"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">How to get your Webflow API Token:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-600 mt-1 space-y-1">
                      <li>Go to your Webflow Dashboard</li>
                      <li>Navigate to "Account Settings" → "Integrations"</li>
                      <li>Click "Generate API Token"</li>
                      <li>Give it a name (e.g., "VideotoBlog")</li>
                      <li>Copy the generated token and paste it above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Collection ID */}
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
                <label htmlFor="webflow-collection-id" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Blog Collection ID (Optional)
                </label>
                <input
                  type="text"
                  id="webflow-collection-id"
                  value={webflowConfig.collectionId}
                  onChange={(e) => {
                    setWebflowConfig(prev => ({ ...prev, collectionId: e.target.value }))
                    setWebflowConnectionStatus('idle')
                    setWebflowConnectionError(null)
                    setSavedWebflowConfig(false)
                  }}
                  placeholder="Enter your blog collection ID (optional)"
                  className="block w-full px-4 py-3 text-base text-gray-900 font-medium border-2 border-gray-300 rounded-lg shadow-sm bg-white focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 placeholder-gray-500"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Optional: If you want to publish to a specific CMS collection, enter its ID here
                </p>
              </div>

              {/* Connection Status Messages */}
              {webflowConnectionStatus === 'success' && (
                <div className="flex items-start p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Perfect! Webflow connection verified.</div>
                    <div className="text-green-700 mt-1">You can now publish blog posts directly to your Webflow site from any post page.</div>
                  </div>
                </div>
              )}

              {webflowConnectionStatus === 'error' && webflowConnectionError && (
                <div className="flex items-start p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">Connection failed:</div>
                    <div className="text-red-700 mt-1">{webflowConnectionError}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setShowWebflowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={testWebflowConnection}
                  disabled={!webflowConfig.siteId || !webflowConfig.apiToken || testingWebflowConnection}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    !webflowConfig.siteId || !webflowConfig.apiToken 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : webflowConnectionStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {testingWebflowConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : webflowConnectionStatus === 'success' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveWebflowConfig}
                  disabled={!webflowConfig.siteId || !webflowConfig.apiToken}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 