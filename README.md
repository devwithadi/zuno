# Zuno

### A little more informed.

A plain-language news feed for AI, technology, business and markets. Zuno turns
public-source evidence into short, cited briefs that you can read on Android,
iOS or the web, with one shared Expo app.

**Read without an account. Follow the evidence. Open the original source.**

[Quick start](#quick-start) · [How it works](#how-it-works) ·
[Architecture](docs/architecture.md) · [Contributing](#contributing) ·
[Security status](docs/security.md)

## What you can do

- Browse a guest feed and filter stories across four topics.
- Swipe through cards on mobile and open the full brief for more context.
- Follow citations and original source links from each story.
- Read source excerpts without configuring an AI provider.
- Enable an optional writing, humanizing and evidence-review workflow with a
  local model or Amazon Bedrock.
- Enable Clerk sign-in while keeping public reading available to guests.

Zuno is an MVP under active development. Web behavior is covered by automated
browser tests; native releases still need device testing and store setup.
No hosted service or app-store release is included in this repository.

## Quick start

### Requirements

- **Node.js 24 LTS** and npm.
- **Docker Compose**, or a local **MongoDB 7+** installation.
- Internet access for public-source ingestion. No paid news feed or AI account
  is required for the default extractive mode.

### Install and configure

```sh
git clone https://github.com/devwithadi/zuno.git
cd zuno
npm ci
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
```

The default server configuration uses a dedicated `zuno` database on port
`27028`. Docker Compose starts MongoDB 8 with a project-specific data volume.

```sh
docker compose up -d
npm run worker:once
npm run dev
```

The API starts at `http://localhost:3001`. Open the web URL printed by Expo
(default: `http://localhost:8081`), or use its QR code with a compatible Expo
client. Keep the API and app running. In another terminal, start recurring
collection when needed:

```sh
npm run worker
```

The worker polls every five minutes. Initial collection can take time, and some
sources may fail independently. Inspect the cycle summary; an empty feed never
silently fills itself with fabricated stories.

### Run on a phone

Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your computer's LAN address,
for example `http://192.168.1.20:3001`. The phone must be able to reach that
address; `localhost` on a phone points to the phone itself. Restart Expo after
changing public environment variables.

```sh
npm run android --workspace @zuno/mobile
npm run ios --workspace @zuno/mobile
```

These commands require the corresponding Android or iOS development tools.
See the [operations guide](docs/operations.md) for local database alternatives
and authentication setup.

## Configuration

Server settings live in the root `.env`; client settings live in
`apps/mobile/.env`. Both files are ignored by Git.

| Setting | Purpose |
| --- | --- |
| `MONGODB_URI`, `MONGODB_DB` | Persistent storage shared by the API and worker |
| `PORT`, `CORS_ORIGINS` | API port and allowed browser origins |
| `EDITOR_MODE` | `extractive` by default; `langchain` enables model editing |
| `EDITOR_PROVIDER` | Explicitly select `local` or `bedrock` for model editing |
| `LOCAL_MODEL_URL`, `LOCAL_MODEL_NAME` | Localhost OpenAI-compatible model endpoint and model |
| `BEDROCK_REGION`, `BEDROCK_MODEL_ID`, `AWS_BEARER_TOKEN_BEDROCK` | Optional, billable Bedrock inference |
| `CLERK_SECRET_KEY`, `CLERK_AUTHORIZED_PARTIES` | Optional development sign-in; required production identity configuration |
| `EXPO_PUBLIC_API_URL` | API address accessible from the browser or device |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional client sign-in configuration |
| `DEMO_MODE` | Development-only, temporary storage local to each process |

Demo mode does **not** share data between separate API and worker processes.
Use MongoDB for an ingested feed. Never put secrets in `EXPO_PUBLIC_*` variables:
those values ship to the client.

For model configuration, timeouts, evidence requirements and failure behavior,
read the [content workflow](docs/content-workflow.md). Local inference requires
suitable hardware; Bedrock inference incurs AWS charges.

## How it works

1. **Collect** from approved public RSS feeds and APIs with bounded requests.
2. **Normalize and deduplicate** evidence while preserving source identity.
3. **Draft and edit** using source excerpts or the optional fixed model workflow.
4. **Verify** the story schema, citations and evidence requirements.
5. **Publish** validated cards through idempotent writes and serve a paginated feed.

Every bullet references supplied evidence. Model-written claims require evidence
review and exact supporting quotes. Numbers, dates and uncertainty must survive
editing. Failed jobs stay recoverable; one source failure does not discard the
rest of a run.

Source images retain attribution and must use approved hosts. Missing images
receive an honest fallback. Zuno never invents an image or quote.

These checks reduce errors, but they do not prove every paraphrase is correct.
Model quality needs evaluation before public release. See the
[source register](docs/sources.md) for enabled sources and usage limits.

## Project structure

```text
apps/mobile/       Expo app: feed, mobile deck, components and theme
services/api/      HTTP routes, query validation and Clerk verification
services/worker/   Source adapters, evidence processing and publishing
packages/shared/   Public schemas and repository contracts
packages/storage/  MongoDB and isolated in-memory implementations
prompts/           Versioned writing, humanizing and verification instructions
tests/             Unit, integration and browser tests with controlled fixtures
scripts/           Development tools and architecture checks
docs/              Product decisions, source register and operating guides
assets/skills/     Licensed editorial reference material
```

Dependencies point inward: mobile uses shared contracts; API and worker use
shared contracts and storage; storage uses shared. Shared code stays independent
of server runtimes. `npm run check:architecture` enforces direct import boundaries.

The backend uses TypeScript, Hono, Zod and MongoDB. The client uses Expo, React
and React Native. Optional editorial calls use LangChain. The MVP needs no Redis,
vector database or message broker. Read the [architecture](docs/architecture.md)
for leases, retry behavior, pagination and the limits of static import checks.

## Development commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API and Expo web client |
| `npm run worker:once` | Run one ingestion and publishing cycle |
| `npm run worker` | Run recurring ingestion |
| `npm run enrich -- 100` | Refresh evidence/images for up to 100 GitHub/DEV cards |
| `npm run check` | Enforce file limits, dependency boundaries and TypeScript checks |
| `npm test` | Run unit and integration tests |
| `npm run test:coverage` | Run tests with enforced backend coverage thresholds |
| `npm run build:web` | Export the web app to `apps/mobile/dist` |
| `npm run test:e2e` | Run desktop and mobile browser checks against the web export |

The enrichment command uses retained inbox evidence for eligible GitHub and
DEV Community cards; it is not a model-based bulk rewrite.

Build the web export before running browser tests:

```sh
npm run check
npm test
npm run test:coverage
npm run build:web
npx playwright install chromium
npm run test:e2e
```

CI runs these gates on pushes and pull requests. Tests use controlled evidence,
model responses and isolated MongoDB instances. They must never connect to another
project's database. First-time integration runs may download a MongoDB test binary.

## Contributing

Start with [AGENTS.md](AGENTS.md) and the nearest folder's agent guide.

- Keep authored code files at **100 physical lines or fewer**, including tests.
- Write a failing behavioral test before adding nontrivial logic.
- Maintain **at least 80%** backend statement, branch, function and line coverage.
- Validate external data at boundaries and keep editorial instructions in `prompts/`.
- Prefer small, named functions and existing dependencies over speculative layers.
- Preserve evidence, failure isolation and other contributors' changes.

See the [product scope](docs/PRD.md), [content workflow](docs/content-workflow.md)
and [operations guide](docs/operations.md) before changing their contracts.

## Security and release status

Public reads require no account; personal routes verify Clerk identity on the
server. Production requires explicit database, CORS and authentication settings.
Source requests use approved hosts, timeouts, response-size caps and redirect
restrictions. Editorial models receive bounded evidence without shell access,
credentials or unrestricted networking.

The current dependency audit has unresolved advisories. Passing tests do not
resolve them. Review [security status](docs/security.md) before deployment,
along with source usage terms, model quality, backups and native-device testing.
The API rate limiter is process-local and needs a shared replacement before
scaling across serving processes.

Notifications, portfolios, live price data, comments and user submissions are
outside this MVP.

## License and acknowledgements

Zuno is licensed under [MIT](LICENSE). Vendored editorial reference material
retains its upstream licenses and pinned provenance in
[assets/skills](assets/skills/README.md).
