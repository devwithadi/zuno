import { expect, it } from 'vitest';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence[] = [{ id: 'a', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/tool', title: 'A useful tool for understanding software',
  text: 'The utility facilitates inspection of application diagnostics with 10 examples.',
  topic: 'technology', publishedAt: '2026-10-24T10:00:00.000Z' }];
const story = { ...extractStory(evidence), mode: 'deepagents' as const,
  bullets: [{ text: 'The tool helps inspect app diagnostics with 10 examples.', sourceIds: ['a'] }] };
const review = { approved: true, claims: [{ bulletIndex: 0, supported: true,
  quotes: [{ sourceId: 'a', text: evidence[0].text }] }] };
it('does not mistake the uncertainty word may for the month, but preserves actual May dates', () => {
  const source = [{ ...evidence[0], text: 'The utility could help teams inspect app diagnostics.' }];
  const base = { ...extractStory(source), mode: 'langchain' as const,
    bullets: [{ text: 'The utility may help teams inspect app diagnostics.', sourceIds: ['a'] }] };
  const checked = { approved: true, claims: [{ bulletIndex: 0, supported: true,
    quotes: [{ sourceId: 'a', text: source[0].text }] }] };
  expect(() => verifyStory(base, source, checked)).not.toThrow();
  for (const date of ['May 10', 'may 10', 'in may']) {
    expect(() => verifyStory({ ...base, bullets: [{ text: `The utility launches ${date}.`,
      sourceIds: ['a'] }] }, source, checked)).toThrow('Number or date changed');
  }
});
it('publishes simpler wording only with complete approved evidence review', () => {
  expect(verifyStory(story, evidence, review)).toEqual(story);
});
it('treats a year-range separator as punctuation while preserving signed values', () => {
  const source = [{ ...evidence[0], text: 'The forecast covers 2026-28 and a change of -10%.' }];
  const base = { ...extractStory(source), mode: 'langchain' as const,
    bullets: [{ text: 'The forecast covers 2026–28 and a change of -10%.', sourceIds: ['a'] }] };
  const checked = { approved: true, claims: [{ bulletIndex: 0, supported: true,
    quotes: [{ sourceId: 'a', text: source[0].text }] }] };
  expect(() => verifyStory(base, source, checked)).not.toThrow();
  expect(() => verifyStory({ ...base, bullets: [{ ...base.bullets[0],
    text: 'The forecast covers 2026–28 and a change of +10%.' }] }, source, checked)).toThrow();
});
it('rejects unreviewed, refused, missing and duplicated claim reviews', () => {
  expect(() => verifyStory(story, evidence)).toThrow();
  expect(() => verifyStory(story, evidence, { ...review, approved: false })).toThrow();
  expect(() => verifyStory(story, evidence, { approved: true, claims: [] })).toThrow();
  expect(() => verifyStory(story, evidence, { ...review, claims: [review.claims[0], review.claims[0]] })).toThrow();
});
it('rejects false support, unknown citations, forged quotes and altered numbers', () => {
  for (const claim of [{ ...review.claims[0], supported: false },
    { ...review.claims[0], quotes: [{ sourceId: 'missing', text: evidence[0].text }] },
    { ...review.claims[0], quotes: [{ sourceId: 'a', text: 'An invented evidence quote' }] }]) {
    expect(() => verifyStory(story, evidence, { approved: true, claims: [claim] })).toThrow();
  }
  expect(() => verifyStory({ ...story, bullets: [{ ...story.bullets[0],
    text: 'The tool helps inspect app diagnostics with 100 examples.' }] }, evidence, review)).toThrow();
  expect(() => verifyStory({ ...story, bullets: [{ ...story.bullets[0],
    sourceIds: ['a', 'b'] }] }, evidence, review)).toThrow();
});

it('rejects reversed signs, changed percentages and changed named dates', () => {
  const dated = [{ ...evidence[0], text: 'The tool reduced latency by -10% on Monday.' }];
  const base = { ...extractStory(dated), mode: 'deepagents' as const };
  const checked = { approved: true, claims: [{ bulletIndex: 0, supported: true,
    quotes: [{ sourceId: 'a', text: dated[0].text }] }] };
  for (const text of ['Latency changed by +10% on Monday.', 'Latency fell by -10% on Tuesday.']) {
    expect(() => verifyStory({ ...base, bullets: [{ text, sourceIds: ['a'] }] }, dated, checked)).toThrow();
  }
});
it('requires supporting quotes for every supplied citation', () => {
  const extra = { ...evidence[0], id: 'b', url: 'https://dev.to/extra' };
  const base = { ...extractStory([...evidence, extra]), mode: 'deepagents' as const,
    bullets: [{ ...story.bullets[0], sourceIds: ['a', 'b'] }] };
  expect(() => verifyStory(base, [...evidence, extra], review)).toThrow('Every citation');
});
