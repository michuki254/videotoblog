# Video to Blog Post Converter - Project Setup Guide

## Overview
This guide will help you recreate the Video to Blog Post converter application with MongoDB-based screenshot storage.

## Prerequisites
- Node.js 18+ installed
- MongoDB database (MongoDB Atlas or local)
- OpenAI API key
- YouTube API key
- Clerk account for authentication
- LemonSqueezy account for payments (optional)

## Project Setup Checklist

### 1. Initial Setup
- [ ] Clone/create new Next.js project
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Configure MongoDB connection
- [ ] Set up Clerk authentication

### 2. Core Features Implementation
- [ ] Create database models (User, BlogPost, Screenshot, Subscription)
- [ ] Implement video URL validation
- [ ] Set up YouTube transcript fetching
- [ ] Implement OpenAI integration for content generation
- [ ] Create screenshot capture system with Playwright
- [ ] Implement MongoDB storage for screenshots

### 3. API Routes
- [ ] `/api/convert` - Main conversion endpoint
- [ ] `/api/screenshots` - Screenshot generation
- [ ] `/api/screenshots/[id]` - Screenshot retrieval
- [ ] `/api/posts` - Blog post CRUD operations
- [ ] `/api/subscriptions` - Subscription management

### 4. Frontend Pages
- [ ] Convert page with options
- [ ] Preview page with progress tracking
- [ ] Dashboard for viewing posts
- [ ] Individual post view
- [ ] Subscription/upgrade page

## Step-by-Step Implementation

### Step 1: Project Initialization

```bash
# Create Next.js project
npx create-next-app@latest videotoblog-v2 --typescript --tailwind --app

# Navigate to project
cd videotoblog-v2

# Install dependencies
npm install mongoose openai youtube-transcript playwright @clerk/nextjs react-markdown
npm install -D @types/node
```

### Step 2: Environment Variables

Create `.env.local` file:

```env
# MongoDB
DATABASE_URL=mongodb+srv://your-connection-string

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# YouTube
YOUTUBE_API_KEY=your-youtube-api-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# LemonSqueezy (optional)
LEMONSQUEEZY_API_KEY=your-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-secret
```

### Step 3: Database Models

#### User Model (`models/User.ts`)
```typescript
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  subscriptionStatus: String,
  subscriptionId: String,
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
```

#### BlogPost Model (`models/BlogPost.ts`)
```typescript
import mongoose from 'mongoose'

const BlogPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clerkId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  thumbnail: String,
  wordCount: { type: Number, required: true },
  screenshots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Screenshot' }],
  hasScreenshots: { type: Boolean, default: false },
  screenshotCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)
```

#### Screenshot Model (`models/Screenshot.ts`)
```typescript
import mongoose from 'mongoose'

const ScreenshotSchema = new mongoose.Schema({
  blogPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  videoId: { type: String, required: true },
  timestamp: { type: Number, required: true },
  imageData: { type: Buffer, required: true },
  contentType: { type: String, default: 'image/png' },
  isThumbnail: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Screenshot || mongoose.model('Screenshot', ScreenshotSchema)
```

### Step 4: Core API Implementation

#### Convert API (`app/api/convert/route.ts`)
Key implementation points:
1. Validate YouTube URL
2. Fetch video metadata and transcript
3. Create temporary blog post for screenshot association
4. Generate screenshots BEFORE content generation
5. Use OpenAI to generate blog content with embedded screenshot URLs
6. Update blog post with final content

#### Screenshot API (`app/api/screenshots/route.ts`)
Key implementation points:
1. Launch Playwright browser
2. Navigate to YouTube embed URL at timestamp
3. Capture screenshot as Buffer
4. Store in MongoDB with blog post association
5. Return API URLs for screenshots
6. Fallback to YouTube thumbnails if Playwright fails

### Step 5: Screenshot Storage Migration

#### Key Changes from File System to MongoDB:

1. **Storage Format**
   - Old: `/public/screenshots/videoId_timestamp.png`
   - New: MongoDB Binary data with API endpoint `/api/screenshots/{id}`

2. **Retrieval Method**
   - Old: Direct file serving
   - New: API endpoint that streams image data from MongoDB

3. **Cleanup**
   - Old: Manual file deletion needed
   - New: Automatic cleanup when blog post is deleted

### Step 6: Frontend Implementation

#### Convert Page Features:
- YouTube URL input
- Screenshot options (auto/custom/none)
- Writing style options
- SEO settings
- Word count selection

#### Preview Page Features:
- Progress tracking with steps
- Real-time content generation
- Error handling with detailed messages
- Automatic redirect on completion

### Step 7: Playwright Setup

```bash
# Install Playwright browsers
npx playwright install chromium

# For production, add to package.json:
"scripts": {
  "postinstall": "playwright install chromium"
}
```

### Step 8: Error Handling Best Practices

1. **API Error Responses**
   ```typescript
   return NextResponse.json({
     error: 'Descriptive error message',
     details: error.message
   }, { status: 500 })
   ```

2. **Cleanup on Failure**
   - Delete temporary blog posts
   - Clean up partial screenshots
   - Log detailed errors for debugging

3. **Fallback Mechanisms**
   - Use YouTube thumbnails if screenshot capture fails
   - Continue conversion even if screenshots fail
   - Provide default content for missing transcripts

### Step 9: Testing Checklist

- [ ] Test with various YouTube URLs
- [ ] Verify screenshot generation and storage
- [ ] Check error handling for invalid URLs
- [ ] Test with videos without transcripts
- [ ] Verify cleanup on deletion
- [ ] Test subscription limits
- [ ] Check responsive design

### Step 10: Deployment Considerations

1. **Environment Variables**
   - Set all variables in production environment
   - Use secure keys and rotate regularly

2. **MongoDB Indexes**
   - Add indexes for performance
   - Monitor query performance

3. **Playwright on Production**
   - May need specific buildpacks for Vercel/Netlify
   - Consider using Docker for consistent environment
   - Monitor memory usage

4. **Rate Limiting**
   - Implement rate limiting for API routes
   - Monitor OpenAI API usage
   - Set up alerts for quota limits

## Common Issues and Solutions

### Issue 1: Playwright Browser Not Found
**Solution**: Run `npx playwright install chromium` after deployment

### Issue 2: Screenshot URLs 404
**Solution**: Ensure screenshots are using MongoDB API URLs, not file paths

### Issue 3: OpenAI API Errors
**Solution**: Check API key validity and model name (use "gpt-4-turbo-preview")

### Issue 4: MongoDB Connection Issues
**Solution**: Whitelist IP addresses in MongoDB Atlas

## Maintenance Tasks

1. **Regular Cleanup**
   - Remove orphaned screenshots
   - Clean up failed conversions
   - Monitor storage usage

2. **Updates**
   - Keep dependencies updated
   - Monitor API deprecations
   - Update Playwright browsers

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API usage and costs
   - Track conversion success rates

## Future Enhancements

1. **Performance**
   - Implement caching for screenshots
   - Add CDN for image delivery
   - Optimize MongoDB queries

2. **Features**
   - Add batch conversion
   - Implement video chapter detection
   - Add multi-language support
   - Create WordPress plugin

3. **User Experience**
   - Add preview before saving
   - Implement auto-save
   - Add collaboration features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Playwright Documentation](https://playwright.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Clerk Documentation](https://clerk.com/docs)

## Support

For issues or questions:
1. Check the error logs in browser console
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check MongoDB connection status
5. Verify API keys are valid and have credits

---

This guide should help you recreate the entire project with MongoDB-based screenshot storage. Follow the steps in order and use the checklist to track your progress.