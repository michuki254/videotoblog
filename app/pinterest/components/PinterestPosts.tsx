'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface PinterestPostsProps {
  userSettings: any;
}

export default function PinterestPosts({ userSettings }: PinterestPostsProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [boardId, setBoardId] = useState(userSettings?.pinterest?.defaultBoardId || '')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [boards, setBoards] = useState<any[]>([])
  const [isLoadingBoards, setIsLoadingBoards] = useState(false)
  const [scheduledPins, setScheduledPins] = useState<any[]>([])
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const isConnected = userSettings?.pinterest?.connected || false

  // Fetch boards on component mount
  useEffect(() => {
    if (isConnected) {
      fetchBoards()
      fetchScheduledPins()
    }
  }, [isConnected])

  const fetchBoards = async () => {
    setIsLoadingBoards(true)
    try {
      const response = await fetch('/api/pinterest/boards')
      
      if (!response.ok) {
        throw new Error('Failed to fetch boards')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch boards')
      }
      
      setBoards(data.boards)
    } catch (error: any) {
      console.error('Error fetching Pinterest boards:', error)
      toast.error(`Failed to fetch boards: ${error.message}`)
    } finally {
      setIsLoadingBoards(false)
    }
  }

  const fetchScheduledPins = async () => {
    setIsLoadingScheduled(true)
    try {
      const response = await fetch('/api/pinterest/publish')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled pins')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch scheduled pins')
      }
      
      setScheduledPins(data.scheduledPins || [])
    } catch (error: any) {
      console.error('Error fetching scheduled pins:', error)
      toast.error(`Failed to fetch scheduled pins: ${error.message}`)
    } finally {
      setIsLoadingScheduled(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!title && !description) {
      toast.error('Please provide a title or description for image generation')
      return
    }

    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/pinterest/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postTitle: title,
          postContent: description,
          style: userSettings?.pinterest?.aiImageSettings?.style || 'realistic',
          aspectRatio: userSettings?.pinterest?.aiImageSettings?.aspectRatio || '2:3'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setImageUrl(data.imageUrl)
      toast.success('AI image generated successfully!')
    } catch (error: any) {
      console.error('Error generating AI image:', error)
      toast.error(`Failed to generate image: ${error.message}`)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handlePublish = async () => {
    if (!title || !imageUrl || !boardId) {
      toast.error('Title, image URL, and board are required')
      return
    }

    setIsPosting(true)
    try {
      const response = await fetch('/api/pinterest/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          link,
          boardId,
          scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish pin')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to publish pin')
      }

      // Reset form
      setTitle('')
      setDescription('')
      setImageUrl('')
      setLink('')
      setScheduledTime('')

      // Refresh scheduled pins list if we scheduled a pin
      if (data.scheduled) {
        fetchScheduledPins()
      }

      toast.success(data.scheduled ? 'Pin scheduled successfully!' : 'Pin published successfully!')
    } catch (error: any) {
      console.error('Error publishing pin:', error)
      toast.error(`Failed to publish pin: ${error.message}`)
    } finally {
      setIsPosting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Pinterest Account Not Connected</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please connect your Pinterest account in the Account Setup tab before creating posts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Pin Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create Pinterest Pin
          </h3>
          
          <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Title */}
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title*
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white placeholder-gray-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the title for your Pinterest pin"
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white placeholder-gray-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for your Pinterest pin"
                />
              </div>
            </div>

            {/* Image URL with AI generation */}
            <div className="sm:col-span-6">
              <div className="flex justify-between items-center">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Image URL*
                </label>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || (!title && !description)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Generating...' : 'Generate AI Image'}
                </button>
              </div>
              <div className="mt-1">
                <input
                  type="text"
                  name="imageUrl"
                  id="imageUrl"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white placeholder-gray-500"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL or generate one with AI"
                />
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img 
                    src={imageUrl} 
                    alt="Pin preview" 
                    className="h-40 object-contain rounded-md border border-gray-200" 
                  />
                </div>
              )}
            </div>

            {/* Link */}
            <div className="sm:col-span-6">
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                Link URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="link"
                  id="link"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white placeholder-gray-500"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Optional: Enter a link URL for your pin"
                />
              </div>
            </div>

            {/* Board Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="board" className="block text-sm font-medium text-gray-700">
                Board*
              </label>
              <div className="mt-1">
                <select
                  id="board"
                  name="board"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                >
                  <option value="">Select a board</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Time */}
            <div className="sm:col-span-3">
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                Schedule Time (optional)
              </label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  name="scheduledTime"
                  id="scheduledTime"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 bg-white"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPosting || !title || !imageUrl || !boardId}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPosting ? 'Publishing...' : scheduledTime ? 'Schedule Pin' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Pins List */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Scheduled Pins
            </h3>
            <button
              type="button"
              onClick={fetchScheduledPins}
              disabled={isLoadingScheduled}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoadingScheduled ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {isLoadingScheduled ? (
            <div className="text-center py-10">
              <div className="animate-pulse">Loading scheduled pins...</div>
            </div>
          ) : scheduledPins.length > 0 ? (
            <div className="mt-5 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Board
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Scheduled For
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {scheduledPins.map((pin) => (
                    <tr key={pin.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {pin.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {pin.board?.name || 'Unknown board'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(pin.scheduled_time).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">No scheduled pins found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
