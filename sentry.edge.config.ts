import * as Sentry from '@sentry/nextjs'

// This file configures the initialization of Sentry for edge features (middleware, edge routes, etc.)
// The config will be used whenever an edge feature is executed.
// Note: Initialization happens dynamically based on settings

export function initSentry(dsn: string) {
  Sentry.init({
    dsn: dsn,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  })
}