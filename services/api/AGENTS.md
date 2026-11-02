# HTTP API

- Keep HTTP concerns here; import public contracts from shared and persistence
  through storage. Never import worker orchestration or UI implementation.
- Validate queries and identity server-side. Keep guest reads independent of login.
- Preserve response envelopes, safe errors, CORS, rate limits and secure headers.
- Keep authentication and repository dependencies injectable for isolated tests.
- Log diagnostic context through the existing error hook without logging tokens,
  source bodies, prompts or personal information.

Run `npm test -- tests/api tests/integration`, `npm run check` and coverage.
