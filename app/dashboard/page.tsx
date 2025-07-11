'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import DashboardSidebar from '../components/DashboardSidebar'

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

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [updatingPosts, setUpdatingPosts] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'words'>('recent');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Calculate stats
  const publishedCount = posts.filter(post => post.status === 'published').length;
  const draftsCount = posts.filter(post => post.status === 'draft').length;
  const totalWords = posts.reduce((acc, post) => acc + post.wordCount, 0);
  const avgWordsPerPost = posts.length > 0 ? Math.round(totalWords / posts.length) : 0;

  // Calculate growth (mock data for demo)
  const postsThisMonth = posts.filter(post => {
    const postDate = new Date(post.createdAt);
    const now = new Date();
    return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
  }).length;

  const folderColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#EC4899', // Pink
  ];

  useEffect(() => {
    if (isLoaded) {
      fetchPosts();
      loadFolders();
    }
  }, [isLoaded]);

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      const filteredPosts = getFilteredPosts();
      selectAllRef.current.indeterminate = 
        selectedPosts.size > 0 && selectedPosts.size < filteredPosts.length;
    }
  }, [selectedPosts, posts, filter, searchQuery, sortBy, selectedFolder]);

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

  const deleteFolder = (folderId: string) => {
    if (!confirm('Are you sure? Posts in this folder will be moved to Uncategorized.')) {
      return;
    }

    const postsInFolder = posts.filter(post => post.folder === folderId);
    postsInFolder.forEach(post => {
      updatePostFolder(post._id, null);
    });

    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    saveFolders(updatedFolders);

    if (selectedFolder === folderId) {
      setSelectedFolder(null);
    }
  };

  const updatePostFolder = async (postId: string, folderId: string | null) => {
    setUpdatingPosts(prev => new Set(prev).add(postId));
    
    try {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, folder: folderId || undefined } : post
        )
      );

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: folderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post folder');
      }

      showNotification('Folder updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating post folder:', error);
      fetchPosts(); // Reload to restore correct state
      showNotification('Failed to update folder', 'error');
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0`;
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${type === 'success' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
          }
        </svg>
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(500px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.contentAnalysis.keyTopics.some(topic => 
          topic.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'words':
          return b.wordCount - a.wordCount;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  };

  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
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
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data: PostsResponse = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      showNotification('Post deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting post:', err);
      showNotification('Failed to delete post', 'error');
    }
  };

  const bulkDeletePosts = async () => {
    try {
      const count = selectedPosts.size;
      
      // Delete posts one by one (you could optimize this with a bulk API endpoint)
      const deletePromises = Array.from(selectedPosts).map(postId => 
        fetch(`/api/posts?id=${postId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      setPosts(prevPosts => prevPosts.filter(post => !selectedPosts.has(post._id)));
      setSelectedPosts(new Set());
      setShowBulkDelete(false);
      showNotification(`${count} ${count === 1 ? 'post' : 'posts'} deleted successfully!`, 'success');
    } catch (err) {
      console.error('Error deleting posts:', err);
      showNotification('Failed to delete some posts', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          user={user ? {
            firstName: user.firstName || undefined,
            emailAddresses: user.emailAddresses,
            imageUrl: user.imageUrl || undefined
          } : undefined}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here's what's happening with your blog today
                  </p>
                </div>
                <Link
                  href="/convert"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Convert New Video
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Posts */}
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +{postsThisMonth} this month
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{posts.length}</h3>
                <p className="text-gray-600 text-sm mt-1">Total Posts</p>
              </div>

              {/* Published */}
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {Math.round((publishedCount / posts.length) * 100) || 0}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{publishedCount}</h3>
                <p className="text-gray-600 text-sm mt-1">Published</p>
              </div>

              {/* Total Words */}
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    ~{avgWordsPerPost} avg
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalWords.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm mt-1">Total Words</p>
              </div>

              {/* Drafts */}
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  {draftsCount > 0 && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      Action needed
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{draftsCount}</h3>
                <p className="text-gray-600 text-sm mt-1">Drafts</p>
              </div>
            </div>

            {/* Quick Actions & Folders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      href="/convert"
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Convert Video</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Create Folder</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {draftsCount > 0 && (
                      <button
                        onClick={() => setFilter('draft')}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">Review Drafts</span>
                        </div>
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">{draftsCount}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Folders */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      + New Folder
                    </button>
                  </div>
                  
                  {folders.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedFolder(null)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedFolder === null 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">All Posts</span>
                          <span className="text-xs text-gray-500">{posts.length}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedFolder('uncategorized')}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedFolder === 'uncategorized' 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Uncategorized</span>
                          <span className="text-xs text-gray-500">{getPostCountForFolder('uncategorized')}</span>
                        </div>
                      </button>

                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
                          className={`p-3 rounded-xl border-2 transition-all relative group cursor-pointer ${
                            selectedFolder === folder.id 
                              ? 'border-indigo-600 bg-indigo-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: folder.color }}
                              />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {folder.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{getPostCountForFolder(folder.id)}</span>
                          </div>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFolder(folder.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No folders yet</p>
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Create your first folder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Posts Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {getFilteredPosts().length} of {posts.length} posts
                      {selectedFolder && ` in ${selectedFolder === 'uncategorized' ? 'Uncategorized' : getFolderById(selectedFolder)?.name}`}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-400"
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white text-gray-900"
                    >
                      <option value="recent" className="text-gray-900">Most Recent</option>
                      <option value="title" className="text-gray-900">Title A-Z</option>
                      <option value="words" className="text-gray-900">Word Count</option>
                    </select>

                    {/* Filter */}
                    <div className="flex rounded-lg shadow-sm">
                      {(['all', 'published', 'draft'] as const).map((filterOption) => (
                        <button
                          key={filterOption}
                          onClick={() => setFilter(filterOption)}
                          className={`px-4 py-2 text-sm font-medium ${
                            filter === filterOption
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          } ${
                            filterOption === 'all' ? 'rounded-l-lg' : ''
                          } ${
                            filterOption === 'draft' ? 'rounded-r-lg' : ''
                          } border ${
                            filter === filterOption ? 'border-indigo-600' : 'border-gray-300'
                          }`}
                        >
                          {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedPosts.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-indigo-900">
                      {selectedPosts.size} {selectedPosts.size === 1 ? 'post' : 'posts'} selected
                    </span>
                    <button
                      onClick={() => setSelectedPosts(new Set())}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Clear selection
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBulkDelete(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Posts List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Select All Header */}
                {getFilteredPosts().length > 0 && (
                  <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                    <label className="flex items-center">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={getFilteredPosts().length > 0 && getFilteredPosts().every(post => selectedPosts.has(post._id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allPostIds = new Set(getFilteredPosts().map(post => post._id));
                            setSelectedPosts(allPostIds);
                          } else {
                            setSelectedPosts(new Set());
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Select all {getFilteredPosts().length} posts
                      </span>
                    </label>
                  </div>
                )}
                
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading posts...</p>
                  </div>
                ) : getFilteredPosts().length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery ? 'Try adjusting your search' : 'Create your first blog post to get started'}
                    </p>
                    {!searchQuery && (
                      <Link
                        href="/convert"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Create Your First Post
                      </Link>
                    )}
                  </div>
                ) : (
                  getFilteredPosts().map((post) => (
                    <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post._id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedPosts);
                              if (e.target.checked) {
                                newSelected.add(post._id);
                              } else {
                                newSelected.delete(post._id);
                              }
                              setSelectedPosts(newSelected);
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {post.thumbnail ? (
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={post.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                {post.title}
                              </h3>
                              
                              {/* Meta info */}
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span>{formatDate(post.createdAt)}</span>
                                <span>•</span>
                                <span>{post.wordCount.toLocaleString()} words</span>
                                <span>•</span>
                                <span>{post.contentAnalysis.contentType}</span>
                              </div>

                              {/* Tags */}
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  post.status === 'published' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {post.status}
                                </span>
                                
                                {post.seoOptimized && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    SEO
                                  </span>
                                )}
                                
                                {post.hasScreenshots && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {post.screenshotCount} screenshots
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {/* Folder Selector */}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 font-medium">Move to:</span>
                                <select
                                  value={post.folder || ''}
                                  onChange={(e) => updatePostFolder(post._id, e.target.value || null)}
                                  disabled={updatingPosts.has(post._id)}
                                  className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    updatingPosts.has(post._id) 
                                      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                      : 'hover:border-gray-400'
                                  }`}
                                  title="Move post to folder"
                                >
                                  <option value="" className="text-gray-900">📁 Uncategorized</option>
                                  {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id} className="text-gray-900">
                                      📁 {folder.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <Link
                                href={`/posts/${post._id}`}
                                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View post"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>

                              <a
                                href={post.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Watch video"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/>
                                </svg>
                              </a>

                              <button
                                onClick={() => {
                                  setPostToDelete(post);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete post"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Folder</h3>
              
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
                    placeholder="e.g., Tutorials, Reviews"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                    autoFocus
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
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          newFolderColor === color 
                            ? 'border-gray-800 scale-110 shadow-lg' 
                            : 'border-gray-300 hover:border-gray-400'
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 6c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this post?</p>
                <p className="text-sm text-gray-500 font-medium">{postToDelete.title}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 6c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Multiple Posts</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete {selectedPosts.size} selected {selectedPosts.size === 1 ? 'post' : 'posts'}?
                </p>
                <p className="text-sm text-gray-500">
                  All selected posts will be permanently removed.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkDelete(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={bulkDeletePosts}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete {selectedPosts.size} {selectedPosts.size === 1 ? 'Post' : 'Posts'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}