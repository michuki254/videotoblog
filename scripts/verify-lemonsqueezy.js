const { lemonSqueezySetup, listVariants, getVariant, listProducts, getProduct } = require('@lemonsqueezy/lemonsqueezy.js');
require('dotenv').config({ path: '.env.local' });

async function verifyLemonSqueezySetup() {
  console.log('🍋 Verifying LemonSqueezy Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('LEMONSQUEEZY_API_KEY:', process.env.LEMONSQUEEZY_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('LEMONSQUEEZY_STORE_ID:', process.env.LEMONSQUEEZY_STORE_ID || '✗ Missing');
  console.log('LEMONSQUEEZY_BASIC_VARIANT_ID:', process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || '✗ Missing');
  console.log('LEMONSQUEEZY_PRO_VARIANT_ID:', process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '✗ Missing');
  console.log('LEMONSQUEEZY_ENTERPRISE_VARIANT_ID:', process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID || '✗ Missing');
  console.log('\n');

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    console.error('❌ LEMONSQUEEZY_API_KEY is not set!');
    return;
  }

  // Initialize LemonSqueezy
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => console.error('LemonSqueezy Error:', error),
  });

  try {
    // List all products first
    console.log('📦 Fetching all products...');
    const productsResponse = await listProducts();
    
    if (productsResponse.error) {
      console.error('❌ Error fetching products:', productsResponse.error);
    } else {
      const products = productsResponse.data?.data || [];
      console.log(`Found ${products.length} products:\n`);
      
      for (const product of products) {
        const attributes = product.attributes;
        console.log(`Product ID: ${product.id}`);
        console.log(`Name: ${attributes.name}`);
        console.log(`Status: ${attributes.status}`);
        console.log('---');
      }
    }

    // List all variants
    console.log('\n📦 Fetching all variants...');
    const variantsResponse = await listVariants();
    
    if (variantsResponse.error) {
      console.error('❌ Error fetching variants:', variantsResponse.error);
      return;
    }

    const variants = variantsResponse.data?.data || [];
    console.log(`Found ${variants.length} variants:\n`);

    variants.forEach(variant => {
      const attributes = variant.attributes;
      console.log(`ID: ${variant.id}`);
      console.log(`Name: ${attributes.name}`);
      console.log(`Price: $${attributes.price / 100}`);
      console.log(`Product ID: ${attributes.product_id}`);
      console.log(`Status: ${attributes.status}`);
      console.log(`Is subscription: ${attributes.is_subscription}`);
      console.log(`Interval: ${attributes.interval}`);
      console.log(`Interval count: ${attributes.interval_count}`);
      console.log('---');
    });

    // Verify each configured variant
    console.log('\n🔍 Verifying Configured Variants:\n');
    
    const variantIds = {
      BASIC: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
      PRO: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
      ENTERPRISE: process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID,
    };

    for (const [plan, variantId] of Object.entries(variantIds)) {
      if (!variantId) {
        console.log(`❌ ${plan}: No variant ID configured`);
        continue;
      }

      try {
        const variantResponse = await getVariant(variantId);
        
        if (variantResponse.error) {
          console.log(`❌ ${plan} (${variantId}): Error - ${variantResponse.error.message}`);
        } else if (variantResponse.data?.data) {
          const variant = variantResponse.data.data;
          const attributes = variant.attributes;
          console.log(`✅ ${plan} (${variantId}): ${attributes.name} - $${attributes.price / 100}`);
        } else {
          console.log(`❌ ${plan} (${variantId}): Not found`);
        }
      } catch (error) {
        console.log(`❌ ${plan} (${variantId}): ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the verification
verifyLemonSqueezySetup();