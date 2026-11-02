import { expect, it, vi } from 'vitest';
import { runPipeline } from '../../services/worker/pipeline.js';
import { createInbox } from '../../services/worker/inbox.js';
import { hasBriefDepth } from '../../services/worker/depth.js';
import { extractStory } from '../../services/worker/editor.js';
import { fixtureStory } from '../support/story.js';
import type { Evidence, StoryRepository } from '@zuno/shared';

it('holds headline-only announcements instead of publishing empty cards', async () => {
  const inbox = await createInbox();
  const evidence: Evidence = { id: 'thin', sourceId: 'fed', sourceName: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/news', title: 'A new public policy announcement',
    text: 'A new public policy announcement.', topic: 'business',
    publishedAt: '2026-10-28T00:00:00.000Z' };
  await inbox.add([evidence]);
  const save = vi.fn();
  const repository = { find: async () => null, save } as unknown as StoryRepository;
  const result = await runPipeline({ repository, inbox, sources: [] });
  expect(save).not.toHaveBeenCalled();
  expect(result).toMatchObject({ published: 0, held: 1, failed: 0 });
});

const words = (count: number) => Array.from({ length: count }, (_, index) => `word${index}`).join(' ');
const edited = (counts: number[]) => fixtureStory({ mode: 'langchain',
  bullets: counts.map((count) => ({ text: words(count), sourceIds: ['source-1'] })) });

it('requires five contextual points and at least one hundred eighty words for edited cards', () => {
  expect(hasBriefDepth(edited([36, 36, 36, 36, 36]))).toBe(true);
  expect(hasBriefDepth(edited([50, 50, 50, 50]))).toBe(false);
  expect(hasBriefDepth(edited([35, 35, 35, 35, 35]))).toBe(false);
});
it('requires useful depth in each edited point instead of one long point with teasers', () => {
  expect(hasBriefDepth(edited([27, 40, 40, 40, 40]))).toBe(false);
  expect(hasBriefDepth(edited([28, 38, 38, 38, 38]))).toBe(true);
  const spaced = edited([36, 36, 36, 36, 36]);
  expect(hasBriefDepth({ ...spaced, bullets: spaced.bullets.map((bullet) =>
    ({ ...bullet, text: `  ${bullet.text.replaceAll(' ', ' \n ')}  ` })) })).toBe(true);
});
it('retains source-excerpt depth rules without requiring rewritten editorial length', () => {
  const story = { ...edited([15, 15, 15]), mode: 'extractive' as const };
  expect(hasBriefDepth(story)).toBe(true);
  expect(hasBriefDepth({ ...story, bullets: story.bullets.slice(0, 2) })).toBe(false);
  expect(hasBriefDepth(fixtureStory({ bullets: Array.from({ length: 3 }, () =>
    ({ text: 'Short source sentence.', sourceIds: ['source-1'] })) }))).toBe(false);
});
it('withholds a factually reviewed brief when it still lacks enough context', async () => {
  const evidence: Evidence = { id: 'context', sourceId: 'dev', sourceName: 'DEV',
    url: 'https://dev.to/context', title: 'A development tool with documented limits',
    text: 'The tool checks application errors locally without uploading private logs. It groups repeated failures so developers can identify the cause. Teams can export reports to share with colleagues. The project remains in preview and may change.',
    topic: 'technology', publishedAt: '2026-10-28T00:00:00.000Z' };
  const story = { ...extractStory([evidence]), mode: 'reviewed' as const };
  const review = { approved: true, claims: story.bullets.map((_, bulletIndex) => ({
    bulletIndex, supported: true, quotes: [{ sourceId: evidence.id, text: evidence.text }],
  })) };
  const inbox = await createInbox();
  await inbox.add([evidence]);
  const save = vi.fn();
  const repository = { find: async () => null, save } as unknown as StoryRepository;
  const result = await runPipeline({ repository, inbox, sources: [],
    editor: async () => ({ story, review }) });
  expect(result).toMatchObject({ published: 0, held: 1, failed: 0 });
  expect(save).not.toHaveBeenCalled();
});
