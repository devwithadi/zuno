import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ignored = new Set(['node_modules', '.git', '.expo', '.data', 'dist', 'coverage',
  'test-results', 'playwright-report']);
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.json', '.yml']);
async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    if (ignored.has(entry.name) || entry.name === 'package-lock.json') return [];
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return scan(filename);
    if (!extensions.has(path.extname(filename))) return [];
    const contents = await readFile(filename, 'utf8');
    const lines = contents.replace(/\n$/, '').split('\n').length;
    return lines > 100 ? [`${filename}: ${lines} lines (maximum 100)`] : [];
  }))).flat();
}
const violations = await scan('.');
if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else console.log('All authored code files are within 100 lines.');
