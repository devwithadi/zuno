# Mobile and web client

- Keep feature code in `src/feed`, `src/deck`, and the existing component folders.
- UI consumes the HTTP client and shared public contracts; never import storage,
  worker, API implementation, Node built-ins or server SDKs into the app.
- Keep network validation in the feed boundary and visual state in components or
  focused hooks. Reuse the existing theme and accessible components.
- Preserve guest reading, reduced motion, source links and topic filters.
- Keep secrets out of `EXPO_PUBLIC_*`; these values ship to every client.

Run `npm run check`, `npm test -- tests/mobile`, `npm run build:web` and relevant
`npm run test:e2e` cases after client behavior changes.
