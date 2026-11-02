import { expect, it, vi } from 'vitest';
import { sources } from '../../services/worker/registry.js';
import { safeFetch } from '../../services/worker/fetch.js';
import { enrichEvidence } from '../../services/worker/enrich.js';
import { articleBody } from '../../services/worker/article-body.js';
import type { Evidence } from '@zuno/shared';

it('provides twenty distinct sources per existing category with unique identities', () => {
  for (const topic of ['ai', 'technology', 'business', 'markets']) {
    expect(sources.filter((source) => source.enabled && source.topic === topic)).toHaveLength(20);
  }
  expect(new Set(sources.map((source) => source.id)).size).toBe(80);
  expect(new Set(sources.map((source) => source.url)).size).toBe(80);
  expect(sources.slice(0, 6).map((source) => source.id)).toEqual(['hn', 'github', 'dev', 'google', 'fed', 'sec']);
});
it('allows curated feed and public article hosts while refusing arbitrary destinations', async () => {
  const get = vi.fn().mockResolvedValue(new Response('ok'));
  await expect(safeFetch('https://blog.cloudflare.com/rss/', get)).resolves.toBe('ok');
  await expect(safeFetch('https://unapproved.example/content', get)).rejects.toThrow('approved');
  expect(get).toHaveBeenCalledTimes(1);
});
it('enriches permitted public sources but never follows Bloomberg paywalled article links', async () => {
  const item: Evidence = { id: 'cloudflare-item', sourceId: 'cloudflare', sourceName: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/research/', title: 'A new public network research release',
    text: 'A short source introduction.', topic: 'technology', publishedAt: '2026-10-31T00:00:00.000Z' };
  const facts = 'The release describes network research and the methodology used to measure its results. '.repeat(5);
  const get = vi.fn().mockResolvedValue(`<article>${facts}</article>`);
  expect((await enrichEvidence(item, get)).text).toContain('methodology');
  const paid = { ...item, sourceId: 'bloomberg-business', url: 'https://www.bloomberg.com/news/story' };
  get.mockClear();
  expect(await enrichEvidence(paid, get)).toEqual(paid);
  expect(get).not.toHaveBeenCalled();
});
it('refuses article text explicitly marked inaccessible for free', () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ '@type': 'NewsArticle',
    isAccessibleForFree: false, articleBody: 'Private paid article content. '.repeat(10) })}</script>`;
  expect(articleBody(html)).toBe('');
});
