import { describe, expect, it } from 'vitest';
import { readApiConfig } from '../../services/api/config.js';

describe('API startup configuration', () => {
  it('has explicit local defaults for guest development', () => {
    expect(readApiConfig({})).toEqual({
      port: 3001, origins: ['http://localhost:8081'], secretKey: undefined,
      authorizedParties: [], demo: false,
    });
  });

  it('parses configured origins and authentication', () => {
    expect(readApiConfig({
      PORT: '4000', CORS_ORIGINS: 'https://zuno.example, https://app.zuno.example',
      CLERK_SECRET_KEY: 'test-key', CLERK_AUTHORIZED_PARTIES: 'https://zuno.example',
      DEMO_MODE: 'true',
    })).toMatchObject({ port: 4000, demo: true, authorizedParties: ['https://zuno.example'] });
  });

  it.each([
    { PORT: 'NaN' }, { PORT: '0' }, { CORS_ORIGINS: '*' },
    { CORS_ORIGINS: 'https://zuno.example/path' },
    { CLERK_SECRET_KEY: 'test-key' }, { NODE_ENV: 'production' },
  ])('rejects unsafe startup config %j', (environment) => {
    expect(() => readApiConfig(environment)).toThrow();
  });

  it('accepts complete production configuration', () => {
    expect(readApiConfig({ NODE_ENV: 'production', CLERK_SECRET_KEY: 'test-key',
      CLERK_AUTHORIZED_PARTIES: 'https://zuno.example',
      CORS_ORIGINS: 'https://zuno.example',
    }).port).toBe(3001);
  });
});
