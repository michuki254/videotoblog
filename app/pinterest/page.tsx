'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import DashboardLayout from '../components/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import PinterestAccountSetup from './components/PinterestAccountSetup'
import PinterestPosts from './components/PinterestPosts'
import AIImageSettings from './components/AIImageSettings'

export default function PinterestPage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('account')
  const [isLoading, setIsLoading] = useState(true)
  const [userSettings, setUserSettings] = useState<any>(null)

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch('/api/user/settings')
        const data = await response.json()
        setUserSettings(data)
      } catch (error) {
        console.error('Error fetching user settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchUserSettings()
    }
  }, [isLoaded, user])

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Pinterest Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your Pinterest account, create and schedule posts, and generate AI images for Pinterest.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account Setup</TabsTrigger>
              <TabsTrigger value="posts">Posts & Scheduling</TabsTrigger>
              <TabsTrigger value="ai-images">AI Image Settings</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="account">
                {!isLoading && userSettings ? (
                  <PinterestAccountSetup 
                    userSettings={userSettings} 
                    setUserSettingsAction={setUserSettings} 
                  />
                ) : (
                  <div className="text-center py-10">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="posts">
                {!isLoading && userSettings ? (
                  <PinterestPosts 
                    userSettings={userSettings} 
                  />
                ) : (
                  <div className="text-center py-10">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="ai-images">
                {!isLoading && userSettings ? (
                  <AIImageSettings 
                    userSettings={userSettings} 
                    setUserSettingsAction={setUserSettings} 
                  />
                ) : (
                  <div className="text-center py-10">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
