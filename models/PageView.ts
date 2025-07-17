import mongoose from 'mongoose'

const PageViewSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: false, // Can be anonymous
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  duration: {
    type: Number, // Time spent on page in seconds
    default: 0,
  },
  converted: {
    type: Boolean, // Did this view lead to a conversion (signup, purchase, etc)
    default: false,
  },
  conversionType: {
    type: String,
    enum: ['signup', 'trial', 'purchase', 'download', null],
    default: null,
  },
  referrer: {
    type: String,
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop',
  },
  browser: {
    type: String,
  },
  country: {
    type: String,
  },
})

// Indexes for analytics queries
PageViewSchema.index({ postId: 1, viewedAt: -1 })
PageViewSchema.index({ viewedAt: -1 })
PageViewSchema.index({ converted: 1, conversionType: 1 })

// Static method to track page view
PageViewSchema.statics.trackView = function(viewData: any) {
  return this.create(viewData)
}

// Static method to get view count for a post
PageViewSchema.statics.getViewCount = function(postId: string) {
  return this.countDocuments({ postId })
}

// Static method to get conversion count for a post
PageViewSchema.statics.getConversionCount = function(postId: string) {
  return this.countDocuments({ postId, converted: true })
}

export interface IPageView {
  postId: mongoose.Types.ObjectId
  userId?: string
  sessionId: string
  viewedAt: Date
  duration: number
  converted: boolean
  conversionType?: string
  referrer?: string
  device: string
  browser?: string
  country?: string
}

export interface IPageViewModel extends mongoose.Model<IPageView> {
  trackView(viewData: any): Promise<IPageView>
  getViewCount(postId: string): Promise<number>
  getConversionCount(postId: string): Promise<number>
}

const PageView = (mongoose.models.PageView as IPageViewModel) || 
  mongoose.model<IPageView, IPageViewModel>('PageView', PageViewSchema)

export default PageView