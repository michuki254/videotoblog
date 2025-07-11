const { lemonSqueezySetup, createCheckout } = require('@lemonsqueezy/lemonsqueezy.js');
require('dotenv').config({ path: '.env.local' });

async function testCheckout(variantId, planName) {
  console.log(`\n🧪 Testing checkout for ${planName} (Variant ID: ${variantId})...`);
  
  try {
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID,
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: false,
          logo: false,
        },
        checkoutData: {
          email: 'test@example.com',
          custom: {
            userId: 'test-user-123',
            plan: planName,
          },
        },
        productOptions: {
          name: 'VideotoBlog Subscription',
          description: 'AI-powered video to blog conversion platform',
          redirectUrl: 'http://localhost:3000/dashboard?success=true',
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for subscribing to VideotoBlog!',
        },
      }
    );

    if (checkout?.data?.attributes?.url) {
      console.log(`✅ SUCCESS! Checkout URL created:`);
      console.log(`   ${checkout.data.attributes.url}`);
    } else {
      console.log('❌ Failed: No checkout URL in response');
      console.log('Response:', JSON.stringify(checkout, null, 2));
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    if (error.cause) {
      console.log('Cause:', error.cause);
    }
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function main() {
  console.log('🍋 Testing LemonSqueezy Checkout Creation...\n');

  // Check environment variables
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('❌ LEMONSQUEEZY_API_KEY is not set!');
    return;
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    console.error('❌ LEMONSQUEEZY_STORE_ID is not set!');
    return;
  }

  // Initialize LemonSqueezy
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => console.error('LemonSqueezy Error:', error),
  });

  // Test each plan
  await testCheckout(process.env.LEMONSQUEEZY_BASIC_VARIANT_ID, 'BASIC');
  await testCheckout(process.env.LEMONSQUEEZY_PRO_VARIANT_ID, 'PRO');
  
  console.log('\n✨ Testing complete!');
}

main().catch(console.error);