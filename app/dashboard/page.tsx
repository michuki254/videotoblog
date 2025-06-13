'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  FireIcon,
  DocumentDuplicateIcon,
  UsersIcon
} from '@heroicons/react/24/solid'
import DashboardSidebar from '../components/DashboardSidebar'



const recentConversions = [
  {
    id: 1,
    title: '10 Best React Hooks You Should Know',
    videoUrl: 'https://youtube.com/watch?v=example1',
    status: 'completed',
    createdAt: '2024-01-15',
    wordCount: 2500,
    views: 1250
  },
  {
    id: 2,
    title: 'Understanding JavaScript Closures',
    videoUrl: 'https://youtube.com/watch?v=example2',
    status: 'processing',
    createdAt: '2024-01-14',
    wordCount: 1800,
    views: 890
  },
  {
    id: 3,
    title: 'CSS Grid vs Flexbox - Complete Guide',
    videoUrl: 'https://youtube.com/watch?v=example3',
    status: 'completed',
    createdAt: '2024-01-13',
    wordCount: 3200,
    views: 2100
  },
  {
    id: 4,
    title: 'Node.js Express Tutorial for Beginners',
    videoUrl: 'https://youtube.com/watch?v=example4',
    status: 'completed',
    createdAt: '2024-01-12',
    wordCount: 2800,
    views: 1650
  }
]



interface BlogPost {
  _id: string;
  title: string;
  videoUrl: string;
  videoId: string;
  thumbnail?: string;
  folder?: string;
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
}

interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  description?: string;
}

interface PostsResponse {
  posts: BlogPost[];
  total: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [updatingPosts, setUpdatingPosts] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, string | null>>(new Map());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Calculate stats
  const publishedCount = posts.filter(post => post.status === 'published').length;
  const draftsCount = posts.filter(post => post.status === 'draft').length;
  const totalWords = posts.reduce((acc, post) => acc + post.wordCount, 0);

  const folderColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  useEffect(() => {
    if (isLoaded) {
      fetchPosts();
      loadFolders();
    }
  }, [isLoaded]);

  const loadFolders = () => {
    const savedFolders = localStorage.getItem('blogFolders');
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
  };

  const saveFolders = (updatedFolders: Folder[]) => {
    localStorage.setItem('blogFolders', JSON.stringify(updatedFolders));
    setFolders(updatedFolders);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      color: newFolderColor,
      createdAt: new Date().toISOString()
    };

    saveFolders([...folders, newFolder]);
    setShowCreateFolder(false);
    setNewFolderName('');
    setNewFolderColor('#3B82F6');
  };

  const updateFolder = (folderId: string, name: string, color: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, name, color } : folder
    );
    saveFolders(updatedFolders);
    setEditingFolder(null);
  };

  const deleteFolder = (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All posts in this folder will be moved to Uncategorized.')) {
      return;
    }

    // Move all posts in this folder to uncategorized
    const postsInFolder = posts.filter(post => post.folder === folderId);
    postsInFolder.forEach(post => {
      updatePostFolder(post._id, null);
    });

    // Remove the folder
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    saveFolders(updatedFolders);

    // If the deleted folder was selected, switch to "All Posts"
    if (selectedFolder === folderId) {
      setSelectedFolder(null);
    }
  };

  const updatePostFolder = async (postId: string, folderId: string | null) => {
    console.log('🔄 Frontend: Starting folder update:', { postId, folderId });
    
    // Add to updating set
    setUpdatingPosts(prev => new Set(prev).add(postId))
    
    // Store original value for rollback
    const originalPost = posts.find(post => post._id === postId)
    const originalFolder = originalPost?.folder

    console.log('📋 Frontend: Original post data:', { 
      postId, 
      originalFolder, 
      newFolder: folderId 
    });

    try {
      // Optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, folder: folderId || undefined } : post
        )
      )

      console.log('⚡ Frontend: Applied optimistic update');

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: folderId }),
      })

      console.log('🌐 Frontend: API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to update post folder')
      }

      const responseData = await response.json();
      console.log('✅ Frontend: API response data:', responseData);

      // Ensure local state matches server state
      if (responseData.post) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId ? { ...post, folder: responseData.post.folder } : post
          )
        )
        console.log('🔄 Frontend: Synchronized local state with server response');
      }

      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Folder updated successfully!</span>
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
      }, 2000)

    } catch (error) {
      console.error('❌ Frontend: Error updating post folder:', error)
      
      // Rollback optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, folder: originalFolder } : post
        )
      )

      console.log('🔄 Frontend: Rolled back to original folder:', originalFolder);

      // Show error notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Failed to update folder. Please try again.</span>
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
    } finally {
      // Remove from updating set
      setUpdatingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
      
      console.log('🏁 Frontend: Finished folder update process');
    }
  }

  // Debounced update function for better performance
  const debouncedUpdatePostFolder = useCallback(
    debounce((postId: string, folderId: string | null) => {
      updatePostFolder(postId, folderId)
    }, 500),
    [posts]
  )

  const handleFolderChange = (postId: string, folderId: string | null) => {
    console.log('🔄 Frontend: handleFolderChange called:', { postId, folderId, folderIdType: typeof folderId });
    
    // Immediate optimistic update for UI responsiveness
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, folder: folderId || undefined } : post
      )
    )

    // Store pending update
    setPendingUpdates(prev => new Map(prev).set(postId, folderId))
    
    // Add to updating set to show loading state
    setUpdatingPosts(prev => new Set(prev).add(postId))

    // Debounced API call
    debouncedUpdatePostFolder(postId, folderId)
  }

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  const getFilteredPosts = () => {
    let filtered = posts;

    // Apply folder filter
    if (selectedFolder === 'uncategorized') {
      filtered = filtered.filter(post => !post.folder);
    } else if (selectedFolder !== null) {
      filtered = filtered.filter(post => post.folder === selectedFolder);
    }

    // Apply status filter
    if (filter === 'published') {
      filtered = filtered.filter(post => post.status === 'published');
    } else if (filter === 'draft') {
      filtered = filtered.filter(post => post.status === 'draft');
    }

    return filtered;
  };

  const getFolderById = (id: string) => {
    const folder = folders.find(folder => folder.id === id);
    if (!folder) {
      console.log('❌ Frontend: Folder not found for ID:', { 
        searchingForId: id, 
        availableFolders: folders.map(f => ({ id: f.id, name: f.name })),
        idType: typeof id
      });
    }
    return folder;
  };

  const getPostCountForFolder = (folderId: string | null) => {
    if (folderId === null) {
      return posts.length;
    } else if (folderId === 'uncategorized') {
      return posts.filter(post => !post.folder).length;
    } else {
      return posts.filter(post => post.folder === folderId).length;
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('📥 Frontend: Fetching posts from database...');
      
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data: PostsResponse = await response.json();
      console.log('📥 Frontend: Posts fetched from database:', data.posts.map(post => ({
        id: post._id,
        title: post.title.substring(0, 30) + '...',
        folder: post.folder
      })));

      // Debug folder mismatch
      console.log('🔍 Frontend: Current localStorage folders:', JSON.parse(localStorage.getItem('blogFolders') || '[]'));
      console.log('🔍 Frontend: Post folder IDs from database:', [...new Set(data.posts.map(post => post.folder).filter(Boolean))]);
      
      setPosts(data.posts);
    } catch (err) {
      console.error('❌ Frontend: Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      console.log('🗑️ Deleting post:', postId);
      
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove the deleted post from the local state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Post deleted successfully!</span>
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
      
    } catch (err) {
      console.error('❌ Error deleting post:', err);
      
      // Show error notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300'
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Failed to delete post. Please try again.</span>
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
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isLoaded) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-8 flex">
        {/* Sidebar Component */}
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          user={user || undefined}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 lg:ml-72">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 pt-8">
            {/* Boxed Content Container */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dashboard
            </h1>
                    <p className="text-gray-600 mt-1">
                      Manage your blog posts and conversion history
                    </p>
                  </div>
                  <Link
                    href="/convert"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Convert New Video
                  </Link>
                </div>
          </div>

              {/* Stats Grid */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Posts */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center">
                      <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Posts</p>
                        <p className="text-2xl font-bold text-blue-900">{posts.length}</p>
                </div>
              </div>
            </div>

                  {/* Published */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <div className="flex items-center">
                      <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Published</p>
                        <p className="text-2xl font-bold text-green-900">{posts.filter(post => post.status === 'published').length}</p>
                </div>
              </div>
            </div>

                  {/* Drafts */}
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
              <div className="flex items-center">
                      <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Drafts</p>
                        <p className="text-2xl font-bold text-yellow-900">{posts.filter(post => post.status === 'draft').length}</p>
                </div>
              </div>
            </div>
            
                  {/* Total Words */}
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <div className="flex items-center">
                      <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Total Words</p>
                        <p className="text-2xl font-bold text-purple-900">{posts.reduce((acc, post) => acc + post.wordCount, 0).toLocaleString()}</p>
                      </div>
                </div>
              </div>
            </div>
          </div>

              {/* Folders Section */}
              <div className="p-4 border-b border-gray-200">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
          </div>
                      <h2 className="text-xl font-semibold text-gray-900">Organize by Folders</h2>
                    </div>
          <button
                      onClick={() => setShowCreateFolder(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors shadow-sm"
          >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Folder
          </button>
        </div>

                  {folders.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-1 min-w-[200px]"
                          onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
          </div>
                              <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {folder.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {folder.description || 'No description'}
                                </p>
            </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                              {getPostCountForFolder(folder.id)}
                    </span>
          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center bg-white/50">
                      <svg className="w-12 h-12 text-orange-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                      <p className="text-gray-500 mb-4">Create your first folder to organize your blog posts</p>
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                      >
                        Create First Folder
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Posts Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">All Blog Posts</h2>
                    <p className="text-sm text-gray-500 mt-1">{posts.length} posts</p>
                  </div>
                  
                  {/* Filter buttons */}
                  <div className="flex items-center space-x-3">
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md ${
                          filter === 'all'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        All
                      </button>
                          <button
                        onClick={() => setFilter('published')}
                        className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                          filter === 'published'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Published
                          </button>
                          <button
                        onClick={() => setFilter('draft')}
                        className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md ${
                          filter === 'draft'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Drafts
                          </button>
            </div>
          </div>
      </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {getFilteredPosts().length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-500 mb-4">
                        {filter === 'all' 
                          ? "You haven't created any blog posts yet" 
                          : `No ${filter} posts found`
                        }
                    </p>
              <Link
                href="/convert"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                      Create Your First Post
              </Link>
                </div>
                ) : (
                    getFilteredPosts().map((post) => (
                      <div key={post._id} className="group relative bg-white hover:bg-gray-50 transition-all duration-300 border-l-4 border-transparent hover:border-blue-500 hover:shadow-md">
                        <div className="p-6">
                          <div className="flex items-start justify-between space-x-6">
                            
                            {/* Left Side - Thumbnail and Content */}
                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                              
                              {/* Enhanced Thumbnail */}
                              <div className="flex-shrink-0 relative">
                                {post.thumbnail ? (
                                  <div className="relative w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <img
                                      src={post.thumbnail}
                                      alt={`Thumbnail for ${post.title}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                </div>
                                    
                                    {/* Enhanced Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
                                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                        <div className="bg-white bg-opacity-95 rounded-full p-3 shadow-xl">
                                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                          </svg>
              </div>
            </div>
          </div>
                                  </div>
                                ) : (
                                  <div className="w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Enhanced Post Content */}
                              <div className="flex-1 min-w-0 space-y-3">
                                
                                {/* Title and Status Row */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                      {post.title}
                                    </h3>
                                    
                                    {/* Status and Folder Badges */}
                                    <div className="flex items-center space-x-3 mb-3">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                        post.status === 'published' 
                                          ? 'bg-green-50 text-green-700 border border-green-200' 
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                          post.status === 'published' ? 'bg-green-400' : 'bg-amber-400'
                                        }`}></div>
                                        {post.status === 'published' ? 'Published' : 'Draft'}
                                      </span>
                                      
                                      <span 
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm border-2 border-white"
                                        style={{ 
                                          backgroundColor: post.folder ? (getFolderById(post.folder)?.color || '#6B7280') : '#6B7280',
                                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        title={post.folder ? `Folder: ${getFolderById(post.folder)?.name || 'Unknown'}` : 'No folder assigned'}
                                      >
                                        📁 {post.folder ? (getFolderById(post.folder)?.name || 'Unknown Folder') : 'Uncategorized'}
                                      </span>
                    </div>
                    </div>
                  </div>
                                
                                {/* Enhanced Metadata */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="font-medium">{post.wordCount.toLocaleString()} words</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span>{post.contentAnalysis.contentType}</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatDate(post.createdAt)}</span>
                                  </div>
                                </div>

                                {/* Enhanced Feature Indicators Row */}
                                <div className="flex items-center space-x-2">
                                  {post.seoOptimized && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm">
                                      <svg className="w-3 h-3 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      SEO Optimized
                    </span>
                                  )}
                                  
                                  {post.hasScreenshots && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                                      <svg className="w-3 h-3 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {post.screenshotCount} Screenshot{post.screenshotCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  
                                  {post.hasTableOfContents && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                                      <svg className="w-3 h-3 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                      </svg>
                                      Table of Contents
                                    </span>
                                  )}
                  </div>
                </div>
                            </div>

                            {/* Right Side - Controls */}
                            <div className="flex-shrink-0 space-y-4">
                              
                              {/* Enhanced Folder Selector */}
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  📁 Folder
                                </label>
                                <div className="relative">
                                  <select
                                    value={post.folder || ''}
                                    onChange={(e) => handleFolderChange(post._id, e.target.value || null)}
                                    disabled={updatingPosts.has(post._id)}
                                    className={`w-full text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-2 pl-3 pr-8 font-medium shadow-sm bg-white ${
                                      updatingPosts.has(post._id) 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                        : 'hover:border-blue-300 transition-all duration-200'
                                    } ${post.folder ? 'text-gray-900' : 'text-gray-500'}`}
                                  >
                                    <option value="" className="text-gray-500">
                                      Uncategorized
                                    </option>
                                    {folders.map((folder) => (
                                      <option 
                                        key={folder.id} 
                                        value={folder.id}
                                        className="text-gray-900"
                                      >
                                        {folder.name}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  {/* Loading spinner */}
                                  {updatingPosts.has(post._id) && (
                                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
                                  )}
                                  
                                  {/* Folder Color Indicator */}
                                  {post.folder && (
                                    <div 
                                      className="absolute right-10 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full shadow-sm border border-white"
                                      style={{ backgroundColor: getFolderById(post.folder)?.color || '#6B7280' }}
                                      title={getFolderById(post.folder)?.name || 'Unknown Folder'}
                                    ></div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Enhanced Action Buttons */}
                              <div className="flex flex-col space-y-2">
                  <Link
                                  href={`/posts/${post._id}`}
                                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Post
                  </Link>
                                
                                <a
                                  href={post.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                  Watch Video
                                </a>
                                
                                <button
                                  onClick={() => {
                                    setShowDeleteModal(true);
                                    setPostToDelete(post);
                                  }}
                                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-sm font-medium rounded-lg border border-gray-300 hover:border-red-300 shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                </div>
              </div>
                              </div>
                            </div>
                              </div>
                  ))
                )}
                </div>
              </div>
            </div>
                            </div>
                          </div>
            </div>

          {/* Create Folder Modal */}
          {showCreateFolder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Folder</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g. Tutorials, Reviews, Interviews"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Color
                    </label>
                    <div className="flex space-x-2">
                      {folderColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewFolderColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newFolderColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                      setNewFolderColor('#3B82F6');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                            </button>
                  <button
                    type="button"
                    onClick={createFolder}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Folder
                            </button>
                          </div>
              </div>
            </div>
          )}

          {/* Edit Folder Modal */}
          {editingFolder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Folder</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editFolderName" className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      id="editFolderName"
                      defaultValue={editingFolder.name}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Color
                    </label>
                    <div className="flex space-x-2">
                      {folderColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewFolderColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            (newFolderColor === color || (newFolderColor === '#3B82F6' && editingFolder.color === color)) ? 'border-gray-400 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                    </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFolder(null);
                      setNewFolderColor('#3B82F6');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('editFolderName') as HTMLInputElement;
                      updateFolder(editingFolder.id, nameInput.value, newFolderColor === '#3B82F6' ? editingFolder.color : newFolderColor);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Save Changes
                  </button>
                    </div>
                  </div>
            </div>
          )}

          {/* Enhanced Delete Confirmation Modal */}
          {showDeleteModal && postToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Delete Blog Post</h3>
                      <p className="text-sm text-gray-500">This action cannot be undone</p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <p className="text-gray-700 mb-3">
                      Are you sure you want to permanently delete this blog post?
                    </p>
                    
                    {/* Post Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        {postToDelete.thumbnail ? (
                          <img
                            src={postToDelete.thumbnail}
                            alt={`Thumbnail for ${postToDelete.title}`}
                            className="w-16 h-10 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {postToDelete.title}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>{postToDelete.wordCount.toLocaleString()} words</span>
                            <span>•</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                              postToDelete.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {postToDelete.status}
                            </span>
                          </div>
                    </div>
                  </div>
                </div>
              </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-sm text-red-700">
                        <p className="font-medium">Warning:</p>
                        <p>This will permanently delete the blog post, including all screenshots and content. This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPostToDelete(null);
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (postToDelete) {
                        deletePost(postToDelete._id);
                        setShowDeleteModal(false);
                        setPostToDelete(null);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  )
} 