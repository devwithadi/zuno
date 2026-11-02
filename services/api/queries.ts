import { z } from 'zod';
import { topicSchema } from '@zuno/shared';
import { decodeCursor } from '@zuno/storage';

export const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  topic: topicSchema.optional(),
  cursor: z.string().min(1).max(512).refine((value) => {
    try { decodeCursor(value); return true; } catch { return false; }
  }, 'Invalid cursor').optional(),
});
export const storyIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);
