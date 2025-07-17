declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;
    
    // Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;
    CLERK_WEBHOOK_SECRET: string;
    
    // OpenAI
    OPENAI_API_KEY: string;
    
    // Assembly AI
    ASSEMBLYAI_API_KEY: string;
    
    // Replicate
    REPLICATE_API_TOKEN: string;
    
    // AWS S3
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_S3_BUCKET_NAME: string;
    
    // LemonSqueezy
    LEMONSQUEEZY_API_KEY: string;
    LEMONSQUEEZY_STORE_ID: string;
    LEMONSQUEEZY_WEBHOOK_SECRET: string;
    LEMONSQUEEZY_BASIC_VARIANT_ID: string;
    LEMONSQUEEZY_PRO_VARIANT_ID: string;
    LEMONSQUEEZY_ENTERPRISE_VARIANT_ID: string;
    
    // App URLs
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    
    // Feature Flags
    ENABLE_PINTEREST?: string;
    
    // Node Environment
    NODE_ENV: 'development' | 'production' | 'test';
  }
}