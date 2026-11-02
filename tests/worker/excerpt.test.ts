import { expect, it } from 'vitest';
import { selectExcerpt } from '../../services/worker/excerpt.js';

it('ends at a complete sentence within the reading budget', () => {
  const sentence = 'A clear release helps developers inspect their applications.';
  const text = `${sentence} ${'More supporting detail '.repeat(30)}`;
  expect(selectExcerpt(text)).toBe(sentence);
});
it('keeps an exact excerpt and avoids cutting words when a sentence is too long', () => {
  const text = 'Useful developer details '.repeat(30);
  const excerpt = selectExcerpt(text);
  expect(excerpt.length).toBeLessThanOrEqual(320);
  expect(text.startsWith(excerpt)).toBe(true);
  expect(excerpt).toMatch(/(?:Useful|developer|details)$/);
});
it('preserves short headlines and handles text without word boundaries', () => {
  expect(selectExcerpt('A useful new release')).toBe('A useful new release');
  expect(selectExcerpt('x'.repeat(400))).toHaveLength(320);
});
