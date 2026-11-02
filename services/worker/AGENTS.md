# Worker changes

Read the root guide and `docs/content-workflow.md` first.

- `pipeline.ts` orchestrates; keep parsing, evidence review and persistence in
  their existing focused modules. It must not import HTTP or UI code.
- `catalogue-*.ts` owns approved sources; `fetch.ts` owns bounded source fetching.
- `policy.ts` names cycle budgets and concurrency. Preserve existing defaults
  unless a behavior change is explicitly required and tested.
- Keep deterministic evidence checks in code and editorial instructions in
  `prompts/`. Never move factual validation into a model-only decision.
- Preserve source failure isolation, leases, retry backoff and idempotent writes.
- Test with supplied evidence and fetch/model doubles, never live source calls.

Run `npm test -- tests/worker`, `npm run check` and coverage after changes.
