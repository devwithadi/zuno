import { z } from 'zod';
import type { Evidence } from '@zuno/shared';
import { reviewSchema, type Review } from './review.js';

export type QuoteEntry = { id: string; sourceId: string; text: string };
const referenceClaim = z.object({ supported: z.boolean(),
  quoteIds: z.array(z.string().min(1)).min(1).max(10)
    .refine((ids) => new Set(ids).size === ids.length, 'Duplicate quote reference'),
}).strict();
const referenceReview = z.object({ approved: z.boolean(),
  headline: referenceClaim.optional(),
  claims: z.array(referenceClaim.extend({
    bulletIndex: z.number().int().min(0).max(4),
  }).strict()).min(1).max(5),
}).strict();

export function buildQuoteBank(evidence: Evidence[]): QuoteEntry[] {
  const entries = evidence.flatMap((source) => [source.title, source.text].flatMap((text) => {
    if (text.length < 8) return [];
    const count = Math.ceil(text.length / 1200);
    return Array.from({ length: count }, (_, index) => ({ sourceId: source.id,
      text: text.slice(Math.floor(index * text.length / count),
        Math.floor((index + 1) * text.length / count)) }));
  }));
  return entries.map((entry, index) => ({ id: `q${index}`, ...entry }));
}

export function resolveQuoteReview(candidate: unknown, bank: QuoteEntry[]): Review {
  const legacy = reviewSchema.safeParse(candidate);
  if (legacy.success) return legacy.data;
  const draft = referenceReview.parse(candidate);
  const allowed = new Map(bank.map((entry) => [entry.id, entry]));
  if (allowed.size !== bank.length) throw Error('Duplicate quote bank identity');
  const claim = (value: z.infer<typeof referenceClaim>) => ({ supported: value.supported,
    quotes: value.quoteIds.map((id) => {
      const entry = allowed.get(id);
      if (!entry) throw Error('Unknown quote reference');
      return { sourceId: entry.sourceId, text: entry.text };
    }),
  });
  return reviewSchema.parse({ approved: draft.approved,
    ...(draft.headline ? { headline: claim(draft.headline) } : {}),
    claims: draft.claims.map((value) => ({ bulletIndex: value.bulletIndex, ...claim(value) })),
  });
}
