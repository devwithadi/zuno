import { expect, it, vi } from 'vitest';
vi.mock('node:timers/promises', () => ({
  setTimeout: (delay: number, _value: unknown, options: { signal?: AbortSignal }) =>
    options.signal?.aborted ? Promise.reject(Error('aborted')) :
      new Promise((resolve) => setTimeout(resolve, delay)),
}));
import { runScheduled } from '../../services/worker/scheduler.js';

it('runs once without scheduling a second collection', async () => {
  const run = vi.fn().mockResolvedValue(undefined);
  await runScheduled(run, { once: true });
  expect(run).toHaveBeenCalledTimes(1);
});

it('waits only the remaining start-to-start interval without overlapping runs', async () => {
  vi.useFakeTimers();
  try {
    const controller = new AbortController();
    const run = vi.fn(async () => {
      if (run.mock.calls.length === 1) vi.setSystemTime(Date.now() + 200);
      else controller.abort();
    });
    const pending = runScheduled(run, { signal: controller.signal, interval: 1000 });
    await vi.advanceTimersByTimeAsync(799);
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(run).toHaveBeenCalledTimes(2);
    await pending;
  } finally { vi.useRealTimers(); }
});
