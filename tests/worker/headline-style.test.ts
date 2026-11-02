import { expect, it } from 'vitest';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const evidence: Evidence[] = [{ id: 'a', sourceId: 'github', sourceName: 'Project README',
  url: 'https://github.com/deepseek-ai/tool', title: 'A developer preview from DeepSeek',
  text: 'DeepSeek Harness is an open-source agent toolkit from DeepSeek AI. It is in developer preview.',
  topic: 'technology', publishedAt: '2026-10-31T00:00:00.000Z' }];
const original = extractStory(evidence);
const support = { supported: true, quotes: [{ sourceId: 'a', text: evidence[0].text }] };
const review = { approved: true, headline: support,
  claims: original.bullets.map((_, bulletIndex) => ({ bulletIndex, ...support })) };
it('rejects repeated headline keywords even when the facts are reviewed', () => {
  const candidate = { ...original, mode: 'langchain',
    title: 'DeepSeek Harness: an open-source harness from DeepSeek' };
  expect(() => verifyStory(candidate, evidence, review)).toThrow('repeats a keyword');
});
it('permits repeated grammatical words and distinct hyphenated product names', () => {
  const candidate = { ...original, mode: 'langchain',
    title: 'A toolkit for developers and a preview for early users' };
  expect(verifyStory(candidate, evidence, review).title).toBe(candidate.title);
});
it('keeps source-excerpt titles unchanged even if their original wording repeats', () => {
  const repeated = [{ ...evidence[0], title: 'A tool for a tool builder' }];
  expect(verifyStory(extractStory(repeated), repeated).title).toBe(repeated[0].title);
});
