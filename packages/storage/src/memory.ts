import { storySchema, type Story, type StoryRepository } from '@zuno/shared';
import { decodeCursor, encodeCursor } from './cursor.js';

export function createMemoryRepository(): StoryRepository {
  const stories = new Map<string, Story>();
  return {
    async save(value) {
      const story = storySchema.parse(value);
      if (stories.has(story.id)) return false;
      stories.set(story.id, structuredClone(story));
      return true;
    },
    async find(id) { return structuredClone(stories.get(id) ?? null); },
    async refresh(value) {
      const story = storySchema.parse(value);
      const existing = stories.get(story.id);
      if (!existing) return false;
      stories.set(story.id, structuredClone({ ...story, publishedAt: existing.publishedAt }));
      return true;
    },
    async list({ limit, topic, cursor }) {
      const position = cursor ? decodeCursor(cursor) : undefined;
      const values = [...stories.values()].filter((story) =>
        (!topic || story.topic === topic) && (!position ||
          story.publishedAt < position.publishedAt ||
          (story.publishedAt === position.publishedAt && story.id < position.id)));
      const sorted = values.toSorted((a, b) => {
        const left = a.publishedAt + a.id;
        const right = b.publishedAt + b.id;
        return left === right ? 0 : left > right ? -1 : 1;
      });
      const items = sorted.slice(0, limit);
      return {
        items: structuredClone(items),
        nextCursor: sorted.length > limit ? encodeCursor(items.at(-1)!) : null,
      };
    },
  };
}
