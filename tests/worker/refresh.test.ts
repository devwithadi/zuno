import { expect, it, vi } from 'vitest';
import { fingerprint } from '../../services/worker/normalize.js';
import { createInbox } from '../../services/worker/inbox.js';
import { extractStory } from '../../services/worker/editor.js';
import { runPipeline } from '../../services/worker/pipeline.js';
import { sources } from '../../services/worker/sources.js';
import type { Evidence, StoryRepository } from '@zuno/shared';

const evidence: Evidence = { id: fingerprint('https://dev.to/zuno/diagnostics'), sourceId: 'dev', sourceName: 'DEV Community',
  url: 'https://dev.to/zuno/diagnostics', title: 'A useful developer diagnostic application',
  text: 'A useful developer diagnostic application.', topic: 'technology',
  publishedAt: '2026-10-20T10:00:00.000Z' };
const body = 'The tool inspects application errors without uploading private logs. It groups repeated failures so developers can identify the underlying cause. Teams can export a detailed diagnostic report to share with their colleagues.';
it('reopens enriched evidence while keeping completed originals for provenance', async () => {
  const inbox = await createInbox();
  await inbox.add([evidence]);
  const [original] = await inbox.take(1);
  await inbox.finish(original);
  await inbox.add([{ ...evidence, text: body }]);
  const [enriched] = await inbox.take(1);
  expect(enriched.evidence.text).toBe(body);
  expect(enriched.key).not.toBe(original.key);
});
it('refreshes existing thin cards with richer evidence and keeps original publication order', async () => {
  const original = extractStory([evidence]);
  const refresh = vi.fn().mockResolvedValue(true);
  const repository: StoryRepository = { list: vi.fn(), find: async () => original,
    save: vi.fn(), refresh };
  const result = await runPipeline({ repository, sources: [sources.find((source) => source.id === 'dev')!],
    fetchText: async (url) => url.includes('/articles?') ? '[{"id":42}]' : JSON.stringify({
      title: evidence.title, url: evidence.url, body_markdown: body,
      published_at: '2026-10-24T10:00:00.000Z', cover_image: 'https://media2.dev.to/cover.png',
    }),
  });
  expect(result).toMatchObject({ published: 0, refreshed: 1 });
  expect(refresh.mock.calls[0][0].bullets).toHaveLength(3);
  expect(refresh.mock.calls[0][0].publishedAt).toBe(original.publishedAt);
  expect(refresh.mock.calls[0][0].image.url).toBe('https://media2.dev.to/cover.png');
  expect(repository.save).not.toHaveBeenCalled();
});
it('keeps detailed pointers and original citations when only a fallback avatar is new', async () => {
  const { richerStory } = await import('../../services/worker/refresh.js');
  const rich = extractStory([{ ...evidence, text: body }]);
  const weak = { ...extractStory([evidence]), image: { url: 'https://github.com/zuno.png?size=800',
    alt: 'Zuno owner', credit: 'Repository owner avatar · GitHub' } };
  const merged = richerStory(rich, weak)!;
  expect(merged.bullets).toEqual(rich.bullets);
  expect(merged.sources).toEqual(rich.sources);
  expect(merged.image).toEqual(weak.image);
  const covered = { ...rich, image: { url: 'https://media2.dev.to/original.png', alt: 'Original cover' } };
  expect(richerStory(covered, weak)).toBeUndefined();
});
it('preserves the real cover when longer evidence supplies no image', async () => {
  const { richerStory } = await import('../../services/worker/refresh.js');
  const old = { ...extractStory([evidence]), image: { url: 'https://media2.dev.to/cover.png', alt: 'Cover' } };
  const candidate = extractStory([{ ...evidence, text: body }]);
  const merged = richerStory(old, candidate)!;
  expect(merged.image).toEqual(old.image);
  expect(merged.bullets).toEqual(candidate.bullets);
  expect(merged.publishedAt).toBe(old.publishedAt);
  expect(richerStory(old, { ...candidate, title: 'A completely different article' })).toBeUndefined();
  expect(richerStory(old, { ...candidate, sources: [{ ...candidate.sources[0],
    url: 'https://dev.to/someone/else' }] })).toBeUndefined();
});

it('upgrades excerpts to reviewed hook headlines without losing identity or publication order', async () => {
  const { richerStory } = await import('../../services/worker/refresh.js');
  const original = extractStory([evidence]);
  const candidate = { ...extractStory([{ ...evidence, text: body }]),
    title: 'Find app errors without uploading private logs', mode: 'langchain' as const };
  const upgraded = richerStory(original, candidate)!;
  expect(upgraded).toMatchObject({ title: candidate.title, mode: 'langchain',
    id: original.id, publishedAt: original.publishedAt });
  expect(richerStory(upgraded, original)).toBeUndefined();
});
