import type { Story } from '@zuno/shared';

export const DESKTOP_SPLIT_BREAKPOINT = 860;

export function isDesktopSplit(width: number): boolean {
  return width >= DESKTOP_SPLIT_BREAKPOINT;
}

export function presentFeed(items: Story[]) {
  const featured = items.find((story) => story.image.url &&
    !story.image.credit?.startsWith('Repository owner avatar')) ?? items[0];
  return { featured, remaining: items.filter((story) => story.id !== featured?.id) };
}
