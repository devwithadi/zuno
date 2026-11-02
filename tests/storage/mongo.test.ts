import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { existsSync } from 'node:fs';
import { createMongoRepository } from '../../packages/storage/src/mongo.js';
import { connectStorage } from '../../packages/storage/src/connect.js';
import { fixtureStory } from '../support/story.js';
import type { StoryRepository } from '@zuno/shared';

let server: MongoMemoryServer;
let client: MongoClient;
let repository: StoryRepository;
beforeAll(async () => {
  const systemBinary = process.env.MONGOMS_SYSTEM_BINARY ??
    (existsSync('/usr/local/bin/mongod') ? '/usr/local/bin/mongod' : undefined);
  server = await MongoMemoryServer.create({ binary: { systemBinary },
    instance: { launchTimeout: 30_000 } });
  client = await new MongoClient(server.getUri()).connect();
  repository = await createMongoRepository(client.db('isolated_test'));
}, 120_000);
afterAll(async () => { await client?.close(); await server?.stop(); });

describe('MongoDB repository', () => {
  it('atomically rejects duplicate publication under concurrent writes', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => repository.save(fixtureStory())));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await repository.find('fixture-story')).toEqual(fixtureStory());
    expect(await repository.find('missing')).toBeNull();
  });
  it('paginates equal-time records using the same order as memory', async () => {
    for (const id of ['x', 'y', 'z']) await repository.save(fixtureStory({ id, topic: 'markets' }));
    const first = await repository.list({ topic: 'markets', limit: 2 });
    const second = await repository.list({ topic: 'markets', limit: 2, cursor: first.nextCursor! });
    expect(first.items.map((story) => story.id)).toEqual(['z', 'y']);
    expect(second.items.map((story) => story.id)).toEqual(['x']);
    expect(second.nextCursor).toBeNull();
    expect((await repository.list({ limit: 10 })).items).toHaveLength(4);
  });
  it('connects to an isolated configured database', async () => {
    const storage = await connectStorage({ MONGODB_URI: server.getUri(), MONGODB_DB: 'connection_test' });
    expect(storage.db?.databaseName).toBe('connection_test');
    await storage.close();
  });
  it('updates evidence and images without changing order or inserting new cards', async () => {
    const original = (await repository.find('fixture-story'))!;
    const image = { url: 'https://example.com/cover.jpg', alt: 'Public report cover' };
    expect(await repository.refresh({ ...original, image,
      publishedAt: '2026-10-25T12:00:00.000Z' })).toBe(true);
    expect((await repository.find(original.id))?.publishedAt).toBe(original.publishedAt);
    expect((await repository.find(original.id))?.image).toEqual(image);
    expect(await repository.refresh(fixtureStory({ id: 'not-inserted' }))).toBe(false);
  });
});
