import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../lib/mongodb';
import BlogPost from '../../../models/BlogPost';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view your posts.' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get all blog posts for this user, sorted by most recent first
    const blogPosts = await BlogPost.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .select({
        title: 1,
        videoUrl: 1,
        videoId: 1,
        thumbnail: 1,
        folder: 1,
        wordCount: 1,
        contentType: 1,
        status: 1,
        seoOptimized: 1,
        hasScreenshots: 1,
        screenshotCount: 1,
        hasTableOfContents: 1,
        detailLevel: 1,
        'contentAnalysis.contentType': 1,
        'contentAnalysis.targetAudience': 1,
        'contentAnalysis.keyTopics': 1,
        createdAt: 1,
        updatedAt: 1,
      });

    console.log('📥 API: Returning posts with folder data:', blogPosts.map(post => ({
      id: post._id,
      title: post.title.substring(0, 30) + '...',
      folder: post.folder
    })));

    return NextResponse.json({
      posts: blogPosts,
      total: blogPosts.length,
    });

  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to delete posts.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Delete the blog post (only if it belongs to the authenticated user)
    const deletedPost = await BlogPost.findOneAndDelete({
      _id: postId,
      clerkId: userId,
    });

    if (!deletedPost) {
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error: unknown) {
    console.error('Error deleting post:', error);
    
    return NextResponse.json({
      error: 'Failed to delete post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 