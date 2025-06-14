'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CheckIcon } from '@heroicons/react/20/solid'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function UpgradeSection() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Upgrade Your Plan</h2>
        </div>
        <p className="mt-2 text-gray-600">
          Choose the perfect plan for your video-to-blog conversion needs
        </p>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Upgrade functionality coming soon...</p>
      </div>
    </div>
  )
}
