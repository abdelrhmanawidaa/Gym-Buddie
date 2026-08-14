# Gym Buddie

A personal, installable web app (PWA) for tracking gym workouts, progress, and nutrition. All data is stored locally on your device (IndexedDB) — no account, no server, no syncing.

## Features

- **Workout plan & exercise guide** — a Push / Pull / Legs split out of the box, each exercise showing which machine/equipment to use and target sets & reps. Fully editable: add/remove days and exercises, on-demand start for any day (not just "next up").
- **Live logging tools** — rest timer that auto-starts after each set, a warm-up set calculator, a plate calculator (shows exactly which plates to load), RPE per set, and warm-up/working/failure/drop-set tags. Per-exercise notes for form cues or machine settings.
- **Progress tracking** — personal records, estimated 1RM, max-weight/volume/1RM charts per exercise, a weekly volume-by-muscle-group chart, a training calendar heatmap with a weekly streak counter, and a "new PR!" toast the moment you beat a previous best. Full workout history with the ability to edit or delete any past session or set.
- **Calories & protein tracking** — daily calorie/protein/carb/fat goals, quick-add common foods or your own saved presets, meal categorization (breakfast/lunch/dinner/snack), a water intake tracker, and day-by-day history.
- **Body stats** — bodyweight and measurements over time with a trend chart, BMI and Navy-method body fat % (once height/sex are set), and progress photos (front/side/back) stored locally.
- **Settings** — kg/lb unit toggle, rest timer duration, barbell weight & plate inventory, and a JSON export/import backup since everything lives only in this browser.

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
