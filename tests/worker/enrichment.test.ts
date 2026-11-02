import { expect, it } from 'vitest';
import { enrichEvidence } from '../../services/worker/enrich.js';
import { sourceImage, firstImage } from '../../services/worker/images.js';
import { contentPointers } from '../../services/worker/pointers.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence = { id: 'a', sourceId: 'github', sourceName: 'GitHub',
  url: 'https://github.com/zuno/tool', title: 'A useful developer repository',
  text: 'Useful repository tools.', publishedAt: '2026-10-24T10:00:00.000Z', topic: 'technology' };
it('skips badges and SVGs while selecting the actual README raster image', async () => {
  const markdown = '![Badge](https://img.shields.io/badge/test.svg)\n' +
    '![Logo](https://raw.githubusercontent.com/zuno/tool/HEAD/logo.svg)\n' +
    '![Screenshot](https://raw.githubusercontent.com/zuno/tool/HEAD/screenshot.png)\n' +
    'The tool helps developers inspect local application failures. It identifies repeated problems without uploading logs.';
  const result = await enrichEvidence(evidence, async () => markdown);
  expect(result.image?.url).toContain('screenshot.png');
  expect(result.text).toContain('without uploading logs');
  expect(result.id).toBe(evidence.id);
  expect(result.publishedAt).toBe(evidence.publishedAt);
});
it('uses an explicitly labeled public owner avatar when no README image is available', async () => {
  const result = await enrichEvidence(evidence, async () => { throw Error('404'); });
  expect(result.image?.url).toBe('https://github.com/zuno.png?size=800');
  expect(result.image?.credit).toContain('owner avatar');
  expect(sourceImage('http://127.0.0.1/private', 'Private', 'Bad')).toBeUndefined();
  expect(firstImage('![Image](https://evil.example/image.png)')).toBeUndefined();
});
it('preserves original evidence on malformed DEV data and rejects arbitrary article fetches', async () => {
  const dev = { ...evidence, sourceId: 'dev', url: 'https://dev.to/zuno/tool' };
  expect(await enrichEvidence(dev, async () => '{}')).toEqual(dev);
  expect(await enrichEvidence({ ...dev, url: 'https://evil.example/article' },
    async () => { throw Error('Must not fetch'); })).toEqual({ ...dev, url: 'https://evil.example/article' });
});
it('does not pad repeated sentences or tiny fragments into extra pointers', () => {
  const sentence = 'The diagnostic tool helps developers understand application failures.';
  expect(contentPointers(`${sentence} ${sentence}`)).toEqual([sentence]);
  expect(contentPointers('Tiny.')).toEqual([]);
});
