import { expect, it } from 'vitest';
import { DESKTOP_SPLIT_BREAKPOINT, isDesktopSplit, presentFeed } from '../../apps/mobile/src/feed/presentation';
import { fixtureStory } from '../support/story';

it('leads with a real cover and retains every other story in order', () => {
  const avatar = fixtureStory({ id: 'avatar', image: { url: 'https://github.com/owner.png',
    alt: 'Owner', credit: 'Repository owner avatar · GitHub' } });
  const cover = fixtureStory({ id: 'cover', image: { url: 'https://dev.to/cover.png', alt: 'Cover' } });
  const last = fixtureStory({ id: 'last' });
  const items = [avatar, cover, last];
  expect(presentFeed(items)).toEqual({ featured: cover, remaining: [avatar, last] });
  expect(items).toEqual([avatar, cover, last]);
});

it('keeps empty and coverless feeds readable', () => {
  expect(presentFeed([])).toEqual({ featured: undefined, remaining: [] });
  const story = fixtureStory();
  expect(presentFeed([story])).toEqual({ featured: story, remaining: [] });
});

it('activates desktop split card at or above the responsive breakpoint', () => {
  expect(isDesktopSplit(DESKTOP_SPLIT_BREAKPOINT)).toBe(true);
  expect(isDesktopSplit(1200)).toBe(true);
  expect(isDesktopSplit(DESKTOP_SPLIT_BREAKPOINT - 1)).toBe(false);
  expect(isDesktopSplit(760)).toBe(false);
  expect(isDesktopSplit(390)).toBe(false);
});
