# 🍹 Kegger Mocktails — Work Schedule

A mobile-first scheduling calendar for the family mocktail business. Workers
open the site to see who's working which gigs at a glance. The owner (Mom) signs
into an admin portal to add and edit shifts.

Built with **React + TypeScript + Tailwind CSS v4 + Vite**, backed by
**Firebase** (Firestore + Auth).

## Features

- **Month / Week / Agenda views** — switch with the tabs up top.
- **Filter by worker** — tap a name chip to see only their shifts.
- **Color-coded** per worker so the calendar reads at a glance.
- **Mobile-first**, installable to a phone home screen.
- **Admin portal** — sign in to add/edit/delete shifts and manage workers.
- **Demo mode** — runs with local seed data until Firebase is connected, so you
  can try everything immediately. Demo edits are saved in the browser only.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL. With no Firebase config it starts in **DEMO MODE** (note
the amber badge). Tap **Admin** and enter any email/password to try the editing
tools.

## Going live with Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Firestore Database → Create database** (start in production mode).
3. **Build → Authentication → Sign-in method → enable Email/Password**, then add
   Mom's account under the **Users** tab.
4. **Project settings → General → Your apps → Web app** → copy the config values.
5. Copy `.env.example` to `.env.local` and paste in those values.
6. Restart `npm run dev`. The amber DEMO badge disappears — you're on live data.
7. Deploy the security rules so only the admin can edit:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules   # uses firestore.rules
   ```

> The first time you run live, the worker/shift lists will be empty. Sign in as
> admin, open **Workers** to add the team, then use the **+** button to add
> shifts.

## Deploy the site

Any static host works (the build output is in `dist/`):

```bash
npm run build
```

Firebase Hosting is the natural fit:

```bash
firebase init hosting   # set public dir to "dist", configure as an SPA
firebase deploy --only hosting
```

## Data model (Firestore)

- `workers/{id}` → `{ name, color }`
- `shifts/{id}` → `{ date: "yyyy-MM-dd", workerId, event, startTime?, endTime?, location? }`

## A note on QuickBooks

This app is the **schedule** — the at-a-glance "who works when". It's kept
separate from QuickBooks (which handles payroll/invoicing) on purpose, so it
stays fast and simple. If you later want hours to flow into QuickBooks, that's a
follow-up integration we can add via the QuickBooks API.
