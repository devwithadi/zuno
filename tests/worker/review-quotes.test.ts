import { expect, it } from 'vitest';
import { buildQuoteBank, resolveQuoteReview } from '../../services/worker/review-quotes.js';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence[] = [{ id: 'a', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/tool', title: 'A useful tool for understanding software',
  text: 'The tool helps developers inspect app diagnostics with 10 examples on Monday.',
  topic: 'technology', publishedAt: '2026-10-24T10:00:00.000Z' }];
const choice = { supported: true, quoteIds: ['q1'] };
const draft = { approved: true, headline: choice,
  claims: [{ bulletIndex: 0, ...choice }] };

it('builds deterministic exact source excerpts and preserves all long Unicode evidence', () => {
  const text = '原始资料保留。 🔎 source exact text\n'.repeat(500) + 'last tail';
  const bank = buildQuoteBank([{ ...evidence[0], text }]);
  expect(bank).toEqual(buildQuoteBank([{ ...evidence[0], text }]));
  expect(bank[0]).toEqual({ id: 'q0', sourceId: 'a', text: evidence[0].title });
  expect(bank.slice(1).map((quote) => quote.text).join('')).toBe(text);
  for (const quote of bank) {
    expect(quote.text.length).toBeGreaterThanOrEqual(8);
    expect(quote.text.length).toBeLessThanOrEqual(1200);
    expect([text, evidence[0].title].some((source) => source.includes(quote.text))).toBe(true);
  }
});
it('balances long text instead of dropping a tiny trailing portion', () => {
  for (const length of [1201, 1440001]) {
    const text = 'x'.repeat(length);
    const bank = buildQuoteBank([{ ...evidence[0], text }]);
    expect(bank.slice(1).map((quote) => quote.text).join('')).toBe(text);
    expect(bank.every((quote) => quote.text.length >= 8 && quote.text.length <= 1200)).toBe(true);
  }
  expect(buildQuoteBank([{ ...evidence[0], title: 'short', text: 'tiny' }])).toEqual([]);
});
it('resolves whitelisted IDs into the unchanged public review contract', () => {
  const review = resolveQuoteReview(draft, buildQuoteBank(evidence));
  expect(review.headline?.quotes).toEqual([{ sourceId: 'a', text: evidence[0].text }]);
  const story = { ...extractStory(evidence), mode: 'langchain' as const,
    title: 'Inspect app diagnostics with 10 examples' };
  expect(verifyStory(story, evidence, review)).toEqual(story);
  expect(resolveQuoteReview(review, [])).toEqual(review);
});
it('preserves refusal decisions rather than turning reference resolution into approval', () => {
  const review = resolveQuoteReview({ ...draft, approved: false,
    headline: { ...choice, supported: false } }, buildQuoteBank(evidence));
  expect(review.approved).toBe(false);
  expect(review.headline?.supported).toBe(false);
  const story = { ...extractStory(evidence), mode: 'langchain' as const };
  expect(() => verifyStory(story, evidence, review)).toThrow('refused');
});
it('rejects unknown, duplicate, missing and oversized quote references', () => {
  const bank = buildQuoteBank(evidence);
  for (const quoteIds of [['missing'], ['q1', 'q1'], [], Array(11).fill('q1')]) {
    expect(() => resolveQuoteReview({ ...draft,
      headline: { ...choice, quoteIds } }, bank)).toThrow();
  }
  expect(() => resolveQuoteReview({ ...draft, extra: true }, bank)).toThrow();
  expect(() => resolveQuoteReview({ ...draft, claims: [{ ...choice, bulletIndex: 5 }] }, bank)).toThrow();
});
it('keeps cross-source and numeric checks at the final publishing boundary', () => {
  const other = { ...evidence[0], id: 'b', url: 'https://dev.to/other' };
  const bank = buildQuoteBank([...evidence, other]);
  const review = resolveQuoteReview({ ...draft,
    claims: [{ ...choice, bulletIndex: 0, quoteIds: ['q3'] }] }, bank);
  const story = { ...extractStory(evidence), mode: 'langchain' as const };
  expect(() => verifyStory(story, [...evidence, other], review)).toThrow('quote');
});
