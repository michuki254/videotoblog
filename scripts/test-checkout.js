const { lemonSqueezySetup, createCheckout } = require('@lemonsqueezy/lemonsqueezy.js');
require('dotenv').config({ path: '.env.local' });

// Initialize LemonSqueezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
  onError: (error) => console.error('LemonSqueezy Error:', error),
});

async function testCheckout() {
  try {
    console.log('🧪 Testing Checkout Creation...\n');

    const testPlans = [
      {
        name: 'Basic Plan',
        variantId: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
        price: '$9.99'
      },
      {
        name: 'Pro Plan', 
        variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
        price: '$29.99'
      }
    ];

    for (const plan of testPlans) {
      console.log(`\n🔍 Testing ${plan.name} (${plan.price})...`);
      console.log(`   Variant ID: ${plan.variantId}`);

      if (!plan.variantId) {
        console.log('   ❌ Variant ID not set in environment');
        continue;
      }

      try {
        // Test checkout creation (without actually completing it)
        const checkout = await createCheckout(
          process.env.LEMONSQUEEZY_STORE_ID,
          plan.variantId,
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
                plan: plan.name.toUpperCase().replace(' PLAN', ''),
              },
            },
            productOptions: {
              name: `VideotoBlog ${plan.name}`,
              description: `AI-powered video to blog conversion - ${plan.name}`,
              redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            },
          }
        );

        if (checkout && checkout.data) {
          console.log('   ✅ Checkout created successfully');
          console.log(`   📋 Checkout URL: ${checkout.data.attributes.url}`);
          console.log(`   🆔 Checkout ID: ${checkout.data.id}`);
        } else {
          console.log('   ❌ Checkout creation failed - no data returned');
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n✅ Checkout testing completed!');
    console.log('\n📝 Summary:');
    console.log('   - If you see "Checkout created successfully" for both plans, your LemonSqueezy integration is working!');
    console.log('   - The checkout URLs can be used to test the actual payment flow');
    console.log('   - Make sure to test with LemonSqueezy test cards before going live');

  } catch (error) {
    console.error('❌ Error testing checkout:', error.message);
  }
}

testCheckout(); 