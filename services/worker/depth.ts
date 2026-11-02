import type { Story } from '@zuno/shared';

export function hasBriefDepth(story: Story): boolean {
  if (story.mode === 'extractive') {
    return story.bullets.length >= 3 &&
      story.bullets.reduce((length, point) => length + point.text.length, 0) >= 220;
  }
  const words = story.bullets.map((point) => point.text.trim().split(/\s+/).filter(Boolean).length);
  return words.length === 5 && words.every((count) => count >= 28) &&
    words.reduce((total, count) => total + count, 0) >= 180;
}
