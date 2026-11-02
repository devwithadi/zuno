import { expect, it } from 'vitest';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import { richerStory } from '../../services/worker/refresh.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence = { id: 'source', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/research/project', title: 'An accessible public research project',
  text: 'The tool runs on a laptop and does not upload private files.', topic: 'technology',
  publishedAt: '2026-10-28T00:00:00.000Z' };
it('requires supporting evidence for reviewed plain-language edits', () => {
  const story = { ...extractStory([evidence]), mode: 'reviewed' as const,
    bullets: [{ text: 'Files stay on your laptop.', sourceIds: ['source'] }] };
  expect(() => verifyStory(story, [evidence])).toThrow('review');
  const review = { approved: true, claims: [{ bulletIndex: 0, supported: true,
    quotes: [{ sourceId: 'source', text: evidence.text }] }] };
  expect(verifyStory(story, [evidence], review)).toEqual(story);
  const original = extractStory([evidence]);
  expect(richerStory(original, story)?.mode).toBe('reviewed');
  expect(richerStory(story, original)).toBeUndefined();
});
