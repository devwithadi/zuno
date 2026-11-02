import type { Context } from 'hono';
import type { TokenVerifier } from './types.js';

export async function currentUser(context: Context, verify?: TokenVerifier) {
  const authorization = context.req.header('Authorization');
  const token = authorization?.match(/^Bearer ([^\s]{1,8192})$/i)?.[1];
  if (!token || !verify) return context.json({ success: false, error: 'Sign in required' }, 401);
  try {
    const identity = await verify(token);
    if (!identity.sub) throw new Error('Missing identity');
    return context.json({ success: true, data: { id: identity.sub } });
  } catch {
    return context.json({ success: false, error: 'Invalid session' }, 401);
  }
}
