import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../services/api/app.js';
import { repository } from './fixtures.js';

describe('public HTTP API', () => {
  it('allows guests to read a validated feed', async () => {
    const storage = repository();
    const response = await createApp({ repository: storage }).request('/api/feed?topic=ai&limit=2');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true, data: { items: [], nextCursor: null },
    });
    expect(storage.list).toHaveBeenCalledWith({ topic: 'ai', limit: 2 });
  });

  it.each(['limit=0', 'limit=51', 'limit=oops', 'topic=politics',
    'cursor=%3Cscript%3E', 'cursor=garbage']) (
    'rejects invalid query %s', async (query) => {
      const storage = repository();
      const response = await createApp({ repository: storage }).request(`/api/feed?${query}`);
      expect(response.status).toBe(400);
      expect(storage.list).not.toHaveBeenCalled();
    },
  );

  it('returns missing stories and invalid ids safely', async () => {
    const app = createApp({ repository: repository() });
    expect((await app.request('/api/stories/missing')).status).toBe(404);
    expect((await app.request('/api/stories/invalid!')).status).toBe(400);
    expect((await app.request('/missing')).status).toBe(404);
  });

  it('returns one story', async () => {
    const storage = repository();
    vi.mocked(storage.find).mockResolvedValue({ id: 'story' } as never);
    const response = await createApp({ repository: storage }).request('/api/stories/story');
    expect(await response.json()).toEqual({ success: true, data: { id: 'story' } });
  });

  it('passes valid opaque pagination cursors to storage', async () => {
    const storage = repository();
    const cursor = Buffer.from(JSON.stringify({ publishedAt: '2026-10-24T12:00:00.000Z',
      id: 'story-1' })).toString('base64url');
    const response = await createApp({ repository: storage }).request(`/api/feed?cursor=${cursor}`);
    expect(response.status).toBe(200);
    expect(storage.list).toHaveBeenCalledWith({ cursor, limit: 20 });
  });

  it('hides storage errors and reports them to the supplied logger', async () => {
    const storage = repository();
    vi.mocked(storage.list).mockRejectedValue(new Error('mongodb://private-password'));
    const onError = vi.fn();
    const response = await createApp({ repository: storage, onError }).request('/api/feed');
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private-password');
    expect(onError).toHaveBeenCalledOnce();
  });

  it('allows configured browser origins only', async () => {
    const app = createApp({ repository: repository(), origins: ['https://zuno.example'] });
    const good = await app.request('/health', { headers: { Origin: 'https://zuno.example' } });
    const bad = await app.request('/health', { headers: { Origin: 'https://evil.example' } });
    expect(good.headers.get('access-control-allow-origin')).toBe('https://zuno.example');
    expect(bad.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('reports explicit demo mode and allows browser authentication preflight', async () => {
    const app = createApp({ repository: repository(), demo: true, origins: ['https://zuno.example'] });
    const response = await app.request('/health');
    expect(await response.json()).toEqual({ success: true, data: { status: 'ok', demo: true } });
    const preflight = await app.request('/api/me', {
      method: 'OPTIONS', headers: { Origin: 'https://zuno.example',
        'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Authorization' },
    });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-headers')).toContain('Authorization');
  });
});
