'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { EnvelopeIcon, EnvelopeOpenIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied'
  createdAt: string
  updatedAt: string
}

interface StatusCounts {
  new: number
  read: number
  replied: number
  total: number
}

export default function AdminContactsPage() {
  const { user, isLoaded } = useUser()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [counts, setCounts] = useState<StatusCounts>({ new: 0, read: 0, replied: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const userRole = user?.publicMetadata?.role as string

  useEffect(() => {
    if (isLoaded && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) {
      fetchContacts()
    }
  }, [isLoaded, userRole, selectedStatus])

  const fetchContacts = async () => {
    try {
      const url = selectedStatus
        ? `/api/contact?status=${selectedStatus}`
        : '/api/contact'

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts)
        setCounts(data.counts)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (contactId: string, newStatus: 'new' | 'read' | 'replied') => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchContacts()
        if (selectedContact?._id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchContacts()
        setSelectedContact(null)
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
      </div>
    )
  }

  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to view this page.</p>
          <Link href="/dashboard" className="text-[#FF385C] hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#484848]">Contact Messages</h1>
              <p className="text-[#767676] mt-2">View and manage all contact form submissions</p>
            </div>
            <Link
              href="/admin"
              className="text-[#FF385C] hover:text-[#E0314F] transition-colors font-semibold"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${!selectedStatus ? 'ring-2 ring-[#FF385C]' : ''}`}
            >
              <div className="text-3xl font-bold text-[#484848] mb-1">{counts.total}</div>
              <div className="text-sm text-[#767676]">Total Messages</div>
            </button>

            <button
              onClick={() => setSelectedStatus('new')}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${selectedStatus === 'new' ? 'ring-2 ring-[#FF385C]' : ''}`}
            >
              <div className="text-3xl font-bold text-[#FF385C] mb-1">{counts.new}</div>
              <div className="text-sm text-[#767676]">New</div>
            </button>

            <button
              onClick={() => setSelectedStatus('read')}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${selectedStatus === 'read' ? 'ring-2 ring-[#FF385C]' : ''}`}
            >
              <div className="text-3xl font-bold text-[#00A699] mb-1">{counts.read}</div>
              <div className="text-sm text-[#767676]">Read</div>
            </button>

            <button
              onClick={() => setSelectedStatus('replied')}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${selectedStatus === 'replied' ? 'ring-2 ring-[#FF385C]' : ''}`}
            >
              <div className="text-3xl font-bold text-[#FC642D] mb-1">{counts.replied}</div>
              <div className="text-sm text-[#767676]">Replied</div>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-[#484848]">
                {selectedStatus ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Messages` : 'All Messages'}
              </h2>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-[#767676]">
                  <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No messages found</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-[#FAFAFA] transition-colors ${
                      selectedContact?._id === contact._id ? 'bg-[#FAFAFA]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#484848] truncate">{contact.name}</h3>
                          {contact.status === 'new' && (
                            <span className="bg-[#FF385C] text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">New</span>
                          )}
                        </div>
                        <p className="text-sm text-[#767676] truncate">{contact.subject}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {contact.status === 'new' ? (
                          <EnvelopeIcon className="h-5 w-5 text-[#FF385C]" />
                        ) : contact.status === 'replied' ? (
                          <CheckCircleIcon className="h-5 w-5 text-[#FC642D]" />
                        ) : (
                          <EnvelopeOpenIcon className="h-5 w-5 text-[#00A699]" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#767676]">
                      {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                      {new Date(contact.createdAt).toLocaleTimeString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg">
            {selectedContact ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#484848] mb-2">{selectedContact.subject}</h2>
                      <p className="text-[#767676]">
                        From: <span className="font-semibold">{selectedContact.name}</span>
                      </p>
                      <p className="text-[#767676]">
                        Email:{' '}
                        <a href={`mailto:${selectedContact.email}`} className="text-[#FF385C] hover:underline">
                          {selectedContact.email}
                        </a>
                      </p>
                      <p className="text-sm text-[#767676] mt-2">
                        Received: {new Date(selectedContact.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteContact(selectedContact._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(selectedContact._id, 'new')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedContact.status === 'new'
                          ? 'bg-[#FF385C] text-white'
                          : 'bg-gray-100 text-[#767676] hover:bg-gray-200'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => updateStatus(selectedContact._id, 'read')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedContact.status === 'read'
                          ? 'bg-[#00A699] text-white'
                          : 'bg-gray-100 text-[#767676] hover:bg-gray-200'
                      }`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => updateStatus(selectedContact._id, 'replied')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedContact.status === 'replied'
                          ? 'bg-[#FC642D] text-white'
                          : 'bg-gray-100 text-[#767676] hover:bg-gray-200'
                      }`}
                    >
                      Replied
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <h3 className="font-semibold text-[#484848] mb-3">Message:</h3>
                  <div className="bg-[#FAFAFA] rounded-lg p-4">
                    <p className="text-[#484848] whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>

                  <div className="mt-6">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                      className="inline-block bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E0314F] transition-colors shadow-md"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <EnvelopeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-[#484848] mb-2">No Message Selected</h3>
                  <p className="text-[#767676]">Select a message from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
