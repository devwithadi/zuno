import type { MiddlewareHandler } from 'hono';
import type { AppOptions } from './types.js';

export function rateLimit(options: AppOptions): MiddlewareHandler {
  // shortcut: single-process limits; use a shared limiter before adding API replicas.
  const buckets = new Map<string, { count: number; expires: number }>();
  const limit = options.rateLimit ?? 120;
  return async (context, next) => {
    const now = (options.now ?? Date.now)();
    const key = options.rateKey?.(context) ?? 'local';
    const previous = buckets.get(key);
    if (buckets.size >= 10_000) {
      for (const [id, bucket] of buckets) if (bucket.expires <= now) buckets.delete(id);
    }
    const bucket = !previous || previous.expires <= now
      ? { count: 1, expires: now + 60_000 }
      : { count: previous.count + 1, expires: previous.expires };
    if (bucket.count > limit || (!previous && buckets.size >= 10_000)) {
      context.header('Retry-After', String(Math.max(1, Math.ceil((bucket.expires - now) / 1000))));
      return context.json({ success: false, error: 'Too many requests' }, 429);
    }
    buckets.set(key, bucket);
    await next();
  };
}
