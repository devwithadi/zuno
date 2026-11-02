import { setTimeout } from 'node:timers/promises';

export async function withThrottleRetry<T>(call: () => Promise<T>, deadline: number): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try { return await call(); }
    catch (error) {
      const status = error && typeof error === 'object'
        ? (error as { $metadata?: { httpStatusCode?: number }; status?: number }) : undefined;
      const throttled = status?.$metadata?.httpStatusCode === 429 || status?.status === 429;
      const delay = 10_000 * (attempt + 1);
      if (!throttled || attempt >= 2 || Date.now() + delay + 1000 >= deadline) throw error;
      await setTimeout(delay);
    }
  }
}

export function createModelGate(spacing: number) {
  let next = 0;
  return async (deadline: number) => {
    const slot = Math.max(Date.now(), next);
    if (slot >= deadline) throw Error('Editorial time budget exhausted');
    next = slot + spacing;
    if (slot > Date.now()) await setTimeout(slot - Date.now());
  };
}
