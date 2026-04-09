

## Problem Summary

There are two misconfigurations preventing the API keys from working:

1. **Resend secret name mismatch** — Edge functions reference `RESEND_API_KEY` but the stored secret is `ResendKey`
2. **PostHog keys stored in wrong location** — Frontend code needs build-time env vars (`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`), but they're stored as runtime secrets which are only accessible to edge functions

## Plan

### Step 1: Fix Resend API key name

Add a new runtime secret named `RESEND_API_KEY` with the same value as your current `ResendKey` secret. This will make it available to both `send-client-email` and `invite-coach` edge functions.

Alternatively, I can update both edge functions to use `Deno.env.get("ResendKey")` instead — this avoids creating a duplicate secret.

**Recommendation:** Update the edge functions to use `ResendKey` since that's what's already stored.

### Step 2: Fix PostHog configuration

`VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` are **build-time** variables — they cannot be managed by me or stored as runtime secrets. You need to:

1. Go to **Workspace Settings → Build Secrets** in the Lovable UI
2. Add `VITE_POSTHOG_KEY` with your PostHog project API key
3. Add `VITE_POSTHOG_HOST` with your PostHog host URL (typically `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

This is a manual step that only you can do.

## Technical Details

- **Files to modify:** `supabase/functions/send-client-email/index.ts` and `supabase/functions/invite-coach/index.ts` — change `RESEND_API_KEY` → `ResendKey`
- **Redeploy:** Both edge functions after the change
- **No code changes needed for PostHog** — the code is correct, it just needs the build secrets configured

