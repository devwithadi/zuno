import { expect, it, vi } from 'vitest';
import { collect, sources } from '../../services/worker/sources.js';
import { runPipeline } from '../../services/worker/pipeline.js';
import { createJobs } from '../../services/worker/jobs.js';
import { createEditor } from '../../services/worker/langchain-editor.js';
import type { StoryRepository } from '@zuno/shared';
import { points } from '../support/editorial.js';

it('reads RSS snippets and removes markup without following article URLs', async () => {
  const source = { ...sources.find((entry) => entry.id === 'dev')!, kind: 'rss' as const };
  const get = vi.fn().mockResolvedValue('<rss><channel><item><title>A new useful tool released</title>' +
    '<link>https://dev.to/news?utm_source=test</link><description>&lt;b&gt;Useful details&lt;/b&gt;</description>' +
    '<pubDate>Sat, 24 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>');
  const items = await collect(source, get);
  expect(items).toHaveLength(1);
  expect(items[0].url).toBe('https://dev.to/news');
  expect(get).toHaveBeenCalledTimes(1);
});
it('isolates broken sources and avoids editorial calls for already edited cards', async () => {
  const source = sources.find((entry) => entry.id === 'github')!;
  const repository: StoryRepository = { list: vi.fn(), find: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(true), refresh: vi.fn().mockResolvedValue(true) };
  const get = vi.fn(async (url: string) => {
    if (url.includes('hacker-news')) throw Error('offline');
    if (url.includes('raw.githubusercontent')) return 'The community tool checks application errors locally without uploading private logs. It groups repeated failures so developers can identify the underlying cause. Teams can export a detailed diagnostic report to share with their colleagues.';
    return JSON.stringify({ items: [{ full_name: 'zuno/community',
      html_url: 'https://github.com/zuno/community', description: 'Community tools for developers.',
      updated_at: '2026-10-24T10:00:00.000Z' }] });
  });
  const result = await runPipeline({ repository, sources: [sources[0], source], fetchText: get });
  expect(result).toMatchObject({ published: 1, failed: 1, failedSourceIds: ['hn'] });
  const editor = vi.fn();
  const [saved] = vi.mocked(repository.save).mock.calls[0];
  vi.mocked(repository.find).mockResolvedValue({ ...saved, mode: 'reviewed',
    bullets: points.map((text) => ({ text, sourceIds: [saved.sources[0].id] })) });
  await runPipeline({ repository, sources: [source], fetchText: get, editor });
  expect(editor).not.toHaveBeenCalled();
});
it('uses only valid HN stories and tolerates individual deleted items', async () => {
  const get = vi.fn(async (url: string) => url.includes('topstories') ? '[1,2,3]' :
    url.endsWith('/1.json') ? JSON.stringify({ title: 'A useful developer release',
      type: 'story', text: 'A useful developer release provides local diagnostics. It helps teams understand repeated application failures.', time: 1792836000, url: 'https://example.org/news' }) : 'null');
  expect(await collect(sources[0], get)).toHaveLength(1);
});
it('locks concurrent local cycles and permits retry after finish', async () => {
  const jobs = await createJobs();
  const token = await jobs.claim('hn');
  expect(token).toBeTruthy();
  expect(await jobs.claim('hn')).toBeNull();
  await jobs.finish('hn', token!);
  expect(await jobs.claim('hn')).toBeTruthy();
});
it('defaults to free extractive mode and rejects remote models', async () => {
  expect(await createEditor({})).toBeUndefined();
  await expect(createEditor({ EDITOR_MODE: 'langchain' })).rejects.toThrow();
  await expect(createEditor({ EDITOR_MODE: 'langchain', LOCAL_MODEL_NAME: 'model',
    LOCAL_MODEL_URL: 'https://api.example.com/v1' })).rejects.toThrow('localhost');
});
