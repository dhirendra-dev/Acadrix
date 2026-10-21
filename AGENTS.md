# Acadrix project notes

This repository contains a standalone React/Vite application. Keep the experience local-first, accessible, responsive, and resilient when browser storage is unavailable.

Use the existing design tokens in `src/index.css`, keep shared behavior in `src/lib`, and prefer small route components over large monoliths. Do not introduce external platform-specific SDKs for core navigation, resources, or requests.

Before finishing changes, run `npm run lint`, `npm run typecheck`, and `npm run build`.
