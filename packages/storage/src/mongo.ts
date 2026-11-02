import type { Db, Filter } from 'mongodb';
import { MongoServerError } from 'mongodb';
import { storySchema, type Story, type StoryRepository } from '@zuno/shared';
import { decodeCursor, encodeCursor } from './cursor.js';

type StoredStory = Story & { _id: string };
export async function createMongoRepository(db: Db): Promise<StoryRepository> {
  const collection = db.collection<StoredStory>('stories');
  await collection.createIndex({ publishedAt: -1, id: -1 });
  await collection.createIndex({ topic: 1, publishedAt: -1, id: -1 });
  return {
    async save(value) {
      const story = storySchema.parse(value);
      try {
        await collection.insertOne({ ...story, _id: story.id });
        return true;
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) return false;
        throw error;
      }
    },
    async find(id) {
      const stored = await collection.findOne({ _id: id });
      return stored ? storySchema.parse(stored) : null;
    },
    async refresh(value) {
      const { publishedAt: _publishedAt, ...story } = storySchema.parse(value);
      const result = await collection.updateOne({ _id: story.id }, { $set: story });
      return result.matchedCount === 1;
    },
    async list({ limit, topic, cursor }) {
      const position = cursor ? decodeCursor(cursor) : undefined;
      const filter: Filter<StoredStory> = {
        ...(topic ? { topic } : {}),
        ...(position ? { $or: [
          { publishedAt: { $lt: position.publishedAt } },
          { publishedAt: position.publishedAt, id: { $lt: position.id } },
        ] } : {}),
      };
      const rows = await collection.find(filter).sort({ publishedAt: -1, id: -1 })
        .limit(limit + 1).toArray();
      const items = rows.slice(0, limit).map((row) => storySchema.parse(row));
      return { items, nextCursor: rows.length > limit ? encodeCursor(items.at(-1)!) : null };
    },
  };
}
