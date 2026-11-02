import type { Evidence, Source } from '@zuno/shared';
import type { FetchText } from './fetch.js';
import type { Jobs } from './jobs.js';
import { collect } from './sources.js';
import { workerPolicy } from './policy.js';

export type CollectionResult = { source: string; evidence: Evidence[];
  token?: string; skipped?: boolean; failed?: boolean };
const { sourceConcurrency } = workerPolicy;

export async function collectSources(sources: Source[], jobs: Jobs,
  get?: FetchText): Promise<CollectionResult[]> {
  const enabled = sources.filter((source) => source.enabled);
  const byId = new Map(enabled.map((source) => [source.id, source]));
  const ids = enabled.map((source) => source.id);
  const ordered = jobs.order ? await jobs.order(ids) : ids;
  let results: CollectionResult[] = [];
  for (let start = 0; start < ordered.length; start += sourceConcurrency) {
    const batch = await Promise.all(ordered.slice(start, start + sourceConcurrency)
      .map(async (id): Promise<CollectionResult> => {
        const source = byId.get(id);
        if (!source) return { source: id, evidence: [], skipped: true };
        const token = await jobs.claim(id);
        if (!token) return { source: id, evidence: [], skipped: true };
        try {
          const evidence = await collect(source, get);
          await jobs.finish(id, token);
          return { source: id, evidence, token };
        }
        catch {
          await jobs.finish(id, token, 'Source collection failed');
          return { source: id, evidence: [], failed: true };
        }
      }));
    results = [...results, ...batch];
  }
  return results;
}
