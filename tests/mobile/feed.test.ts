import { describe, expect, it, vi } from 'vitest';
import { fetchFeed, feedUrl, mergeStories } from '../../apps/mobile/src/feed/client';

describe('mobile feed boundary', () => {
  it('encodes filters and stable cursors', () => {
    const url = new URL(feedUrl('https://example.com/', 'ai', 'a+b/='));
    expect(url.pathname).toBe('/api/feed');
    expect(url.searchParams.get('cursor')).toBe('a+b/=');
    expect(url.searchParams.get('topic')).toBe('ai');
  });
  it('omits the all-topics filter', () => {
    expect(feedUrl('https://example.com', 'all')).not.toContain('topic=');
  });
  it('rejects a successful response with malformed stories', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true, data: { items: [{ title: 'Untrusted' }], nextCursor: null },
    })));
    await expect(fetchFeed('https://example.com', 'all', undefined, undefined, fetcher))
      .rejects.toThrow('The feed response could not be read');
  });
  it('reports HTTP failures and does not expose server details', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('secret', { status: 503 }));
    await expect(fetchFeed('https://example.com', 'all', undefined, undefined, fetcher))
      .rejects.toThrow('The feed is unavailable');
  });
  it('accepts an empty feed', async () => {
    const page = { items: [], nextCursor: null };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: page })));
    await expect(fetchFeed('https://example.com', 'all', undefined, undefined, fetcher)).resolves.toEqual(page);
  });
  it('turns network failures into a useful recovery message', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchFeed('https://example.com', 'all', undefined, undefined, fetcher))
      .rejects.toThrow('Could not connect to the feed');
  });
  it('bounds a stalled request', async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      }));
      const result = expect(fetchFeed('https://example.com', 'all', undefined, undefined, fetcher))
        .rejects.toThrow('Could not connect to the feed');
      await vi.advanceTimersByTimeAsync(15_000);
      await result;
    } finally { vi.useRealTimers(); }
  });
  it('merges pages immutably without duplicate cards', () => {
    const previous = [{ id: 'first' }];
    const incoming = [{ id: 'first' }, { id: 'second' }];
    expect(mergeStories(previous, incoming)).toEqual([{ id: 'first' }, { id: 'second' }]);
    expect(previous).toEqual([{ id: 'first' }]);
  });
});
