import { expect, it } from 'vitest';
import { collect, sources } from '../../services/worker/sources.js';
import { extractStory, verifyStory } from '../../services/worker/editor.js';
import type { Evidence } from '@zuno/shared';

const text = 'The tool scans application logs without sending data to a cloud service. It groups repeated failures so developers can identify the underlying cause. Teams can run the tool locally and export a report for their colleagues.';
const evidence = Object.assign({ id: 'article', sourceId: 'dev', sourceName: 'DEV',
  title: 'A developer tool for understanding application failures', text,
  url: 'https://dev.to/tools/new', publishedAt: '2026-10-24T10:00:00.000Z',
  topic: 'technology' as const }, { image: { url: 'https://media2.dev.to/cover.png', alt: 'Application diagnostic tool', credit: 'DEV article cover' } });
it('extracts three useful distinct pointers and the actual source image', () => {
  const story = extractStory([evidence]);
  expect(story.bullets).toHaveLength(3);
  expect(story.image).toEqual(evidence.image);
  expect(verifyStory(story, [evidence])).toEqual(story);
  expect(() => verifyStory({ ...story, image: { url: 'https://example.com/invented.png',
    alt: 'Invented image' } }, [evidence])).toThrow();
});
it('reads DEV article bodies and source-provided cover images', async () => {
  const source = sources.find((item) => item.id === 'dev')!;
  const items = await collect(source, async (url) => url.includes('/articles?')
    ? JSON.stringify([{ id: 42 }]) : JSON.stringify({ title: evidence.title,
      url: evidence.url, body_markdown: text, published_at: evidence.publishedAt,
      cover_image: evidence.image.url }));
  expect(items).toHaveLength(1);
  expect(items[0].text).toContain('underlying cause');
  expect(items[0].image?.url).toBe(evidence.image.url);
});
it('expands GitHub descriptions with the bounded public README', async () => {
  const items = await collect(sources.find((item) => item.id === 'github')!, async (url) =>
    url.includes('raw.githubusercontent.com') ? text
      : JSON.stringify({ items: [{ full_name: 'zuno/tool', html_url: 'https://github.com/zuno/tool',
        description: 'Local diagnostic tool', updated_at: evidence.publishedAt }] }));
  expect(items[0].text).toContain('underlying cause');
});
it('keeps informative RSS full text and supplied media instead of short descriptions', async () => {
  const source = sources.find((item) => item.id === 'google')!;
  const items = await collect(source, async () => `<rss><channel><item><title>${evidence.title}</title>` +
    `<link>https://blog.google/article</link><description>Short teaser.</description>` +
    `<content:encoded><![CDATA[<p>${text}</p>]]></content:encoded>` +
    `<media:content url="https://storage.googleapis.com/article.png" type="image/png"/>` +
    `<pubDate>Sat, 24 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>`);
  expect(extractStory(items).bullets).toHaveLength(3);
  expect(items[0].image?.url).toBe('https://storage.googleapis.com/article.png');
});
it('does not publish bare HN headlines as if full articles had been read', async () => {
  const items = await collect(sources[0], async (url) => url.includes('topstories') ? '[1]' :
    JSON.stringify({ title: 'A useful developer release', type: 'story', time: 1792836000,
      url: 'https://example.org/article' }));
  expect(items).toEqual([]);
});
