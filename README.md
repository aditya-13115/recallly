# Recallly

Recallly is a private, minimal spaced-repetition planner based on the Ebbinghaus forgetting curve. It helps a learner capture topics, schedule review sessions, and build a reliable daily study routine without a complicated setup.

## What it does

- Creates topics with notes, subject tags, urgency, review dates, and repetition levels.
- Advances reviews through the default schedule: 1 day, 3 days, 7 days, then 30 days.
- Provides a focused dashboard for due and overdue reviews.
- Includes a searchable, filterable table of all topics.
- Supports single and bulk selection, bulk deletion, and direct repetition-level adjustment.
- Displays a monthly calendar and a 60-day review heatmap.
- Supports separate local profiles, light and dark appearance, and installable web-app behaviour.

## Project structure

```text
recallly/
├── index.html                 Main application page and responsive layout rules
├── manifest.webmanifest       Web-app installation metadata
├── sw.js                      Offline cache service worker
├── README.md                  Project documentation
└── assets/
    ├── css/
    │   ├── base.css           Global tokens, layout, typography, and theme styles
    │   ├── components.css     Topic table, forms, dialogs, and shared UI components
    │   └── features.css       Calendar, heatmap, bulk controls, and responsive features
    └── js/
        └── app.js             Application state, interactions, scheduling, and rendering
```

## Getting started

Recallly is a static website and does not need a build process.

1. Keep the folder structure intact.
2. Serve the project from a local web server while developing. Opening `index.html` directly is suitable for a quick preview, but service workers and notifications require a server.
3. Deploy the entire `recallly` folder to an HTTPS static host such as Netlify, Cloudflare Pages, GitHub Pages, or Vercel.

## Using Recallly

### Create a topic

Select **New topic**, then enter a title. Notes, subject tag, urgency, dates, and repetition level are all editable. New topics are due today by default so the first review can be scheduled immediately.

### Complete a review

Tick the checkbox in the **Done** column or on the dashboard. Recallly records the review and advances the next date:

| Current repetition level | Next review |
| --- | --- |
| 0 | 1 day later |
| 1 | 3 days later |
| 2 | 7 days later |
| 3 or above | 30 days later |

The `−` and `+` controls in the table let you correct a repetition level without opening the editor.

### Manage several topics

Use the checkboxes at the left of the table to select entries. The bulk action bar appears only when one or more topics are selected. It currently allows safe, confirmed deletion of the selected entries.

### Use the study views

- **Today’s dashboard**: due and overdue work only.
- **All topics**: the complete editable study database.
- **Due today** and **Overdue**: filtered queues for immediate action.
- **Calendar**: scheduled reviews in the current month.
- **Review heatmap**: activity recorded over the previous 60 days.

## Data and privacy

The current version stores data in the browser using local storage. It works without an account and keeps profiles separate on the same browser and device.

Local storage does not synchronise across devices and can be removed by clearing browser data. Export or back up important information before clearing site data.

## Notifications and installation

Recallly can request browser notification permission and show due items when the app is open. For installation and notification support, publish it on HTTPS and use **Install app** in Chrome or Edge, or **Add to Home Screen** in Safari on iPad or iPhone.

Reliable notifications while the application is closed require a push-notification service and a backend.

## Planned cloud upgrade

To support real user accounts, cross-device sync, and background notifications, connect a hosted backend such as Supabase or Firebase. The cloud version should include:

- Email or social sign-in.
- Per-user topics and review history protected by database access rules.
- Real-time sync between a phone, tablet, and computer.
- Web Push subscriptions and a scheduled server-side reminder job.
- A backup and export workflow.

Do not place private server keys in this static project. Only public browser configuration belongs in client-side code.

## Browser support

The responsive interface is designed for current versions of Chrome, Edge, Safari, and Firefox on desktop, Android, iPad, and iPhone. On small screens, the navigation becomes horizontally scrollable and wide tables can be swiped horizontally.

## Maintenance notes

- Keep asset references in `index.html` and the cache list in `sw.js` aligned whenever files are renamed.
- Increase the cache version in `sw.js` after publishing an update so installed copies receive the latest files.
- Preserve the `assets` directory names and relative paths when deploying.
