import { storySchema, type Topic } from '@zuno/shared';
import { z } from 'zod';

export type Filter = Topic | 'all';
const envelope = z.object({
  success: z.literal(true),
  data: z.object({ items: z.array(storySchema), nextCursor: z.string().nullable() }),
});

export function feedUrl(base: string, topic: Filter, cursor?: string) {
  const url = new URL('/api/feed', base);
  url.searchParams.set('limit', '10');
  if (topic !== 'all') url.searchParams.set('topic', topic);
  if (cursor) url.searchParams.set('cursor', cursor);
  return url.toString();
}

export async function fetchFeed(
  base: string, topic: Filter, cursor?: string, signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  const timeout = setTimeout(cancel, 15_000);
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  try {
    let response: Response;
    try {
      response = await fetcher(feedUrl(base, topic, cursor), {
        signal: controller.signal, headers: { Accept: 'application/json' },
      });
    } catch (cause) {
      if (signal?.aborted) throw cause;
      throw new Error('Could not connect to the feed. Check your connection and try again.');
    }
    if (!response.ok) throw new Error('The feed is unavailable. Please try again.');
    try {
      return envelope.parse(await response.json()).data;
    } catch {
      throw new Error('The feed response could not be read. Please try again.');
    }
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export function mergeStories<T extends { id: string }>(previous: T[], incoming: T[]): T[] {
  return [...new Map([...previous, ...incoming].map((item) => [item.id, item])).values()];
}
