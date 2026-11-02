import { expect, it } from 'vitest';
import { storyScrollBoundary } from '../../apps/mobile/src/components/MobileStoryScroll';

it('leaves short or unmeasured cards available for deck swipes', () => {
  expect(storyScrollBoundary({ offset: 0, viewport: 0, content: 600 }))
    .toEqual({ top: true, bottom: true });
  expect(storyScrollBoundary({ offset: 0, viewport: 400, content: 390 }))
    .toEqual({ top: true, bottom: true });
});

it('permits card gestures only at the corresponding text scroll boundary', () => {
  expect(storyScrollBoundary({ offset: 1, viewport: 300, content: 600 }))
    .toEqual({ top: true, bottom: false });
  expect(storyScrollBoundary({ offset: 150, viewport: 300, content: 600 }))
    .toEqual({ top: false, bottom: false });
  expect(storyScrollBoundary({ offset: 299, viewport: 300, content: 600 }))
    .toEqual({ top: false, bottom: true });
});
