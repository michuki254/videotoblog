const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function checkUsers() {
  try {
    const mongoUri = process.env.DATABASE_URL
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray()
    console.log(`\nFound ${users.length} users:`)
    
    users.forEach((u, index) => {
      console.log(`${index + 1}. Email: ${u.email}`)
      console.log(`   Name: ${u.firstName || 'N/A'} ${u.lastName || 'N/A'}`)
      console.log(`   Role: ${u.role || 'USER'}`)
      console.log(`   ClerkId: ${u.clerkId}`)
      console.log('')
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkUsers() 