import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/mongodb';
import BlogPost from '../../../../models/BlogPost';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view this post.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('🔍 API Route - Received ID:', { id, idType: typeof id, params });

    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ API Route - Invalid ID received:', id);
      return NextResponse.json(
        { error: 'Post ID is required and cannot be undefined' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error('❌ API Route - Invalid ObjectId format:', id);
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    console.log('✅ API Route - Valid ID, proceeding with database query');

    // Connect to database
    await connectToDatabase();

    // Get the specific blog post (only if it belongs to the authenticated user)
    const blogPost = await BlogPost.findOne({
      _id: id,
      clerkId: userId,
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    console.log('✅ API Route - Post found successfully:', blogPost._id);

    return NextResponse.json({
      post: blogPost,
    });

  } catch (error: unknown) {
    console.error('❌ API Route Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { folder } = await req.json();
    const { id: postId } = await params;

    console.log('🔄 Updating post folder:', { postId, folder, userId });

    await connectToDatabase();

    // Find the post and verify ownership
    const post = await BlogPost.findOne({ 
      _id: postId, 
      clerkId: userId 
    });

    if (!post) {
      console.log('❌ Post not found:', { postId, userId });
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log('📋 Current post data:', { 
      id: post._id, 
      title: post.title, 
      currentFolder: post.folder 
    });

    // Update the post
    const updatedPost = await BlogPost.findByIdAndUpdate(
      postId, 
      {
        folder: folder || undefined,
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );

    console.log('✅ Post updated successfully:', { 
      id: updatedPost._id, 
      newFolder: updatedPost.folder 
    });

    return NextResponse.json({ 
      success: true,
      message: 'Post updated successfully',
      post: {
        _id: updatedPost._id,
        folder: updatedPost.folder
      }
    });

  } catch (error) {
    console.error('❌ Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: postId } = await params;

    await connectToDatabase();

    // Find and delete the post (only if owned by the user)
    const deletedPost = await BlogPost.findOneAndDelete({ 
      _id: postId, 
      clerkId: userId 
    });

    if (!deletedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 