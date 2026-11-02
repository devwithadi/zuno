import { randomUUID } from 'node:crypto';
import type { Db } from 'mongodb';
import type { Evidence } from '@zuno/shared';
import { evidenceKey, type Inbox } from './inbox.js';

type Record = { _id: string; evidence: Evidence; done: boolean; token?: string;
  leaseUntil: Date; nextAttempt: Date; queuedAt: Date; attempts: number };
export async function mongoInbox(db: Db): Promise<Inbox> {
  const collection = db.collection<Record>('evidenceInbox');
  await collection.createIndex({ done: 1, nextAttempt: 1, leaseUntil: 1, queuedAt: 1 });
  return {
    async add(items) {
      if (!items.length) return;
      await collection.bulkWrite(items.map((evidence) => ({ updateOne: {
        filter: { _id: evidenceKey(evidence) }, update: { $setOnInsert: {
          evidence, done: false, leaseUntil: new Date(0), nextAttempt: new Date(0),
          queuedAt: new Date(), attempts: 0,
        } }, upsert: true,
      } })));
    },
    async take(limit, exclude = []) {
      const entries = [];
      for (let index = 0; index < limit; index += 1) {
        const token = randomUUID();
        const now = new Date();
        const record = await collection.findOneAndUpdate({ done: false,
          ...(exclude.length ? { _id: { $nin: exclude } } : {}),
          nextAttempt: { $lte: now }, leaseUntil: { $lte: now } }, {
          $set: { token, leaseUntil: new Date(+now + 600_000) },
        }, { sort: { queuedAt: 1, _id: 1 }, returnDocument: 'after' });
        if (!record) break;
        entries.push({ key: record._id, evidence: record.evidence, token });
      }
      return entries;
    },
    async finish(entry, status = 'done') {
      const record = await collection.findOne({ _id: entry.key, token: entry.token });
      if (!record) return;
      const delay = Math.min(3_600_000, 60_000 * 2 ** Math.min(record.attempts, 6));
      await collection.updateOne({ _id: entry.key, token: entry.token }, {
        $set: { done: status === 'done', leaseUntil: new Date(0),
          nextAttempt: new Date(Date.now() + (status === 'retry' ? delay : 0)) },
        $inc: { attempts: status === 'retry' ? 1 : 0 },
      });
    },
  };
}
