import { expect, it, vi } from 'vitest';
import type { Db } from 'mongodb';
import type { Source } from '@zuno/shared';
import { createJobs } from '../../services/worker/jobs.js';
import { collectSources } from '../../services/worker/collect-sources.js';

const sources: Source[] = Array.from({ length: 20 }, (_, index) => ({
  id: `source-${index}`, name: `Source ${index}`, url: `https://feed${index}.example/rss`,
  kind: 'rss', topic: 'technology', enabled: true,
}));
const emptyFeed = '<rss><channel></channel></rss>';
it('collects every enabled source in one cycle', async () => {
  const jobs = await createJobs();
  const get = vi.fn().mockResolvedValue(emptyFeed);
  const first = await collectSources(sources, jobs, get);
  expect(first.filter((result) => result.token)).toHaveLength(20);
  expect(get).toHaveBeenCalledTimes(20);
  await Promise.all(first.flatMap((result) => result.token ? [jobs.finish(result.source, result.token)] : []));
  const second = await collectSources(sources, jobs, get);
  expect(second.filter((result) => result.token).map((result) => result.source))
    .toEqual(sources.map((source) => source.id));
});
it('does not spend the collection budget on active or backoff sources', async () => {
  const jobs = await createJobs();
  await Promise.all(sources.slice(0, 5).map((source) => jobs.claim(source.id)));
  const get = vi.fn().mockResolvedValue(emptyFeed);
  const fixedOrder = { ...jobs, order: async (ids: string[]) => ids };
  const result = await collectSources(sources, fixedOrder, get);
  expect(result.filter((entry) => entry.skipped)).toHaveLength(5);
  expect(result.filter((entry) => entry.token)).toHaveLength(15);
  expect(get).toHaveBeenCalledTimes(15);
  expect(get.mock.calls.some(([url]) => url === sources[0].url)).toBe(false);
});
it('limits simultaneous source collection to four and releases a failed source', async () => {
  const jobs = await createJobs();
  let active = 0;
  let peak = 0;
  const get = vi.fn(async (url: string) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active -= 1;
    if (url === sources[0].url) throw Error('offline');
    return emptyFeed;
  });
  const result = await collectSources(sources, jobs, get);
  expect(peak).toBeLessThanOrEqual(4);
  expect(peak).toBe(4);
  expect(result.find((entry) => entry.source === sources[0].id)?.failed).toBe(true);
  expect(await jobs.claim(sources[0].id)).toBeTruthy();
  const ordered = await jobs.order!(sources.map((source) => source.id));
  expect(ordered).toHaveLength(sources.length);
});
it('orders persisted attempts with unattempted sources first and scopes the database read', async () => {
  const toArray = vi.fn().mockResolvedValue([
    { _id: 'source-0', startedAt: new Date(2000) },
    { _id: 'source-1', startedAt: new Date(1000) },
  ]);
  const find = vi.fn((_filter: unknown, _options?: unknown) => ({ toArray }));
  const jobs = await createJobs({ collection: () => ({ find }) } as unknown as Db);
  expect(await jobs.order!(['source-0', 'source-1', 'source-2']))
    .toEqual(['source-2', 'source-1', 'source-0']);
  expect(find.mock.calls[0][0]).toEqual({ _id: { $in: ['source-0', 'source-1', 'source-2'] } });
});
it('does not claim disabled sources and supports existing Jobs doubles without ordering', async () => {
  const claim = vi.fn().mockResolvedValue('lease');
  const finish = vi.fn();
  const get = vi.fn().mockResolvedValue(emptyFeed);
  const result = await collectSources([{ ...sources[0], enabled: false }, sources[1]],
    { claim, finish }, get);
  expect(claim.mock.calls.map(([id]) => id)).toEqual([sources[1].id]);
  expect(result.map((entry) => entry.source)).toEqual([sources[1].id]);
  expect(get).toHaveBeenCalledTimes(1);
});
