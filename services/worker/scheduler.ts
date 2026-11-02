import { setTimeout } from 'node:timers/promises';

type Options = { once?: boolean; signal?: AbortSignal; interval?: number };
export async function runScheduled(run: () => Promise<unknown>, options: Options = {}) {
  do {
    if (options.signal?.aborted) return;
    const started = Date.now();
    await run();
    if (options.once) return;
    const remaining = Math.max(0, (options.interval ?? 300_000) - (Date.now() - started));
    try { await setTimeout(remaining, undefined, { signal: options.signal }); }
    catch (error) {
      if (options.signal?.aborted) return;
      throw error;
    }
  } while (!options.signal?.aborted);
}
