const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function findAndPromoteUser() {
  try {
    const targetClerkId = 'user_2yUfQ4pqPb9LpFwEN9mPqXLDyCs'
    
    const mongoUri = process.env.DATABASE_URL
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
    
    // First, let's see all users
    console.log('\n📋 All users in database:')
    const allUsers = await mongoose.connection.db.collection('users').find({}).toArray()
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. Clerk ID: ${u.clerkId}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Name: ${u.firstName || 'N/A'} ${u.lastName || 'N/A'}`)
      console.log(`   Role: ${u.role || 'USER'}`)
      console.log('')
    })
    
    // Look for the specific user
    console.log(`🔍 Looking for user with Clerk ID: ${targetClerkId}`)
    const user = await mongoose.connection.db.collection('users').findOne({ clerkId: targetClerkId })
    
    if (user) {
      console.log('✅ User found!')
      console.log(`📧 Email: ${user.email}`)
      console.log(`👤 Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`)
      console.log(`🔑 Current Role: ${user.role || 'USER'}`)
      
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        console.log(`ℹ️  User is already an admin (${user.role})`)
      } else {
        console.log('⬆️  Promoting user to ADMIN role...')
        await mongoose.connection.db.collection('users').updateOne(
          { clerkId: targetClerkId },
          { 
            $set: { 
              role: 'ADMIN',
              isActive: true 
            } 
          }
        )
        console.log('🎉 SUCCESS! User promoted to ADMIN!')
      }
    } else {
      console.log('❌ User not found with that Clerk ID')
      console.log('💡 Make sure the user has signed up to your application first')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

findAndPromoteUser() 