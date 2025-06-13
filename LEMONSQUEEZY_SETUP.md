# LemonSqueezy Integration Setup Guide

This guide will help you set up LemonSqueezy for subscription management in your VideotoBlog application.

## Prerequisites

1. **LemonSqueezy Account**: Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. **MongoDB Database**: Set up a MongoDB database (local or Atlas)
3. **Clerk Authentication**: Already configured in your project

## Step 1: LemonSqueezy Store Setup

### 1.1 Create Products and Variants

In your LemonSqueezy dashboard:

1. **Create Store** (if not already created)
2. **Create Products** for each subscription tier:
   - **Basic Plan**: $9.99/month
   - **Pro Plan**: $29.99/month  
   - **Enterprise Plan**: $99.99/month

3. **Create Variants** for each product:
   - Set up monthly billing
   - Configure pricing
   - Note down the variant IDs for each plan

### 1.2 Get API Credentials

1. Go to **Settings → API** in your LemonSqueezy dashboard
2. Generate an **API Key**
3. Note your **Store ID**

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Configuration (existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Product/Variant IDs for different subscription plans
LEMONSQUEEZY_BASIC_VARIANT_ID=your_basic_plan_variant_id
LEMONSQUEEZY_PRO_VARIANT_ID=your_pro_plan_variant_id
LEMONSQUEEZY_ENTERPRISE_VARIANT_ID=your_enterprise_plan_variant_id

# Database
MONGODB_URI=mongodb://localhost:27017/videotoblog
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videotoblog

# Other API Keys (existing)
OPENAI_API_KEY=your_openai_api_key
```

## Step 3: Webhook Configuration

### 3.1 Set Up Webhook in LemonSqueezy

1. Go to **Settings → Webhooks** in your LemonSqueezy dashboard
2. Click **Create Webhook**
3. Set the **Endpoint URL** to: `https://yourdomain.com/api/subscriptions/webhook`
4. Select the following events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_payment_success`
   - `subscription_payment_failed`
5. Generate a **Webhook Secret** and add it to your environment variables

### 3.2 For Local Development

Use a tool like **ngrok** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the https URL for webhook endpoint
# Example: https://abc123.ngrok.io/api/subscriptions/webhook
```

## Step 4: Database Setup

The MongoDB models are already created. Just ensure your MongoDB connection is working:

```bash
# Test MongoDB connection
npm run dev

# Check the console for MongoDB connection status
```

## Step 5: Integration with App Layout

### 5.1 Add Subscription Provider

Update your main layout to include the subscription provider:

```tsx
// app/layout.tsx
import { SubscriptionProvider } from './components/SubscriptionProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SubscriptionProvider>
            <Toaster position="top-right" />
            {children}
          </SubscriptionProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### 5.2 Add Subscription Manager to Account Page

The account page should include the subscription management component:

```tsx
// In your account page tabs
import SubscriptionManager from '../components/SubscriptionManager'

// Add a new tab for subscription management
{
  name: 'Subscription',
  content: <SubscriptionManager />
}
```

## Step 6: Testing

### 6.1 Test the Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test subscription creation**:
   - Go to `/pricing`
   - Sign up/in with a test user
   - Try subscribing to Basic or Pro plan
   - Complete the checkout process

3. **Test webhook delivery**:
   - Check your server logs for webhook events
   - Verify subscription data is saved in MongoDB

4. **Test subscription management**:
   - Go to `/account`
   - Check the subscription tab
   - Test cancellation functionality

### 6.2 Test with LemonSqueezy Test Mode

LemonSqueezy provides test credit cards for testing:

- **Test Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Step 7: Usage Protection

The subscription system includes usage protection:

### 7.1 Video Conversion Limits

Before allowing video conversion, check user's plan:

```tsx
import { useSubscription } from '../components/SubscriptionProvider'

function VideoConverter() {
  const { canPerformAction } = useSubscription()
  
  const handleConvert = () => {
    const check = canPerformAction('convert_video')
    if (!check.allowed) {
      toast.error(check.reason)
      return
    }
    
    // Proceed with conversion
  }
}
```

### 7.2 Feature Gating

Gate premium features based on subscription:

```tsx
const { canPerformAction } = useSubscription()

// Pinterest post creation
const pinterestCheck = canPerformAction('create_pinterest')

// Platform integrations
const integrationCheck = canPerformAction('use_integration')
```

## Step 8: Production Deployment

### 8.1 Environment Variables

Set all environment variables in your production environment (Vercel, Netlify, etc.):

- Copy all variables from `.env.local`
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Update webhook URL in LemonSqueezy dashboard

### 8.2 Database

Ensure MongoDB is accessible from your production environment:

- For MongoDB Atlas: Whitelist your deployment IP
- Update connection string if needed

### 8.3 LemonSqueezy Production Settings

1. Switch from test mode to live mode in LemonSqueezy
2. Update webhook endpoint to production URL
3. Test the entire flow in production

## Subscription Plans Overview

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 2 videos/month, Basic generation, Community support |
| **Basic** | $9.99/month | 20 videos/month, Pinterest posts, WordPress integration |
| **Pro** | $29.99/month | 100 videos/month, All integrations, Priority support |
| **Enterprise** | $99.99/month | Unlimited videos, Custom features, Dedicated support |

## API Endpoints

- `POST /api/subscriptions/create-checkout` - Create checkout session
- `POST /api/subscriptions/webhook` - Handle LemonSqueezy webhooks
- `GET /api/subscriptions/status` - Get user subscription status
- `POST /api/subscriptions/manage` - Cancel/update subscription

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check server logs for errors

2. **Subscription not found**:
   - Ensure webhook events are processed
   - Check MongoDB for subscription records
   - Verify user ID mapping

3. **Checkout not working**:
   - Verify API key and store ID
   - Check variant IDs are correct
   - Ensure all environment variables are set

### Support

For LemonSqueezy-specific issues, check their [documentation](https://docs.lemonsqueezy.com/) or contact their support team.

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **API Key Security**: Never expose API keys in client-side code
3. **User Authorization**: Always verify user identity before subscription operations
4. **Data Validation**: Validate all webhook data before processing

This completes the LemonSqueezy integration setup for your VideotoBlog application! 