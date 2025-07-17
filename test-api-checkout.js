// Test the checkout API endpoint directly
const fetch = require('node-fetch');

async function testCheckoutAPI() {
  console.log('Testing checkout API endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/subscriptions/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: 'BASIC',
        email: 'test@example.com',
      }),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.checkoutUrl) {
      console.log('\n✅ SUCCESS! Checkout URL:', data.checkoutUrl);
    } else {
      console.log('\n❌ ERROR:', data.error || 'No checkout URL returned');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testCheckoutAPI();