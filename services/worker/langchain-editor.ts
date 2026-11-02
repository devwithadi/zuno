import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { createEditorialModel } from './editor-model.js';
import { storySchema, type Story, type Evidence } from '@zuno/shared';
import { buildQuoteBank, resolveQuoteReview } from './review-quotes.js';
import { extractStory, verifyStory, type Editor } from './editor.js';
import { hasBriefDepth } from './depth.js';
import { hasRepeatedHeadlineKeyword } from './headline.js';
import { createModelGate, withThrottleRetry } from './model-retry.js';

const draftSchema = z.object({ title: storySchema.shape.title, bullets: storySchema.shape.bullets });
export async function createEditor(env: Record<string, string | undefined> = process.env): Promise<Editor | undefined> {
  if (!env.EDITOR_MODE || env.EDITOR_MODE === 'extractive') return undefined;
  if (env.EDITOR_MODE !== 'langchain') throw Error('Set EDITOR_MODE to langchain or extractive');
  const model = createEditorialModel(env);
  const waitForSlot = createModelGate(env.EDITOR_PROVIDER === 'bedrock' ? 3000 : 0);
  const prompts = await Promise.all(['writer', 'humanizer', 'verifier'].map((name) =>
    readFile(new URL(`../../prompts/${name}.md`, import.meta.url), 'utf8')));
  return async (evidence: Evidence[]) => {
    const deadline = Date.now() + 90_000;
    const quotedEvidence = buildQuoteBank(evidence);
    const metadata = evidence.map(({ text: _text, ...source }) => source);
    let candidate = { ...extractStory(evidence), mode: 'langchain' as const };
    let revised = false;
    candidate = await edit(prompts[0], candidate);
    candidate = await edit(prompts[1], candidate);
    if (qualityIssues(candidate).length) {
      candidate = await edit(prompts[1], candidate, { qualityIssues: qualityIssues(candidate) });
      revised = true;
    }
    requireQuality(candidate);
    let review = await check(candidate);
    if ((!review.approved || review.claims.some((claim) => !claim.supported) ||
        review.headline?.supported === false) && !revised) {
      const before = JSON.stringify({ title: candidate.title, bullets: candidate.bullets });
      candidate = await edit(prompts[1], candidate, { evidenceReview: review });
      if (before === JSON.stringify({ title: candidate.title, bullets: candidate.bullets })) {
        throw Error('Rejected draft is unchanged');
      }
      requireQuality(candidate);
      review = await check(candidate);
    }
    return { story: verifyStory(candidate, evidence, review), review };

    async function edit(prompt: string, current: typeof candidate, feedback = {}) {
      const edited = draftSchema.parse(await invoke(prompt,
        { evidence, candidate: current, draftMetrics: measureDraft(current), ...feedback }));
      const readingSeconds = Math.min(300, Math.max(1,
        Math.ceil(edited.bullets.map((point) => point.text).join(' ').length / 15)));
      return { ...storySchema.parse({ ...current, ...edited, readingSeconds }), mode: 'langchain' as const };
    }
    async function check(current: Story) {
      return resolveQuoteReview(await invoke(prompts[2],
        { evidence: metadata, candidate: current, quotedEvidence }), quotedEvidence);
    }
    async function invoke(prompt: string, input: unknown): Promise<unknown> {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw Error('Editorial time budget exhausted');
      const response = await withThrottleRetry(async () => {
        await waitForSlot(deadline);
        return model.invoke([
          { role: 'system', content: prompt }, { role: 'user', content: JSON.stringify(input) },
        ], { signal: AbortSignal.timeout(Math.min(30_000, Math.max(1, deadline - Date.now()))) });
      }, deadline);
      if (Date.now() > deadline) throw Error('Editorial time budget exhausted');
      const content = typeof response.content === 'string' ? response.content
        : response.content.every((block) => block.type === 'text' && typeof block.text === 'string')
          ? response.content.map((block) => block.text).join('') : '';
      if (!content || content.length > 20_000) throw Error('Invalid editorial response');
      const json = content.trim();
      return JSON.parse(json.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i)?.[1] ?? json);
    }
  };
}
function measureDraft(story: Story) {
  const bulletWords = story.bullets.map((point) => point.text.trim().split(/\s+/u).filter(Boolean).length);
  return { totalWords: bulletWords.reduce((total, count) => total + count, 0), bulletWords };
}
function qualityIssues(story: Story): string[] {
  const metrics = measureDraft(story);
  return [!hasBriefDepth(story) ? `insufficient-context: ${metrics.totalWords} words; ` +
    `bullet lengths ${metrics.bulletWords.join(',')}` : '',
    hasRepeatedHeadlineKeyword(story.title) ? 'repeated-headline-keyword' : ''].filter(Boolean);
}
function requireQuality(story: Story) {
  if (qualityIssues(story).length) throw Error('Editorial context or headline quality insufficient');
}
