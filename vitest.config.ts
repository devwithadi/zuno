import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['packages/shared/src/**/*.ts', 'packages/storage/src/**/*.ts',
        'services/api/**/*.ts', 'services/worker/**/*.ts'],
      exclude: ['**/main.ts', '**/index.ts'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});
