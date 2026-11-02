import { randomUUID } from 'node:crypto';
import type { Db } from 'mongodb';
import type { Evidence } from '@zuno/shared';
import { fingerprint } from './normalize.js';
import { mongoInbox } from './mongo-inbox.js';

export type Entry = { key: string; evidence: Evidence; token: string };
export type Inbox = { add(items: Evidence[]): Promise<void>; take(limit: number, exclude?: string[]): Promise<Entry[]>;
  finish(entry: Entry, status?: 'done' | 'retry' | 'pending'): Promise<void> };
export const evidenceKey = (item: Evidence) => `${item.sourceId}:${item.id}:${fingerprint(JSON.stringify([item.text, item.image]))}`;
export async function createInbox(db?: Db): Promise<Inbox> {
  if (db) return mongoInbox(db);
  const records = new Map<string, { evidence: Evidence; done: boolean; lease: number;
    attempts: number; next: number; token?: string }>();
  return {
    async add(items) {
      for (const evidence of items) {
        const key = evidenceKey(evidence);
        if (!records.has(key)) records.set(key, { evidence, done: false, lease: 0, attempts: 0, next: 0 });
      }
    },
    async take(limit, exclude = []) {
      const skipped = new Set(exclude);
      const eligible = [...records.entries()].filter(([key, item]) => !skipped.has(key) && !item.done &&
        item.lease < Date.now() && item.next < Date.now()).slice(0, limit);
      return eligible.map(([key, item]) => {
        const token = randomUUID();
        records.set(key, { ...item, token, lease: Date.now() + 600_000 });
        return { key, evidence: item.evidence, token };
      });
    },
    async finish(entry, status = 'done') {
      const item = records.get(entry.key);
      if (!item || item.token !== entry.token) return;
      records.set(entry.key, { ...item, done: status === 'done', lease: 0,
        attempts: item.attempts + (status === 'retry' ? 1 : 0), next: status === 'retry' ? Date.now() + 60_000 : 0 });
    },
  };
}
