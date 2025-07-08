const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// User schema (simplified for script)
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  imageUrl: String,
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: Date.now },
  totalVideosConverted: { type: Number, default: 0 },
  totalStorageUsed: { type: Number, default: 0 },
  settings: {
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
  },
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get email from command line argument
    const email = process.argv[2]
    if (!email) {
      console.error('Please provide an email address: node scripts/setup-admin.js user@example.com')
      process.exit(1)
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      console.error(`User with email ${email} not found`)
      console.log('Available users:')
      const users = await User.find({}).select('email firstName lastName')
      users.forEach(u => console.log(`- ${u.email} (${u.firstName} ${u.lastName})`))
      process.exit(1)
    }

    // Update user role to ADMIN
    user.role = 'ADMIN'
    await user.save()

    console.log(`✅ Successfully promoted ${user.email} to ADMIN role`)
    console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`)
    console.log(`Role: ${user.role}`)
    console.log(`\nYou can now access the admin dashboard at: /admin`)

  } catch (error) {
    console.error('Error setting up admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

setupAdmin() 