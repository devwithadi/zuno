import { expect, it, vi } from 'vitest';
import { safeFetch } from '../../services/worker/fetch.js';
import { canonicalUrl, groupEvidence } from '../../services/worker/normalize.js';
import { runPipeline } from '../../services/worker/pipeline.js';
import { sources, collect } from '../../services/worker/sources.js';
import type { StoryRepository } from '@zuno/shared';

it('accepts bounded approved responses and rejects unsafe URLs and empty bodies', async () => {
  const url = 'https://api.github.com/search/repositories';
  expect(await safeFetch(url, vi.fn().mockResolvedValue(new Response('{}')))).toBe('{}');
  await expect(safeFetch(url, vi.fn().mockResolvedValue(new Response(null))))
    .rejects.toThrow('missing');
  await expect(safeFetch(url, vi.fn().mockResolvedValue(new Response('', {
    headers: { 'content-length': '1000001' } })))).rejects.toThrow('large');
  expect(() => canonicalUrl('http://example.com')).toThrow();
  expect(canonicalUrl('https://example.com?b=1&fbclid=x&a=2')).toContain('?a=2&b=1');
  expect(groupEvidence([])).toEqual([]);
});
it('skips malformed RSS entries while rejecting malformed JSON collections', async () => {
  const rss = { ...sources.find((source) => source.id === 'dev')!, kind: 'rss' as const };
  expect(await collect(rss, async () => '<rss><channel><item><title>x</title></item></channel></rss>'))
    .toEqual([]);
  expect(await collect(rss, async () => '<rss><channel></channel></rss>')).toEqual([]);
  await expect(collect(sources[0], async () => 'invalid')).rejects.toThrow();
});
it('retains retry state when publication fails verification', async () => {
  const repository = { find: vi.fn().mockResolvedValue(null), save: vi.fn() } as unknown as StoryRepository;
  const finish = vi.fn();
  const result = await runPipeline({ repository, sources: [sources[1]],
    jobs: { claim: async () => 'token', finish }, editor: async () => { throw Error('bad output'); },
    fetchText: async () => JSON.stringify({ items: [{ full_name: 'zuno/release',
      html_url: 'https://github.com/zuno/release', description: null,
      updated_at: '2026-10-24T10:00:00.000Z' }] }),
  });
  expect(result.failed).toBe(1);
  expect(finish).toHaveBeenCalledWith('github', 'token');
  expect(result.failedSourceIds).toContain('github');
  expect(repository.save).not.toHaveBeenCalled();
});
it('does not fetch when another worker owns the lease', async () => {
  const fetchText = vi.fn();
  const result = await runPipeline({ repository: {} as StoryRepository,
    sources: [sources[0]], fetchText, jobs: { claim: async () => null, finish: vi.fn() } });
  expect(result.collected).toBe(0);
  expect(fetchText).not.toHaveBeenCalled();
});
