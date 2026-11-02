import { useCallback, useEffect, useRef, useState } from 'react';
import type { FeedPage } from '@zuno/shared';
import { fetchFeed, mergeStories, type Filter } from './client';

const base = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const empty: FeedPage = { items: [], nextCursor: null };

export function useFeed(topic: Filter) {
  const [page, setPage] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const run = useCallback(async (cursor?: string) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const next = await fetchFeed(base, topic, cursor, controller.signal);
      if (!controller.signal.aborted) setPage((old) => ({
        ...next, items: cursor ? mergeStories(old.items, next.items) : next.items,
      }));
    } catch (cause) {
      if (!controller.signal.aborted) setError(
        cause instanceof Error ? cause.message : 'Could not connect. Please try again.',
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [topic]);
  useEffect(() => {
    setPage(empty);
    void run();
    return () => request.current?.abort();
  }, [run]);
  return { ...page, loading, error, refresh: () => run(),
    loadMore: () => !loading && page.nextCursor ? run(page.nextCursor) : undefined };
}
