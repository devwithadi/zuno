import type { Evidence } from '@zuno/shared';
import { safeFetch, safeFetchPreview, type FetchText } from './fetch.js';
import { articleBody } from './article-body.js';
import { sources } from './registry.js';
import { firstImage, sourceImage } from './images.js';

export async function enrichArticle(item: Evidence, get: FetchText): Promise<Evidence> {
  const url = new URL(item.url);
  const source = sources.find((entry) => entry.enabled && entry.id === item.sourceId);
  if ((item.text.length >= 1200 && item.image?.url) || !source?.articleHosts?.includes(url.hostname) ||
      url.protocol !== 'https:' || url.port || url.username || url.password) return item;
  let html: string;
  let complete = true;
  try { html = await get(url.toString()); }
  catch (error) {
    if (get !== safeFetch || item.image?.url) throw error;
    html = await safeFetchPreview(url.toString());
    complete = false;
  }
  const text = complete ? articleBody(html) : '';
  const cover = metadataImage(html) ?? firstImage(html, item.url);
  let image = item.image;
  if (cover) {
    try {
      image = sourceImage(new URL(cover, item.url).toString(), item.title,
        `${item.sourceName} article image`) ?? image;
    } catch { /* Invalid publisher image metadata leaves the existing cover unchanged. */ }
  }
  return { ...item, text: text.length > item.text.length ? text : item.text, image };
}

function metadataImage(html: string): string | undefined {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = [...match[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)];
    const values = Object.fromEntries(attributes.map((attribute) => [attribute[1].toLowerCase(), attribute[2]]));
    if (values.property === 'og:image' || values.name === 'twitter:image') return values.content;
  }
  return undefined;
}
