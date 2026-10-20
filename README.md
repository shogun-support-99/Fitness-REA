<div align="center">

# 💪 REA Fit

### A free, open-source workout tracker & gym logger for the web

**Log workouts. Get stronger. Stay consistent.**

**[🌐 Live demo — shogun-support-99.github.io/Fitness-REA](https://shogun-support-99.github.io/Fitness-REA/)**

React · TypeScript · Vite · No backend — your data stays on your device.

</div>

---

## What is this?

REA Fit is a [Hevy](https://www.hevyapp.com/)-inspired workout tracker that runs entirely in the
browser. It ships with a marketing landing page and a fully functional training app:

- **🏋️ Workout logger** — add exercises, log weight × reps per set, mark warm-up / drop / failure
  sets, use per-exercise notes, and watch the elapsed timer.
- **⏱️ Rest timer** — completes a set and the countdown starts automatically, with +15s / +1m
  extensions and a completion chime.
- **🏆 Personal records** — finishing a workout scans every set against your history and shows your
  new PRs with estimated one-rep max (Epley).
- **📅 Routines** — build templates once, then start any session with one tap. Repeat past workouts
  or save them as routines.
- **📈 Progress** — weekly volume chart, per-exercise 1RM trend lines, streaks, and full history.
- **📚 Exercise library** — 100+ built-in exercises with equipment and muscle filters, plus custom
  exercise creation. Strength and cardio (min / km) set types.
- **👥 Feed** — a demo social feed with likes, comments and follows, including your own workouts.
- **⚙️ Settings** — kg / lb units (converted live), dark & light themes, rest timer length, sounds,
  and JSON export / import of all your data.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # outputs to dist/
npm run preview
```

Tests (no framework needed — plain node):

```bash
npm run test:logic   # training math, reducer, seed integrity
npm run test:render  # SSR smoke test of every screen
```

## Deploy

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the app to
**GitHub Pages** on every push to `main`.

## Tech

- **React 18 + TypeScript + Vite** — zero UI dependencies; every icon, chart and component is
  hand-rolled.
- **Hash routing** (`#/` landing, `#/app` tracker) so it works on any static host and subpath.
- **localStorage persistence** with a typed reducer store — workouts, routines, settings, feed
  state and an in-progress workout survive reloads.
- Weights are stored in kilograms internally and converted for display, so switching units never
  corrupts history.

```
src/
  app/            tracker app (shell, tabs, screens)
  landing/        marketing page
  lib/            store, types, training math, seed data
  data/           exercise database
  components/     icons, charts, shared UI
scripts/          logic + render tests
```

## Disclaimer & credits

This is an independent, open-source demo built as a tribute to [Hevy](https://www.hevyapp.com/)'s
excellent design. It is **not affiliated with or endorsed by Hevy**, and all content and code here
were written from scratch.

**Exercise data** (names, muscles, equipment, instructions) comes from
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), released under
the **MIT License** — see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

**Exercise media** (thumbnail images and animation GIFs, hotlinked at 180×180 from the CDN) is the
property of **© Gym visual — <https://gymvisual.com/>**, used with attribution and not for
commercial use.

## License

MIT
