import { storySchema, type Evidence, type Story } from '@zuno/shared';
import { verifyReview, type Review } from './review.js';
import { contentPointers } from './pointers.js';
import { hasRepeatedHeadlineKeyword } from './headline.js';
import { fingerprint } from './normalize.js';

export type EditorResult = { story: unknown; review: Review };
export type Editor = (evidence: Evidence[]) => Promise<EditorResult>;
export function extractStory(evidence: Evidence[]): Story {
  const first = evidence[0];
  if (!first) throw Error('Evidence is required');
  const bullets = evidence.flatMap((item) => contentPointers(item.text || item.title)
    .map((text) => ({ text, sourceIds: [item.id] }))).slice(0, 5);
  return storySchema.parse({
    id: fingerprint(first.url), title: first.title.slice(0, 160), topic: first.topic,
    bullets, sources: evidence.map((item) => ({ id: item.id, name: item.sourceName, url: item.url })),
    image: evidence.find((item) => item.image)?.image ?? { alt: `Topic illustration: ${first.topic}` },
    publishedAt: first.publishedAt, updatedAt: new Date().toISOString(),
    readingSeconds: Math.min(300, Math.max(1, Math.ceil(bullets.map((bullet) => bullet.text).join(' ').length / 15))),
    mode: 'extractive',
  });
}
export function verifyStory(candidate: unknown, evidence: Evidence[], review?: unknown): Story {
  const story = storySchema.parse(candidate);
  if (story.publishedAt !== evidence[0]?.publishedAt || story.topic !== evidence[0]?.topic) {
    throw Error('Editorial output changed source metadata');
  }
  if (story.id !== fingerprint(evidence[0]?.url ?? '')) throw Error('Editorial output changed identity');
  if (story.mode === 'extractive' && story.title !== evidence[0]?.title) {
    throw Error('Title must match evidence');
  }
  for (const source of story.sources) {
    const original = evidence.find((item) => item.id === source.id);
    if (!original || original.url !== source.url || original.sourceName !== source.name) {
      throw Error('Citation is not supplied evidence');
    }
  }
  if (story.mode !== 'extractive') {
    if (!review) throw Error('Missing evidence review');
    verifyReview(story, evidence, review);
    if (hasRepeatedHeadlineKeyword(story.title)) throw Error('Headline repeats a keyword');
  }
  for (const bullet of story.bullets) {
    if (story.mode === 'extractive' && !bullet.sourceIds.some((id) => {
      const item = evidence.find((entry) => entry.id === id);
      return item && (item.text || item.title).includes(bullet.text);
    })) throw Error('Published bullet changed evidence');
  }
  if (story.image.url && !evidence.some((item) => item.image &&
      item.image.url === story.image.url && item.image.alt === story.image.alt &&
      item.image.credit === story.image.credit)) throw Error('Image must match supplied evidence');
  return story;
}
