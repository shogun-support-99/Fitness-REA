# Contributing to REA Fit

Thanks for wanting to help — this is a small, dependency-free project, so the
rules are short.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Before opening a PR, run the full suite:

```bash
npm run test:auth && npm run test:logic && npm run test:render
npx tsc --noEmit
npm run build
```

Everything must pass — the CI that deploys the site and builds the Android APK
runs the same builds.

## Ground rules

- **Free forever.** No paywalls, no ads, no tracking, no accounts on a server.
  If a feature needs a backend, it doesn't ship.
- **Local-first.** User data lives on the user's device. Never introduce a
  network call that carries workout data anywhere.
- **Zero UI dependencies.** Icons, charts and components are hand-rolled —
  keep it that way; it's what keeps the bundle honest and the app fast.
- Match the existing code style (TypeScript, CSS in `src/styles/`, no CSS
  frameworks).

## Commit style

Short, imperative subject line; body explains *why*. Look at `git log` for
examples.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and which
browser/device. Screenshots help.
