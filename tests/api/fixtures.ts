import { vi } from 'vitest';
import type { StoryRepository } from '@zuno/shared';

export function repository(): StoryRepository {
  return {
    list: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    find: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
  };
}
