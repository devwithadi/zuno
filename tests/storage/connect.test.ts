import { describe, expect, it } from 'vitest';
import { connectStorage } from '../../packages/storage/src/connect.js';

describe('storage configuration', () => {
  it('requires explicit persistence configuration', async () => {
    await expect(connectStorage({})).rejects.toThrow('Set MONGODB_URI');
    await expect(connectStorage({ DEMO_MODE: 'true', NODE_ENV: 'production' }))
      .rejects.toThrow('Demo mode');
    await expect(connectStorage({ MONGODB_URI: 'mongodb://localhost', MONGODB_DB: 'bad.name' }))
      .rejects.toThrow('Invalid MONGODB_DB');
  });
  it('allows an explicitly isolated demo repository', async () => {
    const storage = await connectStorage({ DEMO_MODE: 'true' });
    expect(await storage.repository.list({ limit: 10 })).toEqual({ items: [], nextCursor: null });
    await storage.close();
  });
  it('closes after a connection failure', async () => {
    await expect(connectStorage({ MONGODB_URI: 'mongodb://127.0.0.1:1' })).rejects.toThrow();
  }, 10_000);
});
