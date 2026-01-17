// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "local",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://2045591fc964cca08d7d95604d9b35dd@o4506043986280448.ingest.us.sentry.io/4510727009468416",
  environment: process.env.NODE_ENV || "local",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
