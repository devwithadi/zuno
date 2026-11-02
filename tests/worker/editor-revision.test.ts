import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { evidence, env, response, review, story } from '../support/editorial.js';
import { hasBriefDepth } from '../../services/worker/depth.js';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@langchain/openai', () => ({ ChatOpenAI: class { invoke = invoke; } }));
import { createEditor } from '../../services/worker/langchain-editor.js';
const thin = { ...story, bullets: [{ text: 'The tool checks app errors.', sourceIds: ['source'] }] };
beforeEach(() => { invoke.mockReset(); });
afterEach(() => { vi.useRealTimers(); });
it('revises a thin draft once using measured feedback before evidence verification', async () => {
  invoke.mockResolvedValueOnce(response(thin)).mockResolvedValueOnce(response(thin))
    .mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(review));
  const editor = await createEditor(env);
  const result = await editor!(evidence);
  expect(hasBriefDepth(result.story as typeof story)).toBe(true);
  expect(invoke).toHaveBeenCalledTimes(4);
  const repair = JSON.parse(invoke.mock.calls[2][0][1].content);
  expect(repair.draftMetrics.totalWords).toBe(5);
  expect(repair.qualityIssues.length).toBeGreaterThan(0);
});
it('withholds a draft that remains thin rather than repeating revisions', async () => {
  invoke.mockResolvedValue(response(thin));
  const editor = await createEditor(env);
  await expect(editor!(evidence)).rejects.toThrow('context');
  expect(invoke).toHaveBeenCalledTimes(3);
});
it('revises rejected claims but never shops for approval of an unchanged draft', async () => {
  invoke.mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(story))
    .mockResolvedValueOnce(response({ ...review, approved: false }))
    .mockResolvedValueOnce(response(story));
  const editor = await createEditor(env);
  await expect(editor!(evidence)).rejects.toThrow('unchanged');
  expect(invoke).toHaveBeenCalledTimes(4);
});
it('caps the complete card workflow at ninety seconds even when a repair is needed', async () => {
  vi.useFakeTimers();
  let count = 0;
  invoke.mockImplementation(async () => {
    count += 1;
    vi.setSystemTime(Date.now() + 31_000);
    return response(count === 3 ? story : thin);
  });
  const editor = await createEditor(env);
  await expect(editor!(evidence)).rejects.toThrow('time budget');
  expect(invoke).toHaveBeenCalledTimes(3);
});

it('checks a changed correction again before publishing rejected claims', async () => {
  const corrected = { ...story, title: 'Review grouped app errors while keeping private logs local' };
  invoke.mockResolvedValueOnce(response(story)).mockResolvedValueOnce(response(story))
    .mockResolvedValueOnce(response({ ...review, approved: false }))
    .mockResolvedValueOnce(response(corrected)).mockResolvedValueOnce(response(review));
  const editor = await createEditor(env);
  expect((await editor!(evidence)).story).toMatchObject({ title: corrected.title });
  expect(invoke).toHaveBeenCalledTimes(5);
});
