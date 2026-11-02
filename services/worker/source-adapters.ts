import { z } from 'zod';
import type { FetchText } from './fetch.js';

export async function hackerNews(body: string, get: FetchText) {
  const ids = z.array(z.number().int().positive()).parse(JSON.parse(body)).slice(0, 10);
  const results = await Promise.allSettled(ids.map(async (id) => {
    const item = z.object({ title: z.string(), url: z.string().optional(), text: z.string().optional(),
      time: z.number(), type: z.string(), dead: z.boolean().optional(), deleted: z.boolean().optional()
    }).parse(JSON.parse(await get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
    if (item.type !== 'story' || item.dead || item.deleted || !item.text || item.text.length < 80) return null;
    return { title: item.title, url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
      text: item.text, date: new Date(item.time * 1000).toISOString() };
  }));
  return results.flatMap((result) => result.status === 'fulfilled' && result.value ? [result.value] : []);
}
export function github(body: string) {
  const data = z.object({ items: z.array(z.object({ full_name: z.string(),
    html_url: z.string(), description: z.string().nullable(), updated_at: z.string() })) }).parse(JSON.parse(body));
  return data.items.slice(0, 10).map((item) => ({ title: item.full_name,
    url: item.html_url, text: item.description ?? item.full_name, date: item.updated_at }));
}
export async function devArticles(body: string, get: FetchText) {
  const items = z.array(z.object({ id: z.number().int().positive() })).parse(JSON.parse(body));
  const results = await Promise.allSettled(items.slice(0, 10).map(async ({ id }) => {
    const article = z.object({ title: z.string(), url: z.string(), body_markdown: z.string(),
      published_at: z.string(), cover_image: z.string().nullable().optional(),
      social_image: z.string().nullable().optional() }).parse(JSON.parse(await get(`https://dev.to/api/articles/${id}`)));
    return { title: article.title, url: article.url, text: article.body_markdown,
      date: article.published_at, image: article.cover_image ?? article.social_image };
  }));
  return results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
}
