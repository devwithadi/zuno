import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkDependencies, projectViolations } from '../../scripts/architecture.js';

const root = process.cwd();
const check = (file: string, code: string) => checkDependencies(path.join(root, file), code, root);

describe('production dependency boundaries', () => {
  it('allows client contracts and server storage dependencies', () => {
    expect(check('apps/mobile/App.tsx', "import type { Story } from '@zuno/shared';")).toEqual([]);
    expect(check('services/api/app.ts', "import { connectStorage } from '@zuno/storage';")).toEqual([]);
    expect(check('packages/shared/src/story.ts', "import { z } from 'zod';")).toEqual([]);
  });

  it.each([
    "import { connectStorage } from '@zuno/storage';",
    "export * from '@zuno/storage';",
    "const storage = import('@zuno/storage');",
    "type Storage = import('@zuno/storage');",
    "const storage = require('@zuno/storage');",
    "import storage = require('@zuno/storage');",
  ])('rejects client storage access through every literal import form: %s', (code) => {
    expect(check('apps/mobile/App.tsx', code)).toHaveLength(1);
  });

  it('rejects relative imports across service and tooling boundaries', () => {
    expect(check('services/api/app.ts', "import '../worker/pipeline.js';")).toHaveLength(1);
    expect(check('services/api/app.ts', "import '../../scripts/import-briefs.js';")).toHaveLength(1);
    expect(check('packages/storage/src/mongo.ts', "import '../../../services/api/app.js';"))
      .toHaveLength(1);
  });

  it.each(['node:fs', 'fs/promises', 'mongodb', 'hono', '@clerk/backend', '@langchain/core'])
    ('keeps shared contracts free of server dependency %s', (name) => {
      expect(check('packages/shared/src/story.ts', `import '${name}';`)).toHaveLength(1);
    });

  it('does not confuse comments and strings with imports', () => {
    expect(check('apps/mobile/App.tsx', "// import '@zuno/storage'\nconst s = 'require(whatever)';"))
      .toEqual([]);
  });

  it('fails clearly on unresolved local imports', () => {
    expect(check('services/api/app.ts', "import './missing-module.js';")).toHaveLength(1);
    expect(check('services/api/app.ts', "import '/outside/project/missing.ts';")).toHaveLength(1);
  });

  it('keeps the actual production project within its boundaries', () => {
    expect(projectViolations(root)).toEqual([]);
  });
});
