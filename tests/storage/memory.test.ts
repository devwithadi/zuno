import { describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../packages/storage/src/memory.js';
import { fixtureStory } from '../support/story.js';

describe('memory repository', () => {
  it('publishes idempotently without mutating the caller', async () => {
    const repository = createMemoryRepository();
    const story = fixtureStory();
    expect(await repository.save(story)).toBe(true);
    expect(await repository.save(story)).toBe(false);
    const returned = await repository.find(story.id);
    returned!.title = 'An accidental caller mutation';
    expect((await repository.find(story.id))?.title).toBe(story.title);
  });
  it('paginates equal timestamps stably and filters topics', async () => {
    const repository = createMemoryRepository();
    for (const id of ['a', 'b', 'c']) await repository.save(fixtureStory({ id }));
    const first = await repository.list({ limit: 2 });
    const second = await repository.list({ limit: 2, cursor: first.nextCursor! });
    expect(first.items.map((item) => item.id)).toEqual(['c', 'b']);
    expect(second.items.map((item) => item.id)).toEqual(['a']);
    expect(second.nextCursor).toBeNull();
    expect((await repository.list({ limit: 2, topic: 'markets' })).items).toEqual([]);
    expect(await repository.find('missing')).toBeNull();
  });
});
