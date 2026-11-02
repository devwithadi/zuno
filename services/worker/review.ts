import { z } from 'zod';
import type { Evidence, Story } from '@zuno/shared';

const claimSchema = z.object({ supported: z.boolean(),
  quotes: z.array(z.object({ sourceId: z.string().min(1),
    text: z.string().min(8).max(2000) }).strict()).min(1).max(10),
}).strict();
export const reviewSchema = z.object({ approved: z.boolean(),
  headline: claimSchema.optional(),
  claims: z.array(claimSchema.extend({
    bulletIndex: z.number().int().min(0).max(4),
  }).strict()).min(1).max(5),
}).strict();
export type Review = z.infer<typeof reviewSchema>;
function factTokens(text: string): string[] {
  const matches = text.matchAll(/(?<![\d%])[-+]?\d+(?:[.,]\d+)*(?:%|\b)|\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi);
  return [...matches].filter((match) => {
    if (match[0] !== 'may') return true;
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);
    return /^\s+\d/.test(after) || /\d\s+$/.test(before) ||
      /\b(?:in|by|until|during|before|after|since)\s+$/i.test(before);
  }).map((match) => match[0].toLowerCase());
}

export function verifyReview(story: Story, evidence: Evidence[], candidate: unknown): Review {
  const review = reviewSchema.parse(candidate);
  if (!review.approved || review.claims.length !== story.bullets.length) {
    throw Error('Incomplete or refused evidence review');
  }
  const indices = new Set(review.claims.map((claim) => claim.bulletIndex));
  if (indices.size !== story.bullets.length) throw Error('Duplicate reviewed claim');
  if (story.title !== evidence[0]?.title && !review.headline) {
    throw Error('Missing headline evidence review');
  }
  if (review.headline) verifyClaim(story.title, story.sources.map((source) => source.id),
    evidence, review.headline);
  for (const [index, bullet] of story.bullets.entries()) {
    const claim = review.claims.find((item) => item.bulletIndex === index);
    if (!claim) throw Error('Missing claim');
    verifyClaim(bullet.text, bullet.sourceIds, evidence, claim);
    if (bullet.sourceIds.some((id) => !claim.quotes.some((quote) => quote.sourceId === id))) {
      throw Error('Every citation needs supporting evidence');
    }
  }
  return review;
}

function verifyClaim(text: string, sourceIds: string[], evidence: Evidence[],
  claim: z.infer<typeof claimSchema>): void {
  if (!claim.supported) throw Error('Unsupported claim');
  for (const quote of claim.quotes) {
    const source = evidence.find((item) => item.id === quote.sourceId);
    if (!source || !sourceIds.includes(quote.sourceId) ||
        ![source.text, source.title].some((content) => content.includes(quote.text))) {
      throw Error('Invalid supporting quote');
    }
  }
  const supported = new Set(factTokens(claim.quotes.map((quote) => quote.text).join(' ')));
  if (factTokens(text).some((token) => !supported.has(token))) throw Error('Number or date changed');
}
