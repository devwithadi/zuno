import { expect, it, vi } from 'vitest';
import { createMemoryRepository } from '@zuno/storage';
import { createInbox } from '../../services/worker/inbox.js';
import { extractStory } from '../../services/worker/editor.js';
import { runPipeline } from '../../services/worker/pipeline.js';
import type { Evidence } from '@zuno/shared';
import { evidence as reviewedEvidence, story as reviewedStory, review } from '../support/editorial.js';

const items: Evidence[] = Array.from({ length: 40 }, (_, index) => ({
  id: `item-${index}`, sourceId: 'test', sourceName: 'Test source',
  title: `Important announcement number ${index}`, url: `https://example.com/${index}`,
  text: `Announcement ${index} explains how the project processes application records on the user's computer. ` +
    'Developers can inspect a detailed report that keeps related failures together and includes their original context. ' +
    'The project remains in preview and the documentation warns that compatibility can change between releases.',
  publishedAt: '2026-10-30T00:00:00.000Z', topic: 'technology',
}));

it('attempts thirty cards by default with three parallel editors and short inbox leases', async () => {
  const repository = createMemoryRepository();
  const inbox = await createInbox();
  await inbox.add(items);
  const take = vi.spyOn(inbox, 'take');
  let active = 0;
  let peak = 0;
  const editor = vi.fn(async (evidence: Evidence[]) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active -= 1;
    return { story: extractStory(evidence), review: { approved: true, claims: [] } };
  });
  const result = await runPipeline({ repository, inbox, editor, sources: [] });
  expect(result.published).toBe(30);
  expect(editor).toHaveBeenCalledTimes(30);
  expect(peak).toBe(3);
  expect(take.mock.calls.every(([limit]) => limit <= 3)).toBe(true);
  expect((await inbox.take(50))).toHaveLength(10);
});

it('does not spend later waves retrying earlier failures during a long run', async () => {
  vi.useFakeTimers();
  try {
    const repository = createMemoryRepository();
    const inbox = await createInbox();
    await inbox.add(items);
    const attempted: string[] = [];
    const editor = async (evidence: Evidence[]) => {
      attempted.push(evidence[0].id);
      vi.setSystemTime(Date.now() + 90_000);
      throw Error('Model refused');
    };
    const result = await runPipeline({ repository, inbox, editor, sources: [] });
    expect(result.failed).toBe(30);
    expect(new Set(attempted).size).toBe(30);
  } finally { vi.useRealTimers(); }
});

it('upgrades previously edited cards that no longer meet the depth floor', async () => {
  const repository = createMemoryRepository();
  await repository.save({ ...reviewedStory, bullets: reviewedStory.bullets.slice(0, 2) });
  const inbox = await createInbox();
  await inbox.add(reviewedEvidence);
  const editor = vi.fn(async () => ({ story: reviewedStory, review }));
  const result = await runPipeline({ repository, inbox, editor, sources: [] });
  expect(result.refreshed).toBe(1);
  expect(editor).toHaveBeenCalledOnce();
});
