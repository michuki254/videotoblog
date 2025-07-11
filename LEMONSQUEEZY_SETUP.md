# LemonSqueezy Setup Documentation

## Current Issue Resolution

The LemonSqueezy integration is now working! The 500 error was caused by incorrect response parsing. Here's the current state:

### Variant Mapping

Due to the actual prices in your LemonSqueezy account, the variant IDs are mapped as follows:

- **BASIC Plan ($9.99/mo)** → Variant ID: 849810
- **PRO Plan ($29.99/mo)** → Variant ID: 849874
- **ENTERPRISE Plan** → Currently using PRO variant (849874) as placeholder

### Important Notes

1. **Variant Status**: All variants show status "pending" in LemonSqueezy. You may need to publish/activate them in your LemonSqueezy dashboard for production use.

2. **Price Mismatch**: The actual prices in LemonSqueezy don't match the intended prices:
   - Variant 849810: $9.99 (correct for BASIC)
   - Variant 849874: $29.99 (intended for PRO, but you wanted $29.99)
   - Variant 849880: $0 (was supposed to be BASIC)
   - No variant for ENTERPRISE at $99.99

3. **Test Mode**: The checkouts are being created in test mode (`test_mode: true`), which is perfect for development.

### Next Steps

1. **Create/Update Products in LemonSqueezy**:
   - Create an ENTERPRISE product variant at $99.99/month
   - Ensure all variants are published/active
   - Update the variant IDs in `.env.local` accordingly

2. **Update Environment Variables**:
   ```bash
   LEMONSQUEEZY_BASIC_VARIANT_ID=849810     # $9.99/mo
   LEMONSQUEEZY_PRO_VARIANT_ID=849874       # $29.99/mo
   LEMONSQUEEZY_ENTERPRISE_VARIANT_ID=XXXXX # Need to create this at $99.99/mo
   ```

3. **Test Checkout URLs**: The checkout URLs are now being created successfully. Example:
   ```
   https://hullmedia.lemonsqueezy.com/checkout/custom/[checkout-id]?signature=[signature]
   ```

### Testing

Run the verification script to check your configuration:
```bash
node scripts/verify-lemonsqueezy.js
```

Run the checkout test to create test checkouts:
```bash
node scripts/test-checkout.js
```

The integration is now functional and ready for testing!