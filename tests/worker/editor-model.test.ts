import { beforeEach, expect, it, vi } from 'vitest';

const { local, bedrock } = vi.hoisted(() => ({ local: vi.fn(), bedrock: vi.fn() }));
vi.mock('@langchain/openai', () => ({ ChatOpenAI: class {
  constructor(options: unknown) { local(options); }
} }));
vi.mock('@langchain/aws', () => ({ ChatBedrockConverse: class {
  constructor(options: unknown) { bedrock(options); }
} }));
import { createEditorialModel } from '../../services/worker/editor-model.js';
beforeEach(() => { local.mockClear(); bedrock.mockClear(); });
const env = { EDITOR_PROVIDER: 'bedrock', BEDROCK_REGION: 'us-east-1',
  BEDROCK_MODEL_ID: 'us.amazon.nova-2-lite-v1:0', AWS_BEARER_TOKEN_BEDROCK: 'test-token' };
it('uses native Bedrock Converse with explicit bearer credentials and bounded retries', () => {
  createEditorialModel(env);
  expect(bedrock).toHaveBeenCalledWith(expect.objectContaining({
    model: env.BEDROCK_MODEL_ID, region: 'us-east-1', maxRetries: 0,
    bedrockBearerToken: 'test-token', endpointHost: 'bedrock-runtime.us-east-1.amazonaws.com',
    clientOptions: expect.objectContaining({ maxAttempts: 1 }),
  }));
  expect(local).not.toHaveBeenCalled();
});
it('rejects missing credentials or invalid region/model/provider before a network call', () => {
  for (const options of [{ ...env, AWS_BEARER_TOKEN_BEDROCK: '' },
    { ...env, BEDROCK_REGION: 'https://other.example' },
    { ...env, BEDROCK_MODEL_ID: '' }, { ...env, EDITOR_PROVIDER: 'unknown' }]) {
    expect(() => createEditorialModel(options)).toThrow();
  }
  expect(bedrock).not.toHaveBeenCalled();
});
it('supports the Kairo key alias without mutating process environment', () => {
  const before = process.env.AWS_BEARER_TOKEN_BEDROCK;
  createEditorialModel({ ...env, AWS_BEARER_TOKEN_BEDROCK: '', BEDROCK_API_KEY: 'alias-test-token' });
  expect(bedrock).toHaveBeenCalledWith(expect.objectContaining({ bedrockBearerToken: 'alias-test-token' }));
  expect(process.env.AWS_BEARER_TOKEN_BEDROCK).toBe(before);
});
it('retains localhost-only OpenAI-compatible inference', () => {
  createEditorialModel({ LOCAL_MODEL_NAME: 'local', LOCAL_MODEL_URL: 'http://localhost:11434/v1' });
  expect(local).toHaveBeenCalledTimes(1);
  expect(() => createEditorialModel({ LOCAL_MODEL_NAME: 'local',
    LOCAL_MODEL_URL: 'https://other.example/v1' })).toThrow('localhost');
});
