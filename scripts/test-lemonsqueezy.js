const { lemonSqueezySetup, listProducts, listVariants } = require('@lemonsqueezy/lemonsqueezy.js');
require('dotenv').config({ path: '.env.local' });

// Initialize LemonSqueezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
  onError: (error) => console.error('LemonSqueezy Error:', error),
});

async function testLemonSqueezy() {
  try {
    console.log('🍋 Testing LemonSqueezy Connection...\n');

    // Test API connection by listing products
    console.log('📦 Fetching Products...');
    const products = await listProducts({
      filter: {
        storeId: process.env.LEMONSQUEEZY_STORE_ID,
      },
    });

    if (products.data && products.data.data.length > 0) {
      console.log('✅ Products found:');
      for (const product of products.data.data) {
        console.log(`   - ${product.attributes.name} (ID: ${product.id})`);
        
        // Get variants for this product
        try {
          const variants = await listVariants({
            filter: {
              productId: product.id,
            },
          });

          if (variants.data && variants.data.data.length > 0) {
            console.log('     Variants:');
            for (const variant of variants.data.data) {
              const price = variant.attributes.price;
              const formattedPrice = price ? (price / 100).toFixed(2) : 'N/A';
              console.log(`       - ${variant.attributes.name}: $${formattedPrice} (Variant ID: ${variant.id})`);
            }
          }
        } catch (variantError) {
          console.log('     ⚠️ Could not fetch variants for this product');
        }
        console.log('');
      }
    } else {
      console.log('❌ No products found. Check your Store ID and API key.');
    }

    // Display current environment configuration
    console.log('\n🔧 Current Configuration:');
    console.log(`Store ID: ${process.env.LEMONSQUEEZY_STORE_ID || 'NOT SET'}`);
    console.log(`API Key: ${process.env.LEMONSQUEEZY_API_KEY ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`Basic Variant ID: ${process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || 'NOT SET'}`);
    console.log(`Pro Variant ID: ${process.env.LEMONSQUEEZY_PRO_VARIANT_ID || 'NOT SET'}`);
    console.log(`Enterprise Variant ID: ${process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID || 'NOT SET'}`);

  } catch (error) {
    console.error('❌ Error testing LemonSqueezy:', error.message);
    console.error('Make sure your API key and Store ID are correct in .env.local');
  }
}

testLemonSqueezy(); 