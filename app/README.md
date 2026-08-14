# Gym Buddie

A personal, installable web app (PWA) for tracking gym workouts, progress, and nutrition. All data is stored locally on your device (IndexedDB) — no account, no server, no syncing.

## Features

- **Workout plan & exercise guide** — a Push / Pull / Legs split out of the box, each exercise showing which machine/equipment to use and target sets & reps. Fully editable: add/remove days and exercises.
- **Progress tracking** — log weight × reps per set during a workout, see personal records and charts of max weight / volume over time per exercise.
- **Calories & protein tracking** — set daily calorie/protein/carb/fat goals, quick-add common foods or log custom ones, see daily progress bars and history by day.
- **Body stats** — log bodyweight and measurements over time with a trend chart.

## Running it

```bash
npm install
npm run dev
```

Open the printed URL. On your phone, run `npm run dev -- --host` and open `http://<your-computer-ip>:5173` while on the same Wi-Fi.

## Installing on your phone (PWA)

To get the "Add to Home Screen" install prompt, the app needs to be served over HTTPS (or `localhost`). The easiest path:

1. Build it: `npm run build`
2. Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages — all have free tiers).
3. Open the deployed URL on your phone and choose **Add to Home Screen** (iOS Safari) or use the install prompt (Android Chrome).

Once installed, it works fully offline — your data lives in your browser's local storage on that device.

## Tech

React + TypeScript + Vite, Tailwind CSS, Dexie (IndexedDB), Recharts, `vite-plugin-pwa`.
