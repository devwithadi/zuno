import { projectViolations } from './architecture.js';

const violations = projectViolations(process.cwd());
if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else console.log('Production dependencies respect the architecture boundaries.');
