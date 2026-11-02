import type { Evidence, Source, StoryRepository } from '@zuno/shared';
import { richerStory } from './refresh.js';
import { sources as defaults } from './sources.js';
import { collectSources } from './collect-sources.js';
import { groupEvidence } from './normalize.js';
import { extractStory, verifyStory, type Editor } from './editor.js';
import { createJobs, type Jobs } from './jobs.js';
import { createInbox, type Inbox } from './inbox.js';
import type { FetchText } from './fetch.js';
import { hasBriefDepth } from './depth.js';
import { workerPolicy } from './policy.js';

type Options = { repository: StoryRepository; sources?: Source[];
  fetchText?: FetchText; editor?: Editor; jobs?: Jobs; inbox?: Inbox; publicationLimit?: number };
export async function runPipeline(options: Options) {
  const requested = options.publicationLimit ?? (options.editor
    ? workerPolicy.editedPublicationLimit : workerPolicy.extractivePublicationLimit);
  if (!Number.isFinite(requested)) throw Error('Publication limit must be finite');
  const limit = Math.max(1, Math.min(workerPolicy.maximumPublicationLimit, Math.trunc(requested)));
  const jobs = options.jobs ?? await createJobs();
  const inbox = options.inbox ?? await createInbox();
  const results = await collectSources(options.sources ?? defaults, jobs, options.fetchText);
  await inbox.add(interleave(results.map((result) => result.evidence)));
  const failedSources = new Set(results.filter((result) => result.failed)
    .map((result) => result.source));
  let attempted = 0;
  let published = 0;
  let refreshed = 0;
  let held = 0;
  let failed = results.filter((result) => result.failed).length;
  let scanned = 0;
  let seen: string[] = [];
  while (scanned < workerPolicy.maximumScannedEntries && attempted < limit) {
    const entries = await inbox.take(Math.min(workerPolicy.editorialConcurrency,
      workerPolicy.maximumScannedEntries - scanned), seen);
    if (!entries.length) break;
    scanned += entries.length;
    seen = [...seen, ...entries.map((entry) => entry.key)];
    await Promise.all(groupEvidence(entries.map((entry) => entry.evidence)).map(async (group) => {
      const batch = entries.filter((entry) => group.some((item) => item.id === entry.evidence.id));
      try {
        const fallback = extractStory(group);
        const existing = await options.repository.find(fallback.id);
        if (existing && hasBriefDepth(existing) && (!options.editor || existing.mode !== 'extractive') &&
            !richerStory(existing, fallback)) {
          await Promise.all(batch.map((entry) => inbox.finish(entry)));
          return;
        }
        if (attempted >= limit) {
          await Promise.all(batch.map((entry) => inbox.finish(entry, 'pending')));
          return;
        }
        attempted += 1;
        const result = options.editor ? await options.editor(group) : undefined;
        const story = verifyStory(options.editor ? result?.story : fallback, group, result?.review);
        if (story.id !== fallback.id) throw Error('Editorial output changed identity');
        if (!hasBriefDepth(story)) {
          held += 1;
          await Promise.all(batch.map((entry) => inbox.finish(entry)));
          return;
        }
        if (existing) {
          const enriched = richerStory(existing, story);
          if (enriched && await options.repository.refresh(enriched)) refreshed += 1;
        } else if (await options.repository.save(story)) published += 1;
        await Promise.all(batch.map((entry) => inbox.finish(entry)));
      } catch {
        failed += 1;
        await Promise.all(batch.map((entry) => inbox.finish(entry, 'retry')));
        for (const item of group) {
          failedSources.add(item.sourceId);
        }
      }
    }));
  }
  return { published, refreshed, held, failed, failedSourceIds: [...failedSources], collected: results.reduce((sum, result) => sum + result.evidence.length, 0) };
}


function interleave(groups: Evidence[][]): Evidence[] {
  const longest = Math.max(0, ...groups.map((group) => group.length));
  return Array.from({ length: longest }, (_, index) =>
    groups.flatMap((group) => group[index] ? [group[index]] : [])).flat();
}
