import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { currentUser } from './auth.js';
import { feedQuerySchema, storyIdSchema } from './queries.js';
import { rateLimit } from './rate-limit.js';
import type { AppOptions } from './types.js';

export function createApp(options: AppOptions) {
  const app = new Hono();
  app.use('*', secureHeaders());
  app.use('*', rateLimit(options));
  app.use('*', cors({
    origin: (origin) => options.origins?.includes(origin) ? origin : undefined,
    allowMethods: ['GET', 'OPTIONS'], allowHeaders: ['Authorization', 'Content-Type'],
  }));
  app.use('*', async (context, next) => {
    context.header('Cache-Control', 'no-store');
    await next();
  });
  app.get('/health', (context) => context.json({
    success: true, data: { status: 'ok', demo: options.demo ?? false },
  }));
  app.get('/api/feed', async (context) => {
    const result = feedQuerySchema.safeParse(context.req.query());
    if (!result.success) return context.json({ success: false, error: 'Invalid feed query' }, 400);
    const page = await options.repository.list(result.data);
    return context.json({ success: true, data: page });
  });
  app.get('/api/stories/:id', async (context) => {
    const result = storyIdSchema.safeParse(context.req.param('id'));
    if (!result.success) return context.json({ success: false, error: 'Invalid story id' }, 400);
    const story = await options.repository.find(result.data);
    return story ? context.json({ success: true, data: story })
      : context.json({ success: false, error: 'Story not found' }, 404);
  });
  app.get('/api/me', (context) => currentUser(context, options.verifyToken));
  app.notFound((context) => context.json({ success: false, error: 'Not found' }, 404));
  app.onError((error, context) => {
    options.onError?.(error);
    return context.json({ success: false, error: 'Service temporarily unavailable' }, 500);
  });
  return app;
}
