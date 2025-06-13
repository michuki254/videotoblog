'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface AIImageSettingsProps {
  userSettings: any;
  setUserSettingsAction: (settings: any) => void;
}

export default function AIImageSettings({ userSettings, setUserSettingsAction }: AIImageSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(userSettings?.pinterest?.aiImageSettings?.enabled ?? true)
  const [style, setStyle] = useState(userSettings?.pinterest?.aiImageSettings?.style || 'realistic')
  const [aspectRatio, setAspectRatio] = useState(userSettings?.pinterest?.aiImageSettings?.aspectRatio || '2:3')
  const [customPrompt, setCustomPrompt] = useState(userSettings?.pinterest?.aiImageSettings?.customPrompt || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinterest: {
            ...userSettings.pinterest,
            aiImageSettings: {
              enabled: isEnabled,
              style,
              aspectRatio,
              customPrompt
            }
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const data = await response.json()
      setUserSettingsAction(data)
      toast.success('AI image settings saved successfully')
    } catch (error: any) {
      console.error('Error saving AI image settings:', error)
      toast.error(`Failed to save settings: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          AI Image Generation Settings
        </h3>
        
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Configure how AI-generated images for Pinterest pins should look.</p>
        </div>
        
        <div className="mt-5 space-y-6">
          {/* Enable/Disable AI Image Generation */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isEnabled"
                name="isEnabled"
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isEnabled" className="font-medium text-gray-700">
                Enable AI Image Generation
              </label>
              <p className="text-gray-500">
                When enabled, you can generate AI images for your Pinterest pins.
              </p>
            </div>
          </div>
          
          {/* Image Style */}
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">
              Image Style
            </label>
            <div className="mt-1">
              <select
                id="style"
                name="style"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={!isEnabled}
              >
                <option value="realistic">Realistic</option>
                <option value="artistic">Artistic</option>
                <option value="minimalist">Minimalist</option>
                <option value="vibrant">Vibrant</option>
                <option value="custom">Custom (Use Custom Prompt)</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose the style of AI-generated images for your pins.
            </p>
          </div>
          
          {/* Aspect Ratio */}
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700">
              Aspect Ratio
            </label>
            <div className="mt-1">
              <select
                id="aspectRatio"
                name="aspectRatio"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={!isEnabled}
              >
                <option value="1:1">Square (1:1)</option>
                <option value="2:3">Portrait (2:3) - Recommended for Pinterest</option>
                <option value="9:16">Tall (9:16)</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Pinterest recommends a 2:3 aspect ratio for optimal display.
            </p>
          </div>
          
          {/* Custom Prompt */}
          <div>
            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">
              Custom Prompt Template
            </label>
            <div className="mt-1">
              <textarea
                id="customPrompt"
                name="customPrompt"
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={!isEnabled || style !== 'custom'}
                placeholder="E.g., Create a professional-looking image with soft lighting and muted colors."
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Add custom instructions for the AI image generator. This will be appended to the prompt when generating images.
            </p>
          </div>
          
          {/* Example Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700">Example Preview</h4>
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Sample prompt:</strong> Create a Pinterest-worthy image for a post titled "10 Tips for Better Sleep". 
                {style === 'realistic' && ' Style: photorealistic, high-quality photograph'}
                {style === 'artistic' && ' Style: artistic, painterly, creative'}
                {style === 'minimalist' && ' Style: minimalist, clean, simple design'}
                {style === 'vibrant' && ' Style: vibrant colors, eye-catching, bold'}
                {style === 'custom' && customPrompt ? ` ${customPrompt}` : ''}
              </p>
              <div className="mt-2 flex justify-center">
                <div 
                  className={`bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs
                    ${aspectRatio === '1:1' ? 'w-32 h-32' : 
                      aspectRatio === '2:3' ? 'w-24 h-36' : 
                      'w-20 h-36'}`}
                >
                  {aspectRatio} Preview
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
