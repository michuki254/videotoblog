import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ToastProvider from './components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VideoBlog AI - Transform Videos into Engaging Blog Posts',
  description: 'Convert YouTube videos, podcasts, and presentations into SEO-optimized blog content in minutes. Powered by advanced AI with automatic screenshots, headlines, and formatting.',
  keywords: 'video to blog, AI content conversion, YouTube to blog, SEO content, video transcription',
  authors: [{ name: 'VideoBlog AI' }],
  robots: 'index, follow',
  openGraph: {
    title: 'VideoBlog AI - Transform Videos into Engaging Blog Posts',
    description: 'Convert YouTube videos into SEO-optimized blog content with AI',
    type: 'website',
    url: 'https://videoblog-ai.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VideoBlog AI - Transform Videos into Engaging Blog Posts',
    description: 'Convert YouTube videos into SEO-optimized blog content with AI',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ToastProvider />
        {children}
      </body>
    </html>
    </ClerkProvider>
  )
}
