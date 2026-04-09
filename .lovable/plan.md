

## Switch from Resend to Lovable's Built-in Email System

### Problem
The project uses Resend for two email-sending edge functions (`send-client-email` and `invite-coach`), but the Resend domain `mail.propointersplus.com` is registered on the original project owner's account and can't be verified on yours.

### Plan

**Step 1: Set up an email domain**
No email domain is configured yet. You'll need to set up a sender domain through the email setup dialog. This requires adding DNS records at your domain registrar.

**Step 2: Set up email infrastructure**
Create the database tables, queues, and cron job needed for Lovable's email system.

**Step 3: Scaffold transactional email templates**
Create three email templates matching the current functionality:
- **Progress note** — sent when a coach shares a note with a client
- **Training video** — sent when a coach shares a video
- **Lesson plan** — sent when a coach shares a lesson plan
- **Coach invitation** — sent when an admin invites a coach to an academy

**Step 4: Update edge functions**
- Rewrite `send-client-email` to use `send-transactional-email` instead of Resend API calls, OR remove it entirely and call `send-transactional-email` directly from the frontend
- Rewrite `invite-coach` to remove the Resend SDK import and use `send-transactional-email` instead
- Remove all Resend imports and references

**Step 5: Update frontend call sites**
Update the 4 files that invoke `send-client-email`:
- `src/components/NotesList.tsx`
- `src/components/VideosList.tsx`
- `src/components/LessonPlansList.tsx`
- `src/pages/Lessons.tsx`

These will call `send-transactional-email` directly with the appropriate template name and data.

**Step 6: Create unsubscribe page**
Add a branded unsubscribe page as required by the email system.

**Step 7: Deploy and test**
Deploy all updated edge functions and verify email sending works.

### What You'll Need to Do
- Set up your email domain when prompted (add DNS records at your domain registrar)
- Wait for DNS verification (can take up to 72 hours, but often faster)

