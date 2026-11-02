import { randomUUID } from 'node:crypto';
import type { Db } from 'mongodb';

export type Jobs = {
  order?(ids: string[]): Promise<string[]>;
  claim(id: string): Promise<string | null>;
  finish(id: string, token: string, error?: string): Promise<void>;
};
type Job = { _id: string; token: string; leaseUntil: Date; nextRun: Date;
  attempts: number; startedAt?: Date; lastSuccess?: Date; error?: string };
export async function createJobs(db?: Db): Promise<Jobs> {
  if (!db) {
    const active = new Set<string>();
    const attempted = new Map<string, number>();
    return {
      async order(ids) {
        return ids.toSorted((a, b) => (attempted.get(a) ?? -1) - (attempted.get(b) ?? -1));
      },
      async claim(id) {
        if (active.has(id)) return null;
        active.add(id);
        attempted.set(id, Date.now());
        return id;
      },
      async finish(id) { active.delete(id); },
    };
  }
  const collection = db.collection<Job>('workerJobs');
  return {
    async order(ids) {
      const records = await collection.find({ _id: { $in: ids } },
        { projection: { startedAt: 1 } }).toArray();
      const attempted = new Map(records.map((record) => [record._id, record.startedAt?.getTime() ?? -1]));
      return ids.toSorted((a, b) => (attempted.get(a) ?? -1) - (attempted.get(b) ?? -1));
    },
    async claim(id) {
      const now = new Date();
      const token = randomUUID();
      try {
        const job = await collection.findOneAndUpdate({ _id: id,
          leaseUntil: { $lte: now }, nextRun: { $lte: now } }, {
          $set: { token, startedAt: now, leaseUntil: new Date(+now + 600_000) },
          $setOnInsert: { nextRun: now, attempts: 0 },
        }, { upsert: true, returnDocument: 'after' });
        return job?.token === token ? token : null;
      } catch (error) {
        if ((error as { code?: number }).code === 11000) return null;
        throw error;
      }
    },
    async finish(id, token, error) {
      const job = await collection.findOne({ _id: id, token });
      if (!job) return;
      const attempts = error ? job.attempts + 1 : 0;
      const delay = error ? Math.min(3_600_000, 30_000 * 2 ** Math.min(attempts, 7)) : 300_000;
      const base = error ? Date.now() : (job.startedAt?.getTime() ?? Date.now());
      await collection.updateOne({ _id: id, token }, { $set: {
        leaseUntil: new Date(0), nextRun: new Date(base + delay), attempts,
        ...(error ? { error: error.slice(0, 300) } : { lastSuccess: new Date(), error: '' }),
      } });
    },
  };
}
