# Recallly — Cloud setup (Supabase + Cloudflare Pages)

This file documents the additive changes made on top of the original local-only
app. Nothing in the original UI, styling, or scheduling logic was removed or
rewritten — this only layers accounts and cloud sync on top of it.

## What was added

- **`assets/js/supabase.js`** — now also contains auth helpers
  (`login`, `signup`, `logout`, `forgotPassword`, `getSession`, `currentUser`,
  `requireLogin`) and data helpers (`fetchProfile`, `upsertProfile`,
  `fetchTopics`, `insertTopic`, `updateTopic`, `deleteTopic`, `deleteTopics`,
  `bulkInsertTopics`). No DOM/UI code lives here.
- **`assets/js/app.js`** — unchanged above the original last line. A new block
  was appended that:
  - Shows a new `#authDialog` (in `index.html`) if nobody is signed in.
  - On sign-in, downloads the user's profile + topics from Supabase and
    re-renders using the app's existing `render()`.
  - On every create / edit / review / repetition change / delete, calls the
    matching Supabase helper right after the existing local update, so the UI
    still reacts instantly and the local `localStorage` copy still works as
    an offline cache.
  - One-time migration: if Supabase has no topics yet for a user but the
    browser's local copy does, those topics are uploaded automatically.
- **`index.html`** — added the auth dialog, a "Log out" button in the
  sidebar, favicon/PWA icon links, and PWA meta tags. Dashboard, calendar,
  heatmap, dialogs, filters, and all existing CSS/HTML are untouched.
- **`assets/icons/`** — generated favicon/PWA icons from the app's existing
  "R" brand mark and accent color, referenced from `index.html` and
  `manifest.webmanifest`.
- **`manifest.webmanifest`** — kept `name`/`short_name`/etc. and added
  `icons`, `orientation`.
- **`sw.js`** — cache version bumped `v6 → v7` and the new files added to the
  offline cache list.
- **`supabase_schema.sql`** — new file with the `profiles` and `topics`
  tables and Row Level Security policies described below.

## 1. Run the database schema

In the Supabase dashboard: **Project → SQL Editor → New query**, paste the
contents of `supabase_schema.sql`, and run it. This creates:

- `profiles` (`id`, `user_id`, `display_name`, `created_at`)
- `topics` (`id`, `user_id`, `title`, `notes`, `tag`, `urgency`,
  `last_reviewed`, `next_review`, `repetitions`, `history`, `created_at`,
  `updated_at`)

Both tables have Row Level Security enabled with policies that restrict every
row to `auth.uid() = user_id`, so a user can only ever see or modify their own
data — ownership is derived from the authenticated session, not from any
value sent by the browser.

## 2. Auth settings

In **Authentication → Providers → Email**, keep "Confirm email" turned on so
new accounts must verify their address before the profile is usable.

## 3. Keys already in place

`assets/js/supabase.js` already points at your project URL and uses the
`sb_publishable_...` key, which is safe to ship in client-side code. Never put
the `service_role` key in this file or in any file served to the browser.

## 4. Deploy on Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, create a project from that repository.
3. Build settings: no build command needed (static site); output directory
   is the project root (`/`).
4. No environment variables are required for the current setup, since the
   Supabase URL and publishable key are safe to keep in `supabase.js`. If you
   later want to avoid committing them directly, inject them at build time as
   `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` Pages environment variables and
   read them from `window.ENV` instead — the rest of the app does not need to
   change for that.

## 5. What still works exactly as before

Dashboard, calendar, heatmap, search/filter, bulk select and delete, the
repetition +/− controls, dark mode, the reminder panel, and the local
multi-profile switcher all work unchanged. The profile switcher currently
creates additional *local* workspaces (not yet synced individually to
Supabase, since the schema links topics to one `user_id` per account) — the
signed-in account's own workspace is the one that syncs to the cloud.
