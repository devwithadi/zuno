# Shared contracts and storage

- `shared` owns public schemas and repository contracts. It must work in the
  mobile bundle without Node, database or provider SDK dependencies.
- `storage` implements those contracts. Keep MongoDB and memory behavior aligned;
  never import services, UI, tests or development scripts into either package.
- Validate external values at the boundary; derive types from existing schemas.
- Export deliberate public contracts, not implementation helpers for convenience.
- Storage tests use isolated repositories/databases. Never fall back to a local
  environment's production connection when a test fixture is missing.

Run `npm test -- tests/shared tests/storage tests/integration` and `npm run check`.
