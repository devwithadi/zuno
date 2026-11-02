import { expect, it } from 'vitest';
import { contentPointers } from '../../services/worker/pointers.js';
import { contentText } from '../../services/worker/content-text.js';

const facts = 'The application runs locally and keeps project files on the device. It supports multiple operating systems without requiring a cloud account.';
const navigation = [
  'Models · Install · Hardware · Tools · Help · Support.',
  'English · 简体中文 · 日本語 · Deutsch · Français · Español · Português.',
  'Demo &bull; Quickstart &bull; Develop &bull;.',
  '⭐ Help more people find Hypit and grow the community.',
];

it.each(navigation)('excludes navigation and promotional text: %s', (noise) => {
  expect(contentPointers(`${noise} ${facts}`)).toEqual(contentPointers(facts));
  expect(contentPointers(noise)).toEqual([]);
});

it('normalizes blockquotes and emphasis before evidence extraction', () => {
  const normalized = contentText('> *All you do is select a local folder to begin.*\n\n' +
    '> **The application keeps your source files on your device.**');
  expect(normalized).toBe('All you do is select a local folder to begin. The application keeps your source files on your device.');
  expect(contentPointers(normalized)).toEqual([
    'All you do is select a local folder to begin.',
    'The application keeps your source files on your device.',
  ]);
});

it('normalizes quote markers in joined README paragraphs without changing comparisons', () => {
  expect(contentText('A local editor. > *All you do is select your workspace.*'))
    .toBe('A local editor. All you do is select your workspace.');
  expect(contentText('The threshold is x > y and the value is a*b.'))
    .toBe('The threshold is x > y and the value is a*b.');
});

it('keeps supported factual lists and non-English content', () => {
  expect(contentPointers('The application supports Linux · macOS · Windows without a cloud account.'))
    .toEqual(['The application supports Linux · macOS · Windows without a cloud account.']);
  expect(contentPointers('本地运行的应用程序可以处理文件，并且不需要云账户。')).toHaveLength(1);
  expect(contentPointers(`${navigation[0]} It runs locally.`)).toEqual(['It runs locally.']);
});
