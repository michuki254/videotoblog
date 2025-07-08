import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'USER',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  totalVideosConverted: {
    type: Number,
    default: 0,
  },
  totalStorageUsed: {
    type: Number,
    default: 0,
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true,
    },
    newsletter: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
})

// Indexes
UserSchema.index({ clerkId: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

// Methods
UserSchema.methods.isAdmin = function() {
  return this.role === 'ADMIN' || this.role === 'SUPER_ADMIN'
}

UserSchema.methods.isSuperAdmin = function() {
  return this.role === 'SUPER_ADMIN'
}

UserSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date()
  return this.save()
}

// Static methods
UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ clerkId })
}

UserSchema.statics.createOrUpdate = function(userData: any) {
  return this.findOneAndUpdate(
    { clerkId: userData.clerkId },
    userData,
    { upsert: true, new: true }
  )
}

export interface IUser {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  lastLoginAt: Date
  totalVideosConverted: number
  totalStorageUsed: number
  settings: {
    notifications: boolean
    newsletter: boolean
  }
  createdAt?: Date
  updatedAt?: Date
  isAdmin(): boolean
  isSuperAdmin(): boolean
  updateLastLogin(): Promise<any>
}

export interface IUserModel extends mongoose.Model<IUser> {
  findByClerkId(clerkId: string): Promise<IUser | null>
  createOrUpdate(userData: any): Promise<IUser>
}

const User = mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema)

export default User 