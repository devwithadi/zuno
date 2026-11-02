# Local and production operation

## Database

`docker compose up -d` starts a local database on port 27028. The volume belongs
only to this project. Use a dedicated MongoDB database and least-privilege user
for hosted operation. Never reuse another project's production database.

For a native MongoDB install, keep preview data in the ignored `.data/mongo/`
directory rather than temporary storage. Create it with `mkdir -p .data/mongo`,
then run `mongod --dbpath .data/mongo --port 27028 --bind_ip 127.0.0.1`.
Use either this process or Docker on port 27028, never both at once.

## Development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and start MongoDB.
3. Run `npm run worker:once`; inspect the counts and individual source failures.
4. Start `npm run dev`, then open the Expo web URL.
5. Start `npm run worker` for continuous five-minute polling.

Empty feeds show a useful empty state. They do not silently use fabricated news.
A source error should not remove already published stories.

## Clerk

Use your own development application and register web/native redirect addresses.
Set the public key in `apps/mobile/.env`, and the server secret plus authorized
parties in the root `.env`. The secret key must never use an `EXPO_PUBLIC_` prefix.
Production requires explicit CORS origins and authentication configuration.
Guest browsing works before Clerk is configured.

## Before deployment

Run type checking, tests, coverage, the browser flow and the web export. Verify
source usage terms for the intended distribution. Configure TLS, an origin
allowlist and a database backup policy. The MVP rate limiter is per API process;
use a shared limiter before scaling beyond one serving process.

The scheduler needs a continuously running process. Do not run it inside a
short-lived HTTP handler. Alert on repeated source failures, stale publication
times, retry backlog, and model timeouts.

## Model resources

LangChain rewriting is optional. Local inference has hardware costs; explicitly
configured Bedrock inference incurs AWS charges. Set bounded
timeouts and concurrency. A malformed or unsupported response is a failed job,
never a reason to publish unchecked claims. See `docs/content-workflow.md`.

## Data removal

Stop the worker before editing stored content. Use a database tool with scoped
permissions to remove an affected story and its retry state. Back up data first.
The application intentionally has no unauthenticated mutation endpoints.
