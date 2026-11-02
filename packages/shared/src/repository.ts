import type { Story, Topic } from './story.js';

export type FeedQuery = { limit: number; cursor?: string; topic?: Topic };
export type FeedPage = { items: Story[]; nextCursor: string | null };
export interface StoryRepository {
  list(query: FeedQuery): Promise<FeedPage>;
  find(id: string): Promise<Story | null>;
  save(story: Story): Promise<boolean>;
  refresh(story: Story): Promise<boolean>;
}
