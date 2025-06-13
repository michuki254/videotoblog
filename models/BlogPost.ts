import mongoose, { Document, Schema } from 'mongoose'

export interface IBlogPost extends Document {
  userId: string
  clerkId: string
  title: string
  content: string
  videoUrl: string
  videoId: string
  thumbnail?: string
  primaryKeyphrase?: string
  folder?: string
  wordCount: number
  contentType: string
  status: 'draft' | 'published'
  seoOptimized: boolean
  hasScreenshots: boolean
  screenshotCount: number
  hasTableOfContents: boolean
  detailLevel: string
  wordpress?: {
    postId: number
    url: string
    publishedAt: Date
    status: string
  }
  contentAnalysis: {
    contentType: string
    confidence: number
    reasoning: string
    targetAudience: string
    keyTopics: string[]
    suggestedTone: string
  }
  createdAt: Date
  updatedAt: Date
}

const BlogPostSchema = new Schema<IBlogPost>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  clerkId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  primaryKeyphrase: {
    type: String,
  },
  folder: {
    type: String,
  },
  wordCount: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  seoOptimized: {
    type: Boolean,
    default: false,
  },
  hasScreenshots: {
    type: Boolean,
    default: false,
  },
  screenshotCount: {
    type: Number,
    default: 0,
  },
  hasTableOfContents: {
    type: Boolean,
    default: false,
  },
  detailLevel: {
    type: String,
    required: true,
  },
  wordpress: {
    postId: { type: Number },
    url: { type: String },
    publishedAt: { type: Date },
    status: { type: String },
  },
  contentAnalysis: {
    contentType: { type: String, required: true },
    confidence: { type: Number, required: true },
    reasoning: { type: String, required: true },
    targetAudience: { type: String, required: true },
    keyTopics: [{ type: String }],
    suggestedTone: { type: String, required: true },
  },
}, {
  timestamps: true,
})

// Create indexes for better query performance
BlogPostSchema.index({ clerkId: 1, createdAt: -1 })
BlogPostSchema.index({ videoId: 1 })
BlogPostSchema.index({ status: 1 })

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema) 