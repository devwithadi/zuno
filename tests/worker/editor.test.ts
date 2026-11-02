import { expect, it, vi } from 'vitest';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const item: Evidence = { id: 'source', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/news', title: 'Developers released a useful new tool',
  text: 'Developers released a useful new tool with 10 examples.', topic: 'technology',
  publishedAt: '2026-10-24T10:00:00.000Z' };
it('rejects changed citations, invented images and unsupported numbers', () => {
  const story = extractStory([item]);
  expect(() => extractStory([])).toThrow();
  expect(() => verifyStory({ ...story, sources: [{ ...story.sources[0],
    url: 'https://other.example/news' }] }, [item])).toThrow();
  expect(() => verifyStory({ ...story, image: { alt: 'Stolen image',
    url: 'https://other.example/image.png' } }, [item])).toThrow();
  expect(() => verifyStory({ ...story, mode: 'deepagents', bullets: [{
    text: 'It has 100 examples.', sourceIds: ['source'] }] }, [item])).toThrow('evidence');
  expect(() => verifyStory({ ...story, bullets: [{ text: 'Something not in evidence.',
    sourceIds: ['source'] }] }, [item])).toThrow('changed evidence');
});
