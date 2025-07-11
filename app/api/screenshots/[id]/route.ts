import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Screenshot from '@/models/Screenshot'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const screenshot = await Screenshot.findById(id)
    
    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }
    
    // Return the image data with proper headers
    return new NextResponse(screenshot.imageData, {
      headers: {
        'Content-Type': screenshot.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error fetching screenshot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screenshot' },
      { status: 500 }
    )
  }
}