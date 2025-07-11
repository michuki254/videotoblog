// Check environment variables
require('dotenv').config({ path: '.env.local' });
console.log('Checking environment variables...\n');

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'NEXT_PUBLIC_BASE_URL',
  'YOUTUBE_API_KEY'
];

let allPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✓ ${envVar}: Set (length: ${value.length})`);
    
    // Check for common issues
    if (envVar === 'OPENAI_API_KEY' && !value.startsWith('sk-')) {
      console.log(`  ⚠️  Warning: OpenAI API key should start with 'sk-'`);
    }
    if (envVar === 'DATABASE_URL' && !value.includes('mongodb')) {
      console.log(`  ⚠️  Warning: DATABASE_URL should be a MongoDB connection string`);
    }
  } else {
    console.log(`✗ ${envVar}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n' + (allPresent ? '✓ All required environment variables are set!' : '✗ Some environment variables are missing!'));