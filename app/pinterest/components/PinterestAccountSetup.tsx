'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface PinterestAccountSetupProps {
  userSettings: any;
  setUserSettingsAction: (settings: any) => void;
}

export default function PinterestAccountSetup({ userSettings, setUserSettingsAction }: PinterestAccountSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [accessToken, setAccessToken] = useState(userSettings?.pinterest?.accessToken || '')
  const [refreshToken, setRefreshToken] = useState(userSettings?.pinterest?.refreshToken || '')
  const [businessAccountId, setBusinessAccountId] = useState(userSettings?.pinterest?.businessAccountId || '')
  const [defaultBoardId, setDefaultBoardId] = useState(userSettings?.pinterest?.defaultBoardId || '')
  const [defaultBoardName, setDefaultBoardName] = useState(userSettings?.pinterest?.defaultBoardName || '')
  const [boards, setBoards] = useState<any[]>([])
  const [isLoadingBoards, setIsLoadingBoards] = useState(false)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)
  
  const isConnected = userSettings?.pinterest?.connected || false
  const lastTested = userSettings?.pinterest?.lastTestedAt 
    ? new Date(userSettings.pinterest.lastTestedAt).toLocaleString() 
    : 'Never'

  const handleSaveSettings = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinterest: {
            ...userSettings.pinterest,
            accessToken,
            refreshToken,
            businessAccountId,
            defaultBoardId,
            defaultBoardName
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const data = await response.json()
      setUserSettingsAction(data)
      toast.success('Pinterest settings saved successfully')
    } catch (error: any) {
      console.error('Error saving Pinterest settings:', error)
      toast.error(`Failed to save settings: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/pinterest/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken
        }),
      })

      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Connection test failed')
      }

      // Update user settings with the latest connection status
      const updatedSettings = await fetch('/api/user/settings')
      const updatedData = await updatedSettings.json()
      setUserSettingsAction(updatedData)
      
      toast.success('Successfully connected to Pinterest!')
    } catch (error: any) {
      console.error('Pinterest connection test failed:', error)
      toast.error(`Connection test failed: ${error.message}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const fetchBoards = async () => {
    if (!accessToken) {
      toast.error('Please enter an access token first')
      return
    }

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

  const handleSelectBoard = (boardId: string, boardName: string) => {
    setDefaultBoardId(boardId)
    setDefaultBoardName(boardName)
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Pinterest Account Configuration
        </h3>
        
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Connect your Pinterest account to enable auto-posting and scheduling.</p>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-3">📋 Step-by-Step Setup Guide</p>
            <div className="space-y-2">
              <div className="text-xs text-blue-700">
                <span className="font-medium">Step 1:</span> Convert to Pinterest Business Account
                <a 
                  href="https://business.pinterest.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 font-medium underline hover:text-blue-900"
                >
                  Pinterest for Business
                </a>
              </div>
              
              <div className="text-xs text-blue-700">
                <span className="font-medium">Step 2:</span> Create Developer Account
                <a 
                  href="https://developers.pinterest.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 font-medium underline hover:text-blue-900"
                >
                  Pinterest Developer Portal
                </a>
              </div>
              
              <div className="text-xs text-blue-700">
                <span className="font-medium">Step 3:</span> Create an App
                <a 
                  href="https://developers.pinterest.com/apps/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 font-medium underline hover:text-blue-900"
                >
                  Create New App
                </a>
              </div>
              
              <div className="text-xs text-blue-700">
                <span className="font-medium">Step 4:</span> Get OAuth Credentials from your app's "OAuth" section
              </div>
              
              <div className="text-xs text-blue-700">
                <span className="font-medium">Step 5:</span> Fill in the credentials below and test connection
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600 font-medium">🔗 Quick Links:</p>
              <div className="flex flex-wrap gap-4 mt-1">
                <a href="https://developers.pinterest.com/docs/getting-started/authentication/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                  API Documentation
                </a>
                <a href="https://help.pinterest.com/en/business/article/get-a-business-account" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                  Business Account Help
                </a>
                <a href="https://developers.pinterest.com/docs/api/v5/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">
                  API Reference
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5 space-y-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
            {isConnected && (
              <span className="text-xs text-gray-500">
                Last tested: {lastTested}
              </span>
            )}
          </div>
          
          {/* Access Token */}
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
              Access Token
            </label>
            <div className="mt-1 relative">
              <input
                type={showAccessToken ? "text" : "password"}
                name="accessToken"
                id="accessToken"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 h-12 text-base text-gray-900 bg-white placeholder-gray-500"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your Pinterest API access token"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowAccessToken(!showAccessToken)}
              >
                {showAccessToken ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <p>Your Pinterest API access token. Get this from the Pinterest Developer Portal:</p>
              <ol className="mt-1 ml-4 list-decimal space-y-1">
                <li>Go to <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Pinterest Apps</a></li>
                <li>Create or select your app</li>
                <li>Go to "OAuth" section and copy your "Access Token"</li>
              </ol>
            </div>
          </div>
          
          {/* Refresh Token */}
          <div>
            <label htmlFor="refreshToken" className="block text-sm font-medium text-gray-700">
              Refresh Token
            </label>
            <div className="mt-1 relative">
              <input
                type={showRefreshToken ? "text" : "password"}
                name="refreshToken"
                id="refreshToken"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 h-12 text-base text-gray-900 bg-white placeholder-gray-500"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="Enter your Pinterest API refresh token"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowRefreshToken(!showRefreshToken)}
              >
                {showRefreshToken ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <p>Your Pinterest API refresh token for renewing access tokens:</p>
              <ol className="mt-1 ml-4 list-decimal space-y-1">
                <li>From the same app in <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Pinterest Apps</a></li>
                <li>In the "OAuth" section, copy your "Refresh Token"</li>
                <li>This token helps renew your access token automatically</li>
              </ol>
            </div>
          </div>
          
          {/* Business Account ID */}
          <div>
            <label htmlFor="businessAccountId" className="block text-sm font-medium text-gray-700">
              Business Account ID
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="businessAccountId"
                id="businessAccountId"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 h-12 text-base text-gray-900 bg-white placeholder-gray-500"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                placeholder="Will be auto-filled after connection test"
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <p>Your Pinterest business account ID:</p>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>This will be automatically filled when you test the connection above</li>
                <li>You can also find it in your <a href="https://business.pinterest.com/settings/account/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Pinterest Business Account Settings</a></li>
                <li>Required for API access to business features</li>
              </ul>
            </div>
          </div>
          
          {/* Default Board Selection */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="defaultBoard" className="block text-sm font-medium text-gray-700">
                Default Board
              </label>
              <button
                type="button"
                onClick={fetchBoards}
                disabled={isLoadingBoards || !accessToken}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoadingBoards ? 'Loading...' : 'Fetch Boards'}
              </button>
            </div>
            
            {boards.length > 0 ? (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {boards.map((board) => (
                    <li key={board.id} className="p-2 hover:bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handleSelectBoard(board.id, board.name)}
                        className={`w-full text-left px-2 py-1 rounded-md ${
                          defaultBoardId === board.id ? 'bg-blue-100 text-blue-800' : ''
                        }`}
                      >
                        {board.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-1">
                <input
                  type="text"
                  name="defaultBoardName"
                  id="defaultBoardName"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 h-12 text-base text-gray-900 bg-gray-50 placeholder-gray-500"
                  value={defaultBoardName}
                  onChange={(e) => setDefaultBoardName(e.target.value)}
                  placeholder="Selected board name"
                  readOnly
                />
              </div>
            )}
            <div className="mt-1 text-xs text-gray-500">
              <p>Select the default board for posting pins:</p>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>Click "Fetch Boards" above to load your Pinterest boards</li>
                <li>Select a board from the list that appears</li>
                <li>You can create new boards in your <a href="https://www.pinterest.com/settings/boards/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Pinterest Board Settings</a></li>
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isConnecting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isConnecting ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !accessToken}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
