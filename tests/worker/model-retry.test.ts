import { afterEach, expect, it, vi } from 'vitest';
import { createModelGate, withThrottleRetry } from '../../services/worker/model-retry.js';
afterEach(() => vi.useRealTimers());
it('spaces shared model starts and refuses slots after the card deadline', async () => {
  vi.useFakeTimers();
  const gate = createModelGate(3000);
  const deadline = Date.now() + 5000;
  await gate(deadline);
  const second = gate(deadline);
  await vi.advanceTimersByTimeAsync(3000);
  await second;
  await expect(gate(deadline)).rejects.toThrow('time budget');
});
it('backs off bounded provider throttling and retries once capacity returns', async () => {
  vi.useFakeTimers();
  const call = vi.fn().mockRejectedValueOnce({ $metadata: { httpStatusCode: 429 } }).mockResolvedValue('ok');
  const result = withThrottleRetry(call, Date.now() + 90_000);
  await vi.advanceTimersByTimeAsync(10_000);
  await expect(result).resolves.toBe('ok');
  expect(call).toHaveBeenCalledTimes(2);
});
it('does not retry permanent failures or exceed the card deadline', async () => {
  const call = vi.fn().mockRejectedValue({ status: 429 });
  await expect(withThrottleRetry(call, Date.now() + 5000)).rejects.toEqual({ status: 429 });
  expect(call).toHaveBeenCalledTimes(1);
  const denied = vi.fn().mockRejectedValue(new Error('Denied'));
  await expect(withThrottleRetry(denied, Date.now() + 90_000)).rejects.toThrow('Denied');
  expect(denied).toHaveBeenCalledTimes(1);
});
