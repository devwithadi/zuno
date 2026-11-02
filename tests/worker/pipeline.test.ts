import { describe, expect, it, vi } from 'vitest';
import { canonicalUrl, groupEvidence } from '../../services/worker/normalize.js';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import { safeFetch } from '../../services/worker/fetch.js';
import type { Evidence } from '@zuno/shared';

export const evidence: Evidence = {
  id: 'a', sourceId: 'hn', sourceName: 'Hacker News',
  url: 'https://example.com/news', title: 'A useful new open source tool',
  text: 'A useful new open source tool. It helps developers inspect data safely.',
  publishedAt: '2026-10-24T10:00:00.000Z', topic: 'technology',
};
describe('evidence publishing contract', () => {
  it('removes tracking and merges repeated URLs before editorial work', () => {
    expect(canonicalUrl('https://example.com/news?utm_source=x#top'))
      .toBe('https://example.com/news');
    expect(groupEvidence([evidence, { ...evidence, id: 'b' }])).toHaveLength(1);
  });
  it('preserves exact evidence and rejects invented citations and assertions', () => {
    const story = extractStory([evidence]);
    expect(story.mode).toBe('extractive');
    expect(verifyStory(story, [evidence])).toEqual(story);
    expect(() => verifyStory({ ...story, bullets: [{ text: 'Invented claim is false.',
      sourceIds: ['missing'] }] }, [evidence])).toThrow();
  });
  it('rejects unknown fetch hosts before performing a request', async () => {
    const fetcher = vi.fn();
    await expect(safeFetch('https://127.0.0.1/private', fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('denies redirects and caps response bodies', async () => {
    await expect(safeFetch('https://hacker-news.firebaseio.com/v0/newstories.json',
      vi.fn().mockResolvedValue(new Response('', { status: 302 }))))
      .rejects.toThrow();
    await expect(safeFetch('https://api.github.com/search/repositories',
      vi.fn().mockResolvedValue(new Response('x'.repeat(1_000_001)))))
      .rejects.toThrow();
  });
});
