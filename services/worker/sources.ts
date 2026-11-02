import { z } from 'zod';
import type { Evidence, Source } from '@zuno/shared';
import { canonicalUrl, fingerprint, plainText } from './normalize.js';
import { safeFetch, type FetchText } from './fetch.js';
import { hackerNews, github, devArticles } from './source-adapters.js';
import { parseRss } from './rss.js';
import { contentText } from './content-text.js';
import { sourceImage } from './images.js';
import { enrichEvidence } from './enrich.js';
export { sources } from './registry.js';

const rawSchema = z.object({ title: z.string().min(8), url: z.string(),
  text: z.string().default(''), date: z.string(), image: z.unknown().optional() });
function normalize(raw: unknown, source: Source): Evidence | null {
  try {
    const data = rawSchema.parse(raw);
    const url = canonicalUrl(data.url);
    const date = new Date(data.date);
    if (+date > Date.now() + 300_000 || +date < Date.UTC(2000, 0, 1)) return null;
    const title = plainText(data.title).slice(0, 160);
    if (title.length < 8) return null;
    return { id: fingerprint(url), sourceId: source.id, sourceName: source.name,
      url, title, text: contentText(data.text), publishedAt: date.toISOString(), topic: source.topic,
      image: sourceImage(data.image, title, `${source.name} source image`) };
  } catch { return null; }
}
export async function collect(source: Source, get: FetchText = safeFetch): Promise<Evidence[]> {
  const body = await get(source.url);
  const raw = source.kind === 'hackernews' ? await hackerNews(body, get)
    : source.kind === 'github' ? github(body) : source.kind === 'dev' ? await devArticles(body, get) : parseRss(body);
  const items = raw.map((item) => normalize(item, source)).filter((item): item is Evidence => !!item);
  if (source.kind !== 'github' && source.kind !== 'rss') return items;
  return Promise.all(items.map((item) => enrichEvidence(item, get)));
}
