import { expect, it, vi } from 'vitest';
import { runPipeline } from '../../services/worker/pipeline.js';
import { extractStory } from '../../services/worker/editor.js';
import { fingerprint } from '../../services/worker/normalize.js';
import { sources } from '../../services/worker/sources.js';
import type { StoryRepository } from '@zuno/shared';

const body = 'The tool checks application errors locally without uploading private logs. It groups repeated failures so developers can identify the underlying cause. Teams can export a detailed diagnostic report to share with their colleagues.';

it('continues past existing cards and shares publication budget between sources', async () => {
  const existing = Array.from({ length: 5 }, (_, index) => extractStory([{
    id: fingerprint(`https://github.com/zuno/release${index}`), sourceId: 'github',
    sourceName: 'GitHub discovery', url: `https://github.com/zuno/release${index}`,
    title: `zuno/release${index}`, text: `Release ${index}. ${body}`, topic: 'technology',
    publishedAt: '2026-10-24T10:00:00.000Z',
    image: { url: 'https://github.com/zuno.png?size=800', alt: 'Owner avatar' },
  }]));
  const save = vi.fn().mockResolvedValue(true);
  const repository = { find: async (id: string) => existing.find((story) => story.id === id) ?? null,
    save } as unknown as StoryRepository;
  const get = async (url: string) => url.includes('raw.githubusercontent') ? `Release ${url.match(/release(\d+)/)?.[1]}. ${body}` : url.includes('api.github')
    ? JSON.stringify({ items: Array.from({ length: 10 }, (_, index) => ({
      full_name: `zuno/release${index}`, html_url: `https://github.com/zuno/release${index}`,
      description: `Developer release number ${index}`, updated_at: '2026-10-24T10:00:00.000Z',
    })) })
    : '<rss><channel><item><title>A public policy announcement</title>' +
      `<link>https://www.federalreserve.gov/new</link><description>${body}</description>` +
      '<pubDate>Sat, 24 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>';
  const result = await runPipeline({ repository, publicationLimit: 5,
    sources: [sources[1], sources.find((source) => source.id === 'fed')!], fetchText: get });
  expect(result.published).toBe(5);
  expect(save.mock.calls.map(([story]) => story.topic)).toContain('business');
  expect(save.mock.calls.map(([story]) => story.id)).toContain(fingerprint('https://github.com/zuno/release5'));
});

it('publishes more than five excerpts without making expensive model calls', async () => {
  const save = vi.fn().mockResolvedValue(true);
  const repository = { find: async () => null, save } as unknown as StoryRepository;
  const result = await runPipeline({ repository, sources: [sources[1]],
    fetchText: async (url) => url.includes('raw.githubusercontent') ? `Release ${url.match(/release(\d+)/)?.[1]}. ${body}` : JSON.stringify({ items: Array.from({ length: 6 }, (_, index) => ({
      full_name: `zuno/release${index}`, html_url: `https://github.com/zuno/release${index}`,
      description: `Developer release number ${index}`, updated_at: '2026-10-24T10:00:00.000Z',
    })) }),
  });
  expect(result.published).toBe(6);
  await expect(runPipeline({ repository, publicationLimit: Infinity })).rejects.toThrow('finite');
});
