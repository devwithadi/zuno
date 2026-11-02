import { beforeEach, expect, it, vi } from 'vitest';
import { createMemoryRepository } from '@zuno/storage';
import { createEditor } from '../../services/worker/langchain-editor.js';
import { createInbox } from '../../services/worker/inbox.js';
import { extractStory } from '../../services/worker/editor.js';
import { runPipeline } from '../../services/worker/pipeline.js';
import type { Evidence } from '@zuno/shared';
import { points } from '../support/editorial.js';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@langchain/openai', () => ({ ChatOpenAI: class { invoke = invoke; } }));
vi.mock('@langchain/aws', () => ({ ChatBedrockConverse: class { invoke = invoke; } }));
const evidence: Evidence = { id: 'source', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/tool', title: 'A useful application diagnostic utility',
  text: points.join(' '), topic: 'technology', publishedAt: '2026-10-24T10:00:00.000Z' };
const original = extractStory([evidence]);
const candidate = { ...original, title: 'Find app errors while keeping your logs local', mode: 'langchain',
  bullets: points.map((text) => ({ text, sourceIds: ['source'] })) };
const support = { supported: true, quotes: [{ sourceId: 'source', text: evidence.text }] };
const review = { approved: true, headline: support,
  claims: candidate.bullets.map((_, bulletIndex) => ({ ...support, bulletIndex })) };
const response = (value: unknown) => ({ content: JSON.stringify(value) });
beforeEach(() => { invoke.mockReset(); });

it.each(['local', 'bedrock'])('upgrades an excerpt through %s and serves the reviewed hook', async (provider) => {
  const repository = createMemoryRepository();
  await repository.save(original);
  const inbox = await createInbox();
  await inbox.add([evidence]);
  invoke.mockResolvedValueOnce(response(candidate)).mockResolvedValueOnce(response(candidate))
    .mockResolvedValueOnce(response(review));
  const editor = await createEditor({ EDITOR_MODE: 'langchain', EDITOR_PROVIDER: provider,
    BEDROCK_REGION: 'us-east-1', BEDROCK_MODEL_ID: 'us.amazon.nova-2-lite-v1:0',
    AWS_BEARER_TOKEN_BEDROCK: 'test-token', LOCAL_MODEL_NAME: 'local',
    LOCAL_MODEL_URL: 'http://127.0.0.1:11434/v1' });
  expect(await runPipeline({ repository, inbox, sources: [], editor }))
    .toMatchObject({ published: 0, refreshed: 1, failed: 0 });
  const { items } = await repository.list({ limit: 10 });
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ title: candidate.title, mode: 'langchain',
    id: original.id, sources: original.sources, publishedAt: original.publishedAt });
});

it('keeps a refused headline out of the feed and retains its evidence for retry', async () => {
  const repository = createMemoryRepository();
  const inbox = await createInbox();
  await inbox.add([evidence]);
  invoke.mockResolvedValueOnce(response(candidate)).mockResolvedValueOnce(response(candidate))
    .mockResolvedValueOnce(response({ ...review, approved: false }));
  const editor = await createEditor({ EDITOR_MODE: 'langchain', LOCAL_MODEL_NAME: 'local',
    LOCAL_MODEL_URL: 'http://127.0.0.1:11434/v1' });
  expect(await runPipeline({ repository, inbox, sources: [], editor }))
    .toMatchObject({ published: 0, failed: 1 });
  expect((await repository.list({ limit: 10 })).items).toEqual([]);
  vi.useFakeTimers();
  try {
    vi.setSystemTime(Date.now() + 60_001);
    expect((await inbox.take(1))[0].evidence).toEqual(evidence);
  } finally { vi.useRealTimers(); }
});
