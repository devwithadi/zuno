import { describe, expect, it } from 'vitest';
import { storySchema, publicUrlSchema } from '@zuno/shared';
import { fixtureStory } from '../support/story.js';

describe('published story contract', () => {
  it('accepts a cited card and strips unknown fields', () => {
    expect(storySchema.parse({ ...fixtureStory(), privateField: 'hidden' })).toEqual(fixtureStory());
  });
  it('rejects missing evidence and unsupported URLs', () => {
    const story = fixtureStory({ bullets: [{ text: 'An unsupported factual claim', sourceIds: ['unknown'] }] });
    expect(storySchema.safeParse(story).success).toBe(false);
    expect(publicUrlSchema.safeParse('http://example.com').success).toBe(false);
    expect(publicUrlSchema.safeParse('https://user:pass@example.com').success).toBe(false);
  });
  it('rejects empty cards and excessive text', () => {
    expect(storySchema.safeParse(fixtureStory({ bullets: [] })).success).toBe(false);
    expect(storySchema.safeParse(fixtureStory({ title: 'x'.repeat(161) })).success).toBe(false);
  });
});
