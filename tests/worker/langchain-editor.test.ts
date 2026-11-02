import { beforeEach, expect, it, vi } from 'vitest';
import { extractStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const { invoke, configured } = vi.hoisted(() => ({ invoke: vi.fn(), configured: vi.fn() }));
vi.mock('@langchain/openai', () => ({ ChatOpenAI: class {
  constructor(options: unknown) { configured(options); }
  invoke = invoke;
} }));
import { createEditor } from '../../services/worker/langchain-editor.js';
import { evidence, env, response, review, story, support } from '../support/editorial.js';
beforeEach(() => { invoke.mockReset(); configured.mockClear(); });
it('uses three bounded LangChain calls and publishes a reviewed hook with immutable metadata', async () => {
  invoke.mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(story))
    .mockResolvedValueOnce(response(review));
  const editor = await createEditor(env);
  const result = await editor!(evidence);
  expect(result.story).toMatchObject({ title: story.title, bullets: story.bullets, mode: 'langchain',
    id: extractStory(evidence).id, sources: extractStory(evidence).sources });
  const measured = JSON.parse(invoke.mock.calls[1][0][1].content);
  expect(measured.draftMetrics).toEqual({ totalWords: 197, bulletWords: [38, 38, 39, 42, 40] });
  const verification = JSON.parse(invoke.mock.calls[2][0][1].content);
  expect(verification.quotedEvidence.slice(1).map((quote: { text: string }) => quote.text).join(''))
    .toBe(evidence[0].text);
  expect(verification.evidence[0]).not.toHaveProperty('text');
  expect(invoke).toHaveBeenCalledTimes(3);
  expect(configured).toHaveBeenCalledWith(expect.objectContaining({ maxRetries: 0, timeout: 20_000 }));
  for (const [messages, options] of invoke.mock.calls) {
    expect(messages).toEqual([expect.objectContaining({ role: 'system' }),
      expect.objectContaining({ role: 'user' })]);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  }
});
it('stops immediately for invalid JSON, oversized, nontext and schema-invalid output', async () => {
  const editor = await createEditor(env);
  for (const content of ['not JSON', 'x'.repeat(20_001), [], '{"rejected":true}']) {
    invoke.mockReset().mockResolvedValue({ content });
    await expect(editor!(evidence)).rejects.toThrow();
    expect(invoke).toHaveBeenCalledTimes(1);
  }
});
it('propagates model failure and refuses unsupported headlines without a fallback publication', async () => {
  const editor = await createEditor(env);
  invoke.mockRejectedValueOnce(Error('model unavailable'));
  await expect(editor!(evidence)).rejects.toThrow('model unavailable');
  invoke.mockReset().mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(story))
    .mockResolvedValueOnce(response({ ...review, headline: { ...support, supported: false } }));
  await expect(editor!(evidence)).rejects.toThrow();
});
it('accepts text-only content blocks from Converse models and rejects tool content', async () => {
  const editor = await createEditor(env);
  invoke.mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(story) }] })
    .mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(review));
  expect((await editor!(evidence)).story).toMatchObject({ title: story.title });
  invoke.mockReset().mockResolvedValue({ content: [{ type: 'tool_use', text: '{}' }] });
  await expect(editor!(evidence)).rejects.toThrow();
});
it('rejects obsolete or unknown editor configuration rather than silently extracting', async () => {
  await expect(createEditor({ EDITOR_MODE: 'deepagents' })).rejects.toThrow('langchain');
  await expect(createEditor({ EDITOR_MODE: 'typo' })).rejects.toThrow();
});
it('accepts a single JSON code fence while still rejecting surrounding prose', async () => {
  const editor = await createEditor(env);
  const fenced = (value: unknown) => ({ content: ['```json', JSON.stringify(value), '```'].join('\n') });
  invoke.mockResolvedValueOnce(fenced(story)).mockResolvedValueOnce(fenced(story))
    .mockResolvedValueOnce(fenced(review));
  expect((await editor!(evidence)).story).toMatchObject({ title: story.title });
  invoke.mockReset().mockResolvedValue({ content: 'Here is your card:\n' + fenced(story).content });
  await expect(editor!(evidence)).rejects.toThrow();
});
it('accepts only editable fields and computes metadata the model must not supply', async () => {
  const editor = await createEditor(env);
  const draft = { title: story.title, bullets: story.bullets };
  invoke.mockResolvedValueOnce(response(draft)).mockResolvedValueOnce(response(draft))
    .mockResolvedValueOnce(response(review));
  expect((await editor!(evidence)).story).toMatchObject({ title: story.title,
    id: extractStory(evidence).id, sources: extractStory(evidence).sources,
    readingSeconds: Math.ceil(story.bullets.map((point) => point.text).join(' ').length / 15) });
});
