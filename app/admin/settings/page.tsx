'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BeakerIcon,
  EnvelopeIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ServerIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ClockIcon,
  BoltIcon,
  PhotoIcon,
  CpuChipIcon,
  WifiIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  FireIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

interface Settings {
  general: {
    appName: string
    appDescription: string
    maintenanceMode: boolean
    maintenanceMessage: string
    supportEmail: string
    logoUrl: string
  }
  ai: {
    defaultModel: string
    maxTokens: number
    temperature: number
    enableScreenshots: boolean
    screenshotInterval: number
    enableContentAnalysis: boolean
  }
  lemonSqueezy: {
    storeId: string
    apiKey: string
    webhookSecret: string
    testMode: boolean
    planLimits: {
      [key: string]: {
        videosPerMonth: number
        storageGB: number
        maxVideoLength: number
      }
    }
  }
  email: {
    provider: string
    fromEmail: string
    fromName: string
    sendWelcomeEmail: boolean
    sendConversionNotification: boolean
  }
  rateLimits: {
    conversionsPerHour: number
    apiCallsPerMinute: number
    maxConcurrentConversions: number
  }
  security: {
    requireEmailVerification: boolean
    allowedDomains: string[]
    ipWhitelist: string[]
    enableRateLimiting: boolean
    enableCaptcha: boolean
  }
  integrations: {
    wordpress: { enabled: boolean; requireApiKey: boolean }
    medium: { enabled: boolean; requireApiKey: boolean }
    pinterest: { enabled: boolean; requireApiKey: boolean }
    youtube: { apiKey: string; quotaLimit: number }
  }
  analytics: {
    enableTracking: boolean
    googleAnalyticsId: string
    enableErrorReporting: boolean
    sentryDsn: string
  }
}

export default function AdminSettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Check admin access
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  // Fetch settings
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      
      // Ensure lemonSqueezy property exists with defaults if missing
      if (!data.settings.lemonSqueezy) {
        data.settings.lemonSqueezy = {
          storeId: '',
          apiKey: '',
          webhookSecret: '',
          testMode: false,
          planLimits: {
            free: { videosPerMonth: 2, storageGB: 1, maxVideoLength: 10 },
            basic: { videosPerMonth: 20, storageGB: 10, maxVideoLength: 30 },
            pro: { videosPerMonth: 100, storageGB: 50, maxVideoLength: 60 },
            enterprise: { videosPerMonth: -1, storageGB: -1, maxVideoLength: -1 }
          }
        }
      }
      
      setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      const data = await response.json()
      setSettings(data.settings)
      setHasChanges(false)
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async (section?: string) => {
    if (!confirm(`Are you sure you want to reset ${section || 'all'} settings to defaults?`)) return

    try {
      const url = section ? `/api/admin/settings?section=${section}` : '/api/admin/settings'
      const response = await fetch(url, { method: 'DELETE' })
      
      if (!response.ok) throw new Error('Failed to reset settings')
      
      const data = await response.json()
      setSettings(data.settings)
      setSaveMessage({ type: 'success', text: data.message })
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error resetting settings:', error)
      setSaveMessage({ type: 'error', text: 'Failed to reset settings. Please try again.' })
    }
  }

  const updateSetting = (section: string, key: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof Settings],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'ai', name: 'AI Configuration', icon: SparklesIcon },
    { id: 'lemonSqueezy', name: 'LemonSqueezy', icon: CreditCardIcon },
    { id: 'email', name: 'Email Settings', icon: EnvelopeIcon },
    { id: 'rateLimits', name: 'Rate Limits', icon: ClockIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: PuzzlePieceIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ]

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-spin"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-ping absolute inset-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 opacity-10 blur-3xl"></div>
          <div className="relative flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-orange-500" />
                Configure application settings and preferences
              </p>
            </div>
            
            {/* Save Status */}
            {saveMessage && (
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {saveMessage.type === 'success' ? (
                  <CheckIcon className="h-5 w-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                )}
                {saveMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="mt-8 space-y-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  hasChanges && !saving
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleReset()}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reset All to Defaults
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.appName}
                      onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Description
                    </label>
                    <textarea
                      value={settings.general.appDescription}
                      onChange={(e) => updateSetting('general', 'appDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600">Enable to show maintenance message to users</p>
                      </div>
                      <button
                        onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.general.maintenanceMode ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {settings.general.maintenanceMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={settings.general.maintenanceMessage}
                          onChange={(e) => updateSetting('general', 'maintenanceMessage', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Configuration */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default AI Model
                    </label>
                    <select
                      value={settings.ai.defaultModel}
                      onChange={(e) => updateSetting('ai', 'defaultModel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                      <option value="claude-2">Claude 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={settings.ai.maxTokens}
                      onChange={(e) => updateSetting('ai', 'maxTokens', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (0-2)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings.ai.temperature}
                      onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Screenshot Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.ai.screenshotInterval}
                      onChange={(e) => updateSetting('ai', 'screenshotInterval', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Screenshots</h3>
                      <p className="text-sm text-gray-600">Automatically capture screenshots from videos</p>
                    </div>
                    <button
                      onClick={() => updateSetting('ai', 'enableScreenshots', !settings.ai.enableScreenshots)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.ai.enableScreenshots ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.ai.enableScreenshots ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Content Analysis</h3>
                      <p className="text-sm text-gray-600">AI-powered content type detection and analysis</p>
                    </div>
                    <button
                      onClick={() => updateSetting('ai', 'enableContentAnalysis', !settings.ai.enableContentAnalysis)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.ai.enableContentAnalysis ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.ai.enableContentAnalysis ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LemonSqueezy Configuration */}
            {activeTab === 'lemonSqueezy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">LemonSqueezy Configuration</h2>
                
                {/* API Configuration */}
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store ID
                      </label>
                      <input
                        type="text"
                        value={settings.lemonSqueezy.storeId}
                        onChange={(e) => updateSetting('lemonSqueezy', 'storeId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your LemonSqueezy Store ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.lemonSqueezy.apiKey}
                        onChange={(e) => updateSetting('lemonSqueezy', 'apiKey', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your LemonSqueezy API Key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <input
                        type="password"
                        value={settings.lemonSqueezy.webhookSecret}
                        onChange={(e) => updateSetting('lemonSqueezy', 'webhookSecret', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your webhook signing secret"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Test Mode</h3>
                        <p className="text-sm text-gray-600">Use test environment for development</p>
                      </div>
                      <button
                        onClick={() => {
                          const newSettings = { ...settings }
                          newSettings.lemonSqueezy.testMode = !newSettings.lemonSqueezy.testMode
                          setSettings(newSettings)
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.lemonSqueezy.testMode ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.lemonSqueezy.testMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Limits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure the usage limits for each subscription plan. These should match your LemonSqueezy product configurations.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {settings.lemonSqueezy?.planLimits && Object.entries(settings.lemonSqueezy.planLimits).map(([planName, limits]) => (
                      <div key={planName} className="border border-gray-200 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 capitalize mb-4">
                          {planName} Plan
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Videos per Month
                            </label>
                            <input
                              type="number"
                              value={limits.videosPerMonth}
                              onChange={(e) => {
                                const newSettings = { ...settings }
                                newSettings.lemonSqueezy.planLimits[planName].videosPerMonth = parseInt(e.target.value)
                                setSettings(newSettings)
                                setHasChanges(true)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="-1 for unlimited"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Storage (GB)
                            </label>
                            <input
                              type="number"
                              value={limits.storageGB}
                              onChange={(e) => {
                                const newSettings = { ...settings }
                                newSettings.lemonSqueezy.planLimits[planName].storageGB = parseInt(e.target.value)
                                setSettings(newSettings)
                                setHasChanges(true)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="-1 for unlimited"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Video Length (minutes)
                            </label>
                            <input
                              type="number"
                              value={limits.maxVideoLength}
                              onChange={(e) => {
                                const newSettings = { ...settings }
                                newSettings.lemonSqueezy.planLimits[planName].maxVideoLength = parseInt(e.target.value)
                                setSettings(newSettings)
                                setHasChanges(true)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="-1 for unlimited"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">LemonSqueezy Setup Guide</h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Get your Store ID from LemonSqueezy dashboard → Settings → Store</li>
                    <li>Create an API key at LemonSqueezy → Settings → API</li>
                    <li>Set up webhook endpoint: <code className="bg-blue-100 px-1 rounded">{typeof window !== 'undefined' && window.location.origin}/api/webhooks/lemonsqueezy</code></li>
                    <li>Copy the webhook signing secret from LemonSqueezy</li>
                    <li>Ensure plan limits match your LemonSqueezy product configurations</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Settings</h2>
                
                {/* General Email Settings */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Provider
                      </label>
                      <select
                        value={settings.email.provider}
                        onChange={(e) => updateSetting('email', 'provider', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailgun">Mailgun</option>
                        <option value="ses">Amazon SES</option>
                        <option value="sendx">SendX</option>
                        <option value="mailchimp">Mailchimp Transactional</option>
                        <option value="postmark">Postmark</option>
                        <option value="resend">Resend</option>
                        <option value="smtp">Custom SMTP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="noreply@yourdomain.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your App Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Provider-specific Configuration */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Configuration</h3>
                  
                  {/* SendGrid */}
                  {settings.email.provider === 'sendgrid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SendGrid API Key
                      </label>
                      <input
                        type="password"
                        value={settings.email.sendgrid?.apiKey || ''}
                        onChange={(e) => {
                          const newSettings = { ...settings }
                          if (!newSettings.email.sendgrid) newSettings.email.sendgrid = { apiKey: '' }
                          newSettings.email.sendgrid.apiKey = e.target.value
                          setSettings(newSettings)
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="SG.xxxxxxxxxxxxx"
                      />
                      <p className="text-sm text-gray-500 mt-1">Get your API key from SendGrid Dashboard → Settings → API Keys</p>
                    </div>
                  )}

                  {/* Mailgun */}
                  {settings.email.provider === 'mailgun' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mailgun API Key
                        </label>
                        <input
                          type="password"
                          value={settings.email.mailgun?.apiKey || ''}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.mailgun) newSettings.email.mailgun = { apiKey: '', domain: '', region: 'us' }
                            newSettings.email.mailgun.apiKey = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="key-xxxxxxxxxxxxx"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Domain
                          </label>
                          <input
                            type="text"
                            value={settings.email.mailgun?.domain || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.mailgun) newSettings.email.mailgun = { apiKey: '', domain: '', region: 'us' }
                              newSettings.email.mailgun.domain = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="mg.yourdomain.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Region
                          </label>
                          <select
                            value={settings.email.mailgun?.region || 'us'}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.mailgun) newSettings.email.mailgun = { apiKey: '', domain: '', region: 'us' }
                              newSettings.email.mailgun.region = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="us">US</option>
                            <option value="eu">EU</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amazon SES */}
                  {settings.email.provider === 'ses' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Key ID
                          </label>
                          <input
                            type="password"
                            value={settings.email.ses?.accessKeyId || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.ses) newSettings.email.ses = { accessKeyId: '', secretAccessKey: '', region: 'us-east-1' }
                              newSettings.email.ses.accessKeyId = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="AKIAXXXXXXXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Access Key
                          </label>
                          <input
                            type="password"
                            value={settings.email.ses?.secretAccessKey || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.ses) newSettings.email.ses = { accessKeyId: '', secretAccessKey: '', region: 'us-east-1' }
                              newSettings.email.ses.secretAccessKey = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Your secret key"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AWS Region
                        </label>
                        <input
                          type="text"
                          value={settings.email.ses?.region || 'us-east-1'}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.ses) newSettings.email.ses = { accessKeyId: '', secretAccessKey: '', region: 'us-east-1' }
                            newSettings.email.ses.region = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="us-east-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* SendX */}
                  {settings.email.provider === 'sendx' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SendX API Key
                        </label>
                        <input
                          type="password"
                          value={settings.email.sendx?.apiKey || ''}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.sendx) newSettings.email.sendx = { apiKey: '', teamId: '' }
                            newSettings.email.sendx.apiKey = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Your SendX API Key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team ID
                        </label>
                        <input
                          type="text"
                          value={settings.email.sendx?.teamId || ''}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.sendx) newSettings.email.sendx = { apiKey: '', teamId: '' }
                            newSettings.email.sendx.teamId = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Your SendX Team ID"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Get your API credentials from SendX Dashboard → Settings → API</p>
                    </div>
                  )}

                  {/* Mailchimp Transactional */}
                  {settings.email.provider === 'mailchimp' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mailchimp Transactional API Key
                        </label>
                        <input
                          type="password"
                          value={settings.email.mailchimp?.apiKey || ''}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.mailchimp) newSettings.email.mailchimp = { apiKey: '', server: '' }
                            newSettings.email.mailchimp.apiKey = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="xxxxxxxxxxxxx-us1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Server Prefix
                        </label>
                        <input
                          type="text"
                          value={settings.email.mailchimp?.server || ''}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.mailchimp) newSettings.email.mailchimp = { apiKey: '', server: '' }
                            newSettings.email.mailchimp.server = e.target.value
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="us1, us2, etc."
                        />
                      </div>
                    </div>
                  )}

                  {/* Postmark */}
                  {settings.email.provider === 'postmark' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Server API Token
                      </label>
                      <input
                        type="password"
                        value={settings.email.postmark?.serverToken || ''}
                        onChange={(e) => {
                          const newSettings = { ...settings }
                          if (!newSettings.email.postmark) newSettings.email.postmark = { serverToken: '' }
                          newSettings.email.postmark.serverToken = e.target.value
                          setSettings(newSettings)
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="xxxx-xxxxx-xxxx-xxxx-xxxxx"
                      />
                      <p className="text-sm text-gray-500 mt-1">Get your Server API token from Postmark → Servers → API Tokens</p>
                    </div>
                  )}

                  {/* Resend */}
                  {settings.email.provider === 'resend' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resend API Key
                      </label>
                      <input
                        type="password"
                        value={settings.email.resend?.apiKey || ''}
                        onChange={(e) => {
                          const newSettings = { ...settings }
                          if (!newSettings.email.resend) newSettings.email.resend = { apiKey: '' }
                          newSettings.email.resend.apiKey = e.target.value
                          setSettings(newSettings)
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="re_xxxxxxxxxxxxx"
                      />
                      <p className="text-sm text-gray-500 mt-1">Get your API key from Resend Dashboard → API Keys</p>
                    </div>
                  )}

                  {/* Custom SMTP */}
                  {settings.email.provider === 'smtp' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtp?.host || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.smtp) newSettings.email.smtp = { host: '', port: 587, secure: false, auth: { user: '', pass: '' } }
                              newSettings.email.smtp.host = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="smtp.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Port
                          </label>
                          <input
                            type="number"
                            value={settings.email.smtp?.port || 587}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.smtp) newSettings.email.smtp = { host: '', port: 587, secure: false, auth: { user: '', pass: '' } }
                              newSettings.email.smtp.port = parseInt(e.target.value)
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="587"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtp?.auth.user || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.smtp) newSettings.email.smtp = { host: '', port: 587, secure: false, auth: { user: '', pass: '' } }
                              newSettings.email.smtp.auth.user = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={settings.email.smtp?.auth.pass || ''}
                            onChange={(e) => {
                              const newSettings = { ...settings }
                              if (!newSettings.email.smtp) newSettings.email.smtp = { host: '', port: 587, secure: false, auth: { user: '', pass: '' } }
                              newSettings.email.smtp.auth.pass = e.target.value
                              setSettings(newSettings)
                              setHasChanges(true)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Your password"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.email.smtp?.secure || false}
                          onChange={(e) => {
                            const newSettings = { ...settings }
                            if (!newSettings.email.smtp) newSettings.email.smtp = { host: '', port: 587, secure: false, auth: { user: '', pass: '' } }
                            newSettings.email.smtp.secure = e.target.checked
                            setSettings(newSettings)
                            setHasChanges(true)
                          }}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Use SSL/TLS (typically for port 465)
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Preferences */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Send Welcome Emails</h3>
                        <p className="text-sm text-gray-600">Send welcome email to new users</p>
                      </div>
                      <button
                        onClick={() => updateSetting('email', 'sendWelcomeEmail', !settings.email.sendWelcomeEmail)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.email.sendWelcomeEmail ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.email.sendWelcomeEmail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Conversion Notifications</h3>
                        <p className="text-sm text-gray-600">Notify users when conversion is complete</p>
                      </div>
                      <button
                        onClick={() => updateSetting('email', 'sendConversionNotification', !settings.email.sendConversionNotification)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.email.sendConversionNotification ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.email.sendConversionNotification ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Email Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Test Your Email Configuration</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    After saving your settings, you can test your email configuration by sending a test email.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Send Test Email
                  </button>
                </div>
              </div>
            )}

            {/* Rate Limits */}
            {activeTab === 'rateLimits' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Limits</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conversions per Hour
                    </label>
                    <input
                      type="number"
                      value={settings.rateLimits.conversionsPerHour}
                      onChange={(e) => updateSetting('rateLimits', 'conversionsPerHour', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum conversions allowed per user per hour</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Calls per Minute
                    </label>
                    <input
                      type="number"
                      value={settings.rateLimits.apiCallsPerMinute}
                      onChange={(e) => updateSetting('rateLimits', 'apiCallsPerMinute', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum API calls allowed per minute</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Conversions
                    </label>
                    <input
                      type="number"
                      value={settings.rateLimits.maxConcurrentConversions}
                      onChange={(e) => updateSetting('rateLimits', 'maxConcurrentConversions', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum simultaneous conversions per user</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Require Email Verification</h3>
                      <p className="text-sm text-gray-600">Users must verify email before access</p>
                    </div>
                    <button
                      onClick={() => updateSetting('security', 'requireEmailVerification', !settings.security.requireEmailVerification)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.requireEmailVerification ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Rate Limiting</h3>
                      <p className="text-sm text-gray-600">Protect against abuse with rate limits</p>
                    </div>
                    <button
                      onClick={() => updateSetting('security', 'enableRateLimiting', !settings.security.enableRateLimiting)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.enableRateLimiting ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.enableRateLimiting ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable CAPTCHA</h3>
                      <p className="text-sm text-gray-600">Add CAPTCHA to forms for bot protection</p>
                    </div>
                    <button
                      onClick={() => updateSetting('security', 'enableCaptcha', !settings.security.enableCaptcha)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.enableCaptcha ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.enableCaptcha ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Domain Whitelist</h3>
                  <p className="text-sm text-gray-600 mb-4">Only allow registrations from these domains (leave empty for all)</p>
                  <textarea
                    value={settings.security.allowedDomains.join('\n')}
                    onChange={(e) => updateSetting('security', 'allowedDomains', e.target.value.split('\n').filter(d => d.trim()))}
                    placeholder="example.com&#10;company.org"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* WordPress */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">WordPress</h3>
                      <button
                        onClick={() => {
                          const newIntegrations = { ...settings.integrations }
                          newIntegrations.wordpress.enabled = !newIntegrations.wordpress.enabled
                          setSettings({ ...settings, integrations: newIntegrations })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.integrations.wordpress.enabled ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.integrations.wordpress.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.integrations.wordpress.requireApiKey}
                        onChange={(e) => {
                          const newIntegrations = { ...settings.integrations }
                          newIntegrations.wordpress.requireApiKey = e.target.checked
                          setSettings({ ...settings, integrations: newIntegrations })
                          setHasChanges(true)
                        }}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Require API Key</label>
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Medium</h3>
                      <button
                        onClick={() => {
                          const newIntegrations = { ...settings.integrations }
                          newIntegrations.medium.enabled = !newIntegrations.medium.enabled
                          setSettings({ ...settings, integrations: newIntegrations })
                          setHasChanges(true)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.integrations.medium.enabled ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.integrations.medium.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.integrations.medium.requireApiKey}
                        onChange={(e) => {
                          const newIntegrations = { ...settings.integrations }
                          newIntegrations.medium.requireApiKey = e.target.checked
                          setSettings({ ...settings, integrations: newIntegrations })
                          setHasChanges(true)
                        }}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Require API Key</label>
                    </div>
                  </div>

                  {/* YouTube API */}
                  <div className="border border-gray-200 rounded-lg p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">YouTube API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={settings.integrations.youtube.apiKey}
                          onChange={(e) => {
                            const newIntegrations = { ...settings.integrations }
                            newIntegrations.youtube.apiKey = e.target.value
                            setSettings({ ...settings, integrations: newIntegrations })
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter YouTube API Key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Quota Limit
                        </label>
                        <input
                          type="number"
                          value={settings.integrations.youtube.quotaLimit}
                          onChange={(e) => {
                            const newIntegrations = { ...settings.integrations }
                            newIntegrations.youtube.quotaLimit = parseInt(e.target.value)
                            setSettings({ ...settings, integrations: newIntegrations })
                            setHasChanges(true)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Settings */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Monitoring</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Analytics Tracking</h3>
                      <p className="text-sm text-gray-600">Track user behavior and page views</p>
                    </div>
                    <button
                      onClick={() => updateSetting('analytics', 'enableTracking', !settings.analytics.enableTracking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.analytics.enableTracking ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.analytics.enableTracking ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable Error Reporting</h3>
                      <p className="text-sm text-gray-600">Automatically report errors to monitoring service</p>
                    </div>
                    <button
                      onClick={() => updateSetting('analytics', 'enableErrorReporting', !settings.analytics.enableErrorReporting)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.analytics.enableErrorReporting ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.analytics.enableErrorReporting ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.googleAnalyticsId}
                      onChange={(e) => updateSetting('analytics', 'googleAnalyticsId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sentry DSN
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.sentryDsn}
                      onChange={(e) => updateSetting('analytics', 'sentryDsn', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://xxxxx@sentry.io/xxxxx"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}