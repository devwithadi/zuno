import { expect, it } from 'vitest';
import { createMemoryRepository } from '../../packages/storage/src/memory';
import { fixtureStory } from '../support/story';

it('refreshes richer content without duplicating or moving its publication time', async () => {
  const repository = createMemoryRepository();
  const original = fixtureStory();
  await repository.save(original);
  const richer = { ...original, publishedAt: '2026-10-25T12:00:00.000Z',
    bullets: [...original.bullets, { text: 'The technical report contains reproducible findings.', sourceIds: ['source-1'] }],
    image: { url: 'https://example.com/cover.jpg', alt: 'Report cover', credit: 'Research blog' } };
  expect(await repository.refresh(richer)).toBe(true);
  expect(await repository.find(original.id)).toEqual({ ...richer, publishedAt: original.publishedAt });
  expect((await repository.list({ limit: 10 })).items).toHaveLength(1);
  expect(await repository.refresh(fixtureStory({ id: 'missing' }))).toBe(false);
});
