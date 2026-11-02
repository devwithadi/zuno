import { afterEach, expect, it, vi } from 'vitest';
import { sourceImage, firstImage } from '../../services/worker/images.js';
import { enrichArticle } from '../../services/worker/article-enrich.js';
import { safeFetch, safeFetchPreview } from '../../services/worker/fetch.js';

afterEach(() => vi.unstubAllGlobals());

it('accepts expanded publisher covers while rejecting unapproved and deceptive hosts', () => {
  for (const host of ['news.mit.edu', 'www.apple.com', 'fortune.com',
    'cdn.stackoverflow.co', 'd2908q01vomqb2.cloudfront.net', 'imgproxy.divecdn.com']) {
    expect(sourceImage(`https://${host}/cover.jpg`, 'Cover', 'Publisher')?.url).toContain(host);
    expect(firstImage(`<img src="https://${host}/cover.jpg">`)).toContain(host);
  }
  expect(sourceImage('https://news.mit.edu.evil.example/cover.jpg', 'Cover', 'Bad')).toBeUndefined();
  expect(sourceImage('https://127.0.0.1/cover.jpg', 'Cover', 'Bad')).toBeUndefined();
});

it('reads only a bounded preview from large approved pages and retains full feed text', async () => {
  const meta = '<meta property="og:image" content="https://d2908q01vomqb2.cloudfront.net/cover.png">';
  const body = meta + 'x'.repeat(1_000_000);
  const fetcher = vi.fn(async () => new Response(body, { headers: { 'content-length': String(body.length) } }));
  vi.stubGlobal('fetch', fetcher);
  expect((await safeFetchPreview('https://aws.amazon.com/blogs/machine-learning/news/')).length).toBe(64_000);
  const item = { id: 'large', sourceId: 'aws-ml', sourceName: 'AWS', topic: 'ai' as const,
    url: 'https://aws.amazon.com/blogs/machine-learning/news/', title: 'An AWS announcement',
    text: 'Complete feed text. '.repeat(80), publishedAt: '2026-10-30T00:00:00.000Z' };
  const result = await enrichArticle(item, safeFetch);
  expect(result.text).toBe(item.text);
  expect(result.image?.url).toContain('cloudfront.net/cover.png');
  await expect(safeFetchPreview('https://evil.example/article')).rejects.toThrow('not approved');
});

it('fills a missing cover even when feed text is full and article text is shorter', async () => {
  const item = { id: 'cover', sourceId: 'stackoverflow', sourceName: 'Stack Overflow Blog',
    url: 'https://stackoverflow.blog/news/', title: 'A publisher announcement',
    text: 'Existing complete feed evidence. '.repeat(60), topic: 'technology' as const,
    publishedAt: '2026-10-30T00:00:00.000Z' };
  const result = await enrichArticle(item, async () =>
    '<meta property="og:image" content="https://cdn.stackoverflow.co/cover.png">');
  expect(result.text).toBe(item.text);
  expect(result.image?.url).toBe('https://cdn.stackoverflow.co/cover.png');
});
