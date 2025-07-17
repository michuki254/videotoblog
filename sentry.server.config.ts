import * as Sentry from '@sentry/nextjs'

// This file configures the initialization of Sentry on the server.
// The config will be used whenever the server handles a request.
// Note: Initialization happens dynamically based on settings

export function initSentry(dsn: string) {
  Sentry.init({
    dsn: dsn,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: process.env.NODE_ENV === 'development',
  })
}