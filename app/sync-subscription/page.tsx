'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SyncSubscriptionPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    subscriptionId: '1271217', // Pre-filled with the known subscription ID
    email: 'acmichuki@gmail.com', // Pre-filled with the known email
    plan: 'BASIC' // Pre-filled with the known plan
  })

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/subscriptions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Subscription synced successfully! Redirecting to account page...')
        setTimeout(() => {
          router.push('/account')
        }, 2000)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to sync subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to sync your subscription.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sync Subscription</h1>
          <p className="text-gray-600 text-sm">
            Manually link your LemonSqueezy purchase to your account
          </p>
        </div>

        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label htmlFor="subscriptionId" className="block text-sm font-medium text-gray-700 mb-1">
              Subscription ID
            </label>
            <input
              type="text"
              id="subscriptionId"
              value={formData.subscriptionId}
              onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1271217"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="BASIC">Basic ($9.99/month)</option>
              <option value="PRO">Pro ($29.99/month)</option>
              <option value="ENTERPRISE">Enterprise ($99.99/month)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Syncing...' : 'Sync Subscription'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/account')}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            ← Back to Account
          </button>
        </div>
      </div>
    </div>
  )
} 