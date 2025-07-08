const mongoose = require('mongoose')
const path = require('path')

// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' })
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
    console.log('🚀 Setting up admin user...')
    
    // Check if MongoDB URI is available (try both common names)
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL
    if (!mongoUri) {
      console.error('❌ MongoDB connection string not found in environment variables')
      console.log('💡 Make sure you have MONGODB_URI or DATABASE_URL in your .env or .env.local file')
      process.exit(1)
    }
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Get email from command line argument
    const email = process.argv[2]
    if (!email) {
      console.error('❌ Please provide an email address')
      console.log('Usage: node setup-admin.js user@example.com')
      console.log('\n📋 Available users:')
      
      const users = await User.find({}).select('email firstName lastName role').limit(10)
      if (users.length === 0) {
        console.log('   No users found in database')
        console.log('   Please sign up first at your application, then run this script')
      } else {
        users.forEach(u => {
          console.log(`   - ${u.email} (${u.firstName || 'N/A'} ${u.lastName || 'N/A'}) - Role: ${u.role || 'USER'}`)
        })
      }
      process.exit(1)
    }

    // Find user by email
    console.log(`🔍 Looking for user: ${email}`)
    const user = await User.findOne({ email })
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\n📋 Available users:')
      const users = await User.find({}).select('email firstName lastName role').limit(10)
      if (users.length === 0) {
        console.log('   No users found in database')
        console.log('   Please sign up first at your application, then run this script')
      } else {
        users.forEach(u => {
          console.log(`   - ${u.email} (${u.firstName || 'N/A'} ${u.lastName || 'N/A'}) - Role: ${u.role || 'USER'}`)
        })
      }
      process.exit(1)
    }

    // Check if user is already an admin
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      console.log(`ℹ️  User ${user.email} is already an admin (${user.role})`)
      console.log(`✅ Admin dashboard available at: /admin`)
      process.exit(0)
    }

    // Update user role to ADMIN
    console.log(`⬆️  Promoting user to ADMIN role...`)
    user.role = 'ADMIN'
    user.isActive = true // Ensure user is active
    await user.save()

    console.log('\n🎉 SUCCESS! Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👤 User: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`🔑 Role: ${user.role}`)
    console.log(`✅ Status: ${user.isActive ? 'Active' : 'Inactive'}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🚀 Next Steps:')
    console.log('1. Sign in to your application with this email')
    console.log('2. Navigate to /admin or look for "Admin Panel" in the sidebar')
    console.log('3. Start managing your SaaS application!')
    console.log('\n📚 For more info, check ADMIN_SETUP.md')

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message)
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Make sure your MongoDB connection string is correct in .env.local')
    }
  } finally {
    await mongoose.disconnect()
    console.log('📡 Disconnected from MongoDB')
  }
}

// Handle script execution
if (require.main === module) {
  setupAdmin()
}

module.exports = { setupAdmin } 