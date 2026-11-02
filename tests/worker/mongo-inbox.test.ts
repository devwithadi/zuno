import { expect, it, vi } from 'vitest';
import type { Db } from 'mongodb';
import type { Evidence } from '@zuno/shared';
import { createInbox } from '../../services/worker/inbox.js';

it('retains originals durably and uses owner-checked queue leases and retries', async () => {
  const evidence: Evidence = { id: 'a', sourceId: 'dev', sourceName: 'DEV',
    url: 'https://dev.to/test', title: 'Useful release for developers', text: 'Useful details here.',
    topic: 'technology', publishedAt: new Date().toISOString() };
  const bulkWrite = vi.fn();
  const findOneAndUpdate = vi.fn().mockResolvedValueOnce({ _id: 'dev:a', evidence }).mockResolvedValue(null);
  const findOne = vi.fn().mockResolvedValue({ attempts: 3 });
  const updateOne = vi.fn();
  const createIndex = vi.fn();
  const db = { collection: () => ({ bulkWrite, findOneAndUpdate, findOne, updateOne, createIndex }) } as unknown as Db;
  const inbox = await createInbox(db);
  await inbox.add([]);
  expect(bulkWrite).not.toHaveBeenCalled();
  await inbox.add([evidence]);
  expect(bulkWrite.mock.calls[0][0][0].updateOne.update.$setOnInsert.evidence).toEqual(evidence);
  const [entry] = await inbox.take(5, ['already-attempted']);
  expect(findOneAndUpdate.mock.calls[0][0]._id).toEqual({ $nin: ['already-attempted'] });
  expect(entry.evidence).toEqual(evidence);
  expect(findOneAndUpdate.mock.calls[0][2].sort).toEqual({ queuedAt: 1, _id: 1 });
  await inbox.finish(entry, 'retry');
  expect(updateOne.mock.calls[0][1].$set.done).toBe(false);
  expect(updateOne.mock.calls[0][1].$inc.attempts).toBe(1);
  await inbox.finish(entry);
  expect(updateOne.mock.calls[1][1].$set.done).toBe(true);
  await inbox.finish(entry, 'pending');
  expect(updateOne.mock.calls[2][1].$inc.attempts).toBe(0);
  findOne.mockResolvedValue(null);
  await inbox.finish(entry);
  expect(updateOne).toHaveBeenCalledTimes(3);
});
