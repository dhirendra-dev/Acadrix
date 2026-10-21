# Acadrix

Acadrix is a focused, standalone JEE resource command center. It runs entirely in the browser with a local-first store, so the core experience works without a hosted backend, third-party app platform, or external account.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The app stores resource requests, bookmarks, theme preferences, study notes, and lightweight activity in browser local storage. Resource detail pages include an embedded PDF viewer and autosaving notes workspace. The seeded library gives a fresh install a useful starting point while keeping the project easy to connect to a backend later if needed.

## Project structure

The React entrypoint lives in `src/main.jsx`. The application shell and responsive navigation are in `src/components`, the user-facing routes are in `src/pages`, and the local-first data layer is in `src/lib/store.js`. The supplied Acadrix logo is stored at `public/brand/acadrix-logo.png`.
