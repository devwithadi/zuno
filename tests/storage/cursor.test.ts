import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from '../../packages/storage/src/cursor.js';

describe('feed cursor', () => {
  it('round trips a publication position', () => {
    const position = { publishedAt: '2026-10-24T10:00:00.000Z', id: 'story_1' };
    expect(decodeCursor(encodeCursor(position))).toEqual(position);
  });
  it.each(['invalid', 'e30', '!', 'A'.repeat(513)])('rejects malformed %s', (value) => {
    expect(() => decodeCursor(value)).toThrow('Invalid cursor');
  });
});
