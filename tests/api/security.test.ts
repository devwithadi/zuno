import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../services/api/app.js';
import { repository } from './fixtures.js';

describe('HTTP security', () => {
  it('protects personal routes and verifies bearer tokens', async () => {
    const verifyToken = vi.fn().mockResolvedValue({ sub: 'user_123' });
    const app = createApp({ repository: repository(), verifyToken });
    expect((await app.request('/api/me')).status).toBe(401);
    expect((await app.request('/api/me', { headers: { Authorization: 'Basic abc' } })).status).toBe(401);
    const response = await app.request('/api/me', { headers: { Authorization: 'Bearer valid' } });
    expect(await response.json()).toEqual({ success: true, data: { id: 'user_123' } });
    expect(verifyToken).toHaveBeenCalledWith('valid');
  });

  it('fails closed when verification is missing or rejects', async () => {
    const request = { headers: { Authorization: 'Bearer bad' } };
    const absent = createApp({ repository: repository() });
    expect((await absent.request('/api/me', request)).status).toBe(401);
    const verifyToken = vi.fn().mockRejectedValue(new Error('secret details'));
    const app = createApp({ repository: repository(), verifyToken });
    const response = await app.request('/api/me', request);
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('secret');
    verifyToken.mockResolvedValue({ sub: '' });
    expect((await app.request('/api/me', request)).status).toBe(401);
  });

  it('rate limits every route and ignores spoofed forwarded headers', async () => {
    let time = 1000;
    const app = createApp({ repository: repository(), rateLimit: 2, now: () => time });
    expect((await app.request('/health')).status).toBe(200);
    expect((await app.request('/api/feed')).status).toBe(200);
    const denied = await app.request('/api/me', { headers: { 'X-Forwarded-For': 'fake' } });
    expect(denied.status).toBe(429);
    expect(denied.headers.get('Retry-After')).toBe('60');
    time += 60_001;
    expect((await app.request('/health')).status).toBe(200);
  });

  it('uses a server supplied client key to isolate limits', async () => {
    const app = createApp({ repository: repository(), rateLimit: 1,
      rateKey: (context) => context.req.header('Test-Client') ?? 'anonymous' });
    expect((await app.request('/health', { headers: { 'Test-Client': 'a' } })).status).toBe(200);
    expect((await app.request('/health', { headers: { 'Test-Client': 'b' } })).status).toBe(200);
    expect((await app.request('/health', { headers: { 'Test-Client': 'a' } })).status).toBe(429);
  });
});
