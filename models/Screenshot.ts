import mongoose, { Document, Schema } from 'mongoose'

export interface IScreenshot extends Document {
  blogPostId: mongoose.Types.ObjectId
  videoId: string
  timestamp: number
  imageData: Buffer
  contentType: string
  isThumbnail?: boolean
  createdAt: Date
  updatedAt: Date
}

const ScreenshotSchema = new Schema<IScreenshot>({
  blogPostId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true,
    index: true,
  },
  videoId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  imageData: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
    default: 'image/png',
  },
  isThumbnail: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Create compound index for efficient querying
ScreenshotSchema.index({ videoId: 1, timestamp: 1 })
ScreenshotSchema.index({ blogPostId: 1, timestamp: 1 })

export default mongoose.models.Screenshot || mongoose.model<IScreenshot>('Screenshot', ScreenshotSchema)