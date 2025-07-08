const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function checkClerkConnection() {
  try {
    const mongoUri = process.env.DATABASE_URL
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray()
    console.log(`\nAnalyzing ${users.length} users for Clerk connection:\n`)
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`  📧 Email: ${user.email}`)
      console.log(`  🆔 Clerk ID: ${user.clerkId}`)
      console.log(`  👤 Name: ${user.firstName || 'Not set'} ${user.lastName || 'Not set'}`)
      console.log(`  🔑 Role: ${user.role || 'USER'}`)
      console.log(`  📅 Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}`)
      console.log(`  🔗 Image URL: ${user.imageUrl || 'Not set'}`)
      
      // Analyze email pattern
      if (user.email.includes('@temp.com')) {
        console.log(`  ⚠️  WARNING: This appears to be a temporary Clerk email`)
        console.log(`  💡 This usually means:`)
        console.log(`     - User signed up but didn't verify their email`)
        console.log(`     - User is using a test/development account`)
        console.log(`     - Email verification is pending`)
      } else {
        console.log(`  ✅ This appears to be a real email address`)
      }
      
      // Check Clerk ID format
      if (user.clerkId && user.clerkId.startsWith('user_')) {
        console.log(`  ✅ Valid Clerk ID format`)
      } else {
        console.log(`  ❌ Invalid or missing Clerk ID`)
      }
      
      console.log(`  📊 Connection Status: ${user.email.includes('@temp.com') ? 'TEMPORARY/UNVERIFIED' : 'VERIFIED'}`)
      console.log('')
    })
    
    // Recommendations
    console.log('🔍 RECOMMENDATIONS:')
    const tempUsers = users.filter(u => u.email.includes('@temp.com'))
    if (tempUsers.length > 0) {
      console.log('❗ You have temporary/unverified users. To fix this:')
      console.log('1. Go to your application and complete email verification')
      console.log('2. Or sign up with a new, real email address')
      console.log('3. Then run the admin setup script with the verified email')
      console.log('')
      console.log('💡 Current admin user will work, but for production use a verified email')
    } else {
      console.log('✅ All users appear to have verified email addresses')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkClerkConnection() 