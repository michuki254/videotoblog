'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Define a simplified user type that matches what DashboardSidebar expects
interface SimplifiedUser {
  firstName?: string;
  emailAddresses?: { emailAddress: string }[];
  imageUrl?: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Convert Clerk user to the simplified format expected by DashboardSidebar
  const simplifiedUser: SimplifiedUser | undefined = user ? {
    firstName: user.firstName || undefined,
    emailAddresses: user.emailAddresses?.map(email => ({ emailAddress: email.emailAddress })),
    imageUrl: user.imageUrl
  } : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={simplifiedUser}
      />
      
      <div className="lg:pl-72">
        <main className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
