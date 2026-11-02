import { expect, it } from 'vitest';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence[] = [{ id: 'a', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/tool', title: 'A useful tool for understanding software',
  text: 'The tool helps developers inspect app diagnostics with 10 examples on Monday.',
  topic: 'technology', publishedAt: '2026-10-24T10:00:00.000Z' }];
const original = extractStory(evidence);
const story = { ...original, mode: 'reviewed' as const,
  title: 'Inspect app diagnostics with 10 examples' };
const quote = { sourceId: 'a', text: evidence[0].text };
const review = { approved: true, headline: { supported: true, quotes: [quote] },
  claims: original.bullets.map((_, bulletIndex) => ({ bulletIndex,
    supported: true, quotes: [quote] })) };

it('publishes a rewritten headline with an approved exact-quote review', () => {
  expect(verifyStory(story, evidence, review).title).toBe(story.title);
});

it('requires headline review only when a non-extractive headline changes', () => {
  const { headline: _, ...withoutHeadline } = review;
  expect(() => verifyStory(story, evidence, withoutHeadline)).toThrow('headline');
  expect(verifyStory({ ...story, title: original.title }, evidence, withoutHeadline).title)
    .toBe(original.title);
});

it('rejects unsupported headline decisions and forged or unknown headline quotes', () => {
  for (const headline of [
    { supported: false, quotes: [quote] },
    { supported: true, quotes: [{ ...quote, text: 'The tool guarantees perfect results.' }] },
    { supported: true, quotes: [{ ...quote, sourceId: 'missing' }] },
  ]) expect(() => verifyStory(story, evidence, { ...review, headline })).toThrow();
});

it('rejects altered numbers, signed percentages and dates in rewritten headlines', () => {
  for (const title of ['Inspect app diagnostics with 100 examples',
    'Inspect app diagnostics on Tuesday', 'Inspect app diagnostics with +10% gains']) {
    expect(() => verifyStory({ ...story, title }, evidence, review)).toThrow('Number or date');
  }
});

it('rejects rewriting extractive headlines even when a headline review is supplied', () => {
  expect(() => verifyStory({ ...story, mode: 'extractive' }, evidence, review))
    .toThrow('Title must match evidence');
});

it('rejects headline evidence omitted from the published source list', () => {
  const extra = { ...evidence[0], id: 'b', url: 'https://dev.to/extra' };
  const headline = { supported: true, quotes: [{ sourceId: 'b', text: extra.text }] };
  expect(() => verifyStory(story, [...evidence, extra], { ...review, headline })).toThrow();
});
