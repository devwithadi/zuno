import { z } from 'zod';
import type { Evidence } from '@zuno/shared';
import { safeFetch, type FetchText } from './fetch.js';
import { readmeText } from './readme-text.js';
import { contentText } from './content-text.js';
import { firstImage, sourceImage } from './images.js';
import { enrichArticle } from './article-enrich.js';

export async function enrichEvidence(item: Evidence, get: FetchText = safeFetch): Promise<Evidence> {
  try {
    const url = new URL(item.url);
    if (item.sourceId === 'github' && url.hostname === 'github.com' &&
        /^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname)) {
      const base = `https://raw.githubusercontent.com${url.pathname.replace(/\/$/, '')}/HEAD/README.md`;
      const owner = url.pathname.split('/')[1];
      const avatar = sourceImage(`https://github.com/${owner}.png?size=800`,
        `${owner} repository owner avatar`, 'Repository owner avatar · GitHub');
      const fallback = { ...item, image: item.image ?? avatar };
      let markdown: string;
      try { markdown = await get(base); } catch { return fallback; }
      if (/^\s*(?:[{]|<rss\b|<feed\b)/i.test(markdown)) return fallback;
      const text = contentText(readmeText(markdown.replace(/^\s*>+\s?/gm, '')));
      return { ...item, text: text.length >= 40 ? text : item.text,
        image: sourceImage(firstImage(markdown, base), item.title, 'Repository README') ?? avatar };
    }
    if (item.sourceId === 'dev' && url.hostname === 'dev.to' && /^\/[\w-]+\/[\w-]+\/?$/.test(url.pathname)) {
      const article = z.object({ body_markdown: z.string(), cover_image: z.string().nullable().optional(),
        social_image: z.string().nullable().optional() }).parse(JSON.parse(await get(`https://dev.to/api/articles${url.pathname}`)));
      return { ...item, text: contentText(article.body_markdown),
        image: sourceImage(article.cover_image ?? article.social_image, item.title, 'DEV article image') ?? item.image };
    }
  } catch { /* A failed public enhancement retains the original evidence. */ }
  try { return await enrichArticle(item, get); } catch { return item; }
}
