import mongoose from 'mongoose'

// User usage tracking schema
const UsageSchema = new mongoose.Schema({
  videosThisMonth: {
    type: Number,
    default: 0,
  },
  storageUsedGB: {
    type: Number,
    default: 0,
  },
  lastResetDate: {
    type: Date,
    default: Date.now,
  },
})

// Subscription schema
const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  subscriptionId: {
    type: String,
    required: true,
  },
  variantId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due', 'unpaid', 'paused'],
    required: true,
  },
  currentPeriodStart: {
    type: Date,
    required: true,
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
    default: 'FREE',
  },
  usage: {
    type: UsageSchema,
    default: () => ({}),
  },
  limits: {
    videosPerMonth: {
      type: Number,
      default: 2,
    },
    storageGB: {
      type: Number,
      default: 1,
    },
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
})

// Indexes for better performance
// Note: userId index is automatically created by unique: true
SubscriptionSchema.index({ customerId: 1 })
SubscriptionSchema.index({ subscriptionId: 1 })
SubscriptionSchema.index({ status: 1 })

// Method to reset monthly usage
SubscriptionSchema.methods.resetMonthlyUsage = function() {
  const now = new Date()
  const lastReset = this.usage.lastResetDate
  const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                     now.getFullYear() !== lastReset.getFullYear()

  if (shouldReset) {
    this.usage.videosThisMonth = 0
    this.usage.lastResetDate = now
    return this.save()
  }
  
  return Promise.resolve(this)
}

// Method to increment video usage
SubscriptionSchema.methods.incrementVideoUsage = function() {
  this.usage.videosThisMonth += 1
  return this.save()
}

// Method to update storage usage
SubscriptionSchema.methods.updateStorageUsage = function(sizeGB: number) {
  this.usage.storageUsedGB += sizeGB
  return this.save()
}

// Static method to find by user ID
SubscriptionSchema.statics.findByUserId = function(userId: string) {
  return this.findOne({ userId })
}

// Static method to create or update subscription
SubscriptionSchema.statics.createOrUpdate = function(subscriptionData: any) {
  return this.findOneAndUpdate(
    { userId: subscriptionData.userId },
    subscriptionData,
    { upsert: true, new: true }
  )
}

export interface ISubscription {
  userId: string
  email: string
  customerId: string
  subscriptionId: string
  variantId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  plan: string
  usage: {
    videosThisMonth: number
    storageUsedGB: number
    lastResetDate: Date
  }
  limits: {
    videosPerMonth: number
    storageGB: number
  }
  webhookData: any
  resetMonthlyUsage(): Promise<any>
  incrementVideoUsage(): Promise<any>
  updateStorageUsage(sizeGB: number): Promise<any>
}

export interface ISubscriptionModel extends mongoose.Model<ISubscription> {
  findByUserId(userId: string): Promise<ISubscription | null>
  createOrUpdate(subscriptionData: any): Promise<ISubscription>
}

const Subscription = (mongoose.models.Subscription as ISubscriptionModel) || 
  mongoose.model<ISubscription, ISubscriptionModel>('Subscription', SubscriptionSchema)

export default Subscription 