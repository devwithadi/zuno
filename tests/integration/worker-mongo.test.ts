import { existsSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { createInbox } from '../../services/worker/inbox';
import { createJobs } from '../../services/worker/jobs';
import type { Evidence } from '@zuno/shared';

let server: MongoMemoryServer;
let client: MongoClient;
beforeAll(async () => {
  const systemBinary = process.env.MONGOMS_SYSTEM_BINARY ??
    (existsSync('/usr/local/bin/mongod') ? '/usr/local/bin/mongod' : undefined);
  server = await MongoMemoryServer.create({ binary: { systemBinary },
    instance: { launchTimeout: 30_000 } });
  client = await new MongoClient(server.getUri()).connect();
}, 120_000);
afterAll(async () => { await client?.close(); await server?.stop(); });
const evidence = (id: string): Evidence => ({ id, sourceId: 'source', sourceName: 'Source',
  url: `https://example.com/${id}`, title: 'A published public announcement',
  text: 'The source published a technical report.', topic: 'ai',
  publishedAt: '2026-10-24T10:00:00.000Z' });

it('retains evidence across restart, claims atomically and preserves retry state', async () => {
  const db = client.db('isolated_inbox');
  const inbox = await createInbox(db);
  await inbox.add([]);
  await inbox.add([evidence('one'), evidence('two')]);
  await inbox.add([evidence('one')]);
  const restarted = await createInbox(db);
  const [first, second] = await Promise.all([inbox.take(1), restarted.take(1)]);
  expect(first[0].key).not.toBe(second[0].key);
  expect(await inbox.take(10)).toEqual([]);
  await inbox.finish({ ...first[0], token: 'stale' });
  await inbox.finish(first[0], 'retry');
  expect(await inbox.take(1)).toEqual([]);
  await inbox.finish(second[0], 'pending');
  const retry = await inbox.take(1);
  expect(retry[0].key).toBe(second[0].key);
  await inbox.finish(retry[0]);
  const originals = await db.collection('evidenceInbox').find().toArray();
  expect(originals).toHaveLength(2);
  expect(originals.filter((item) => item.done)).toHaveLength(1);
  expect(originals.find((item) => !item.done)?.attempts).toBe(1);
});

it('leases source work exclusively and backs off failed collection', async () => {
  const db = client.db('isolated_jobs');
  const jobs = await createJobs(db);
  const results = await Promise.all([jobs.claim('feed'), jobs.claim('feed')]);
  expect(results.filter(Boolean)).toHaveLength(1);
  const token = results.find(Boolean)!;
  await jobs.finish('feed', 'stale');
  expect(await jobs.claim('feed')).toBeNull();
  await jobs.finish('feed', token, 'Fetch failed');
  expect(await jobs.claim('feed')).toBeNull();
  const record = await db.collection('workerJobs').findOne({ _id: 'feed' as never });
  expect(record?.attempts).toBe(1);
  expect(record?.error).toBe('Fetch failed');
  await db.collection('workerJobs').updateOne({ _id: 'feed' as never },
    { $set: { nextRun: new Date(0) } });
  const nextToken = await jobs.claim('feed');
  expect(nextToken).toBeTruthy();
  await jobs.finish('feed', nextToken!);
  const finished = await db.collection('workerJobs').findOne({ _id: 'feed' as never });
  expect(finished?.attempts).toBe(0);
  expect(finished?.lastSuccess).toBeInstanceOf(Date);
});
