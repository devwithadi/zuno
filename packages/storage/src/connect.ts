import { MongoClient } from 'mongodb';
import { createMemoryRepository } from './memory.js';
import { createMongoRepository } from './mongo.js';

export async function connectStorage(env: Record<string, string | undefined> = process.env) {
  if (env.DEMO_MODE === 'true') {
    if (env.NODE_ENV === 'production') throw new Error('Demo mode is disabled in production');
    return { repository: createMemoryRepository(), close: async () => {} };
  }
  if (!env.MONGODB_URI) throw new Error('Set MONGODB_URI or explicitly enable DEMO_MODE');
  const database = env.MONGODB_DB || 'zuno';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(database)) throw new Error('Invalid MONGODB_DB');
  const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 5_000 });
  try {
    await client.connect();
    const db = client.db(database);
    const repository = await createMongoRepository(db);
    return { repository, db, close: () => client.close() };
  } catch (error) {
    await client.close();
    throw error;
  }
}
