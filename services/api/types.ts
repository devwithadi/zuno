import type { Context } from 'hono';
import type { StoryRepository } from '@zuno/shared';

export type TokenVerifier = (token: string) => Promise<{ sub: string }>;
export type AppOptions = {
  repository: StoryRepository;
  verifyToken?: TokenVerifier;
  origins?: string[];
  demo?: boolean;
  rateLimit?: number;
  rateKey?: (context: Context) => string;
  now?: () => number;
  onError?: (error: Error) => void;
};
