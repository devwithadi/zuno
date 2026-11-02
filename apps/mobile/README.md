# Zuno universal client

One Expo app serves Android, iOS and web. Reading requires no account.

From the repository root, run `npm install`, then `npm run dev:app` for web.
Run `npm run start --workspace @zuno/mobile` to open the Expo device chooser.
Use `npm run build:web` to export the website into `apps/mobile/dist/`.

Copy `.env.example` to `.env` in this directory before configuring the client.
`EXPO_PUBLIC_API_URL` defaults to `http://localhost:3001`. For a physical phone,
use the development computer's LAN address and start the API on a reachable
interface. Android Emulator can use `http://10.0.2.2:3001`. Use HTTPS for production.
The API's CORS allowlist must include the website's actual origin.

## Optional accounts

Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to enable Clerk sign-in. It is a public
client identifier. Never put a Clerk secret key into an `EXPO_PUBLIC_` variable.
Restart Expo after changing environment variables.

The website uses Clerk's sign-in modal. Native uses Clerk hosted authentication
in a browser session and secure token storage. Enable Clerk's Native API and
register `org.zuno.app` as the iOS bundle ID and Android package in Clerk before
a native production build. The Expo plugins configure the callback scheme.
Clerk's hosted native flow currently requires the corresponding Account Portal
configuration. Sign-in is optional; the feed remains available to guests.

## Organization

- `src/feed/`: validated API boundary and cancellable feed requests.
- `src/components/`: small shared presentation components.
- `src/auth/`: platform-specific Clerk integration, enabled only when configured.
- `src/theme.ts`: the shared lilac, mint and neutral color tokens.

Metro resolves the shared package's Node-style `.js` imports to TypeScript.
The Babel config enables Expo's `import.meta` transform because Clerk's shared
utilities contain that syntax and Metro exports a classic browser script.

Only validated public stories appear in the feed. Each key point links to its
evidence, and every card links to the original sources. Missing or failed images
use a compact topic strip. Source covers use a 16:9 crop, accessible descriptions
and supplied credits. Repository owner avatars appear in compact identity rows.
A changed cover URL resets the image error state.
Motion fades on web honor reduced motion;
native uses immediate rendering. Topic filters reset pagination. Refresh aborts
the previous request, and subsequent pages merge without duplicate story IDs.
Scrolling near the end loads the next page; a More stories button is the fallback.

The project pins Expo SDK 55 with its documented React Native 0.83 release line.
React's patch version also satisfies Clerk's security minimum. Native store
builds require the platform toolchain or a separately configured build service.
