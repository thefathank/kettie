import posthog from 'posthog-js';

// Initialize PostHog
export const initPostHog = () => {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll manually capture page views
      capture_pageleave: true,
    });
  } else {
    console.warn('PostHog not initialized: Missing VITE_POSTHOG_KEY or VITE_POSTHOG_HOST');
  }
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
};

// Track page views
export const trackPageView = (pathname: string) => {
  if (posthog.__loaded) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path: pathname,
    });
  }
};

// Identify user
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.identify(userId, properties);
  }
};

// Reset on logout
export const resetPostHog = () => {
  if (posthog.__loaded) {
    posthog.reset();
  }
};

export { posthog };
