import { expect, it, vi } from 'vitest';
import { createInbox } from '../../services/worker/inbox.js';
import type { Evidence } from '@zuno/shared';

it('keeps old evidence ahead of fresh content and recovers failed work', async () => {
  const inbox = await createInbox();
  const item: Evidence = { id: 'a', sourceId: 'dev', sourceName: 'DEV',
    title: 'Useful developer release', text: 'A useful developer release.',
    url: 'https://dev.to/release', topic: 'technology', publishedAt: new Date().toISOString() };
  await inbox.add([item, { ...item, id: 'b' }]);
  const first = await inbox.take(1);
  expect(first[0].evidence.id).toBe('a');
  expect((await inbox.take(1))[0].evidence.id).toBe('b');
  await inbox.finish(first[0]);
  await inbox.add([item]);
  expect(await inbox.take(1)).toEqual([]);
});

it('publishes the sixth source ahead of fresh arrivals next cycle', async () => {
  const inbox = await createInbox();
  const item: Evidence = { id: 'a', sourceId: 'dev', sourceName: 'DEV',
    title: 'Useful developer release', text: 'A useful developer release.',
    url: 'https://dev.to/release', topic: 'technology', publishedAt: new Date().toISOString() };
  await inbox.add(Array.from({ length: 6 }, (_, index) => ({ ...item, id: String(index) })));
  const first = await inbox.take(5);
  await Promise.all(first.map((entry) => inbox.finish(entry)));
  await inbox.add([{ ...item, id: 'fresh' }]);
  expect((await inbox.take(1))[0].evidence.id).toBe('5');
});
it('retries failed evidence and ignores stale lease owners', async () => {
  vi.useFakeTimers();
  try {
    const inbox = await createInbox();
    const item: Evidence = { id: 'a', sourceId: 'dev', sourceName: 'DEV',
      title: 'Useful developer release', text: 'A useful developer release.',
      url: 'https://dev.to/release', topic: 'technology', publishedAt: new Date().toISOString() };
    await inbox.add([item]);
    const [first] = await inbox.take(1);
    await inbox.finish(first, 'retry');
    expect(await inbox.take(1)).toEqual([]);
    vi.setSystemTime(Date.now() + 60_001);
    const [retry] = await inbox.take(1);
    await inbox.finish(first);
    expect(await inbox.take(1)).toEqual([]);
    await inbox.finish(retry, 'pending');
    expect(await inbox.take(1)).toHaveLength(1);
  } finally { vi.useRealTimers(); }
});
