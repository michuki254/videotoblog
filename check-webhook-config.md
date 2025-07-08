# LemonSqueezy Webhook Configuration Checklist

## 🔧 **Step 1: Check Webhook URL**
1. Go to [LemonSqueezy Dashboard](https://app.lemonsqueezy.com)
2. Navigate to **Settings → Webhooks**
3. Verify your webhook URL is exactly: `https://videotoblog-v3.vercel.app/api/subscriptions/webhook`

## 📋 **Step 2: Check Required Events**
Make sure these events are selected:
- ✅ `subscription_created`
- ✅ `subscription_updated`
- ✅ `subscription_cancelled`
- ✅ `subscription_resumed`
- ✅ `subscription_expired`
- ✅ `subscription_payment_success`
- ✅ `subscription_payment_failed`

## 🔑 **Step 3: Check Webhook Secret**
1. Copy the **Webhook Secret** from LemonSqueezy
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Go to your project → Settings → Environment Variables
4. Add/Update: `LEMONSQUEEZY_WEBHOOK_SECRET=your_secret_here`

## 📊 **Step 4: Check Recent Deliveries**
1. In LemonSqueezy webhook settings, click **"Recent Deliveries"**
2. Look for your recent purchase
3. Check if responses are:
   - ✅ **200 OK** (Success)
   - ❌ **4xx/5xx** (Error)

## 🔍 **Step 5: Check Vercel Function Logs**
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the webhook function
3. Check logs for errors during webhook processing

## 🚨 **Common Issues:**
- **Wrong webhook URL** - Must be exact: `https://videotoblog-v3.vercel.app/api/subscriptions/webhook`
- **Missing webhook secret** - Environment variable not set in Vercel
- **Wrong events selected** - Missing `subscription_created` event
- **Signature verification failing** - Webhook secret mismatch 