import { expect, it, vi } from 'vitest';
import type { Evidence } from '@zuno/shared';
import { enrichEvidence } from '../../services/worker/enrich.js';
import { collect, sources } from '../../services/worker/sources.js';

const evidence: Evidence = { id: 'fed-item', sourceId: 'fed', sourceName: 'Federal Reserve',
  url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm',
  title: 'Federal Reserve issues policy statement', topic: 'business',
  text: 'The committee issued its latest statement.', publishedAt: '2026-10-28T10:00:00.000Z' };
const facts = 'The committee kept its target range unchanged. Officials will assess incoming data before deciding on future changes. The statement says the outlook remains uncertain and the committee is attentive to risks.';

it('replaces sparse RSS text with the publisher article and retains its identity', async () => {
  const get = vi.fn().mockResolvedValue(`<header>Navigation</header><main><nav>Menus</nav>
    <article><p>${facts}</p><script>malicious instructions</script></article>
    <aside>Related stories</aside></main><footer>Subscribe</footer>`);
  const result = await enrichEvidence(evidence, get);
  expect(result.text).toBe(facts);
  expect(result.id).toBe(evidence.id);
  expect(result.publishedAt).toBe(evidence.publishedAt);
  expect(get).toHaveBeenCalledExactlyOnceWith(evidence.url);
});

it('reads nested Federal Reserve article containers without stopping at the first div', async () => {
  const result = await enrichEvidence(evidence, async () => `<div id="article">
    <div>Press release</div><p>${facts}</p></div><div>Privacy policy</div>`);
  expect(result.text).toContain(facts);
  expect(result.text).not.toContain('Privacy policy');
});

it('prefers publisher rich-text sections over sharing controls and article chrome', async () => {
  const result = await enrichEvidence(evidence, async () => `<main><div>Copy link and social sharing</div>
    <div class="rich-text"><p>${facts}</p></div>
    <div class="rich-text"><p>Officials described their next steps in the release.</p></div></main>`);
  expect(result.text).toContain(facts);
  expect(result.text).toContain('next steps');
  expect(result.text).not.toContain('social sharing');
});

it('reads structured article text and a permitted publisher cover', async () => {
  const google = { ...evidence, sourceId: 'google', sourceName: 'Google AI',
    url: 'https://blog.google/innovation-and-ai/technology/ai/research-update/' };
  const html = `<script type="application/ld+json">${JSON.stringify({ '@graph': [
    { '@type': 'NewsArticle', articleBody: facts },
  ] })}</script><meta content="https://storage.googleapis.com/article/cover.png" property="og:image">`;
  const result = await enrichEvidence(google, async () => html);
  expect(result.text).toBe(facts);
  expect(result.image?.url).toBe('https://storage.googleapis.com/article/cover.png');
  expect(result.image?.credit).toBe('Google AI article image');
});

it('does not fetch arbitrary hosts, source-host mismatches or already full evidence', async () => {
  const get = vi.fn();
  const unapproved = { ...evidence, url: 'https://evil.example/article' };
  expect(await enrichEvidence(unapproved, get)).toEqual(unapproved);
  const mismatch = { ...evidence, url: 'https://blog.google/news/article/' };
  expect(await enrichEvidence(mismatch, get)).toEqual(mismatch);
  const full = { ...evidence, text: facts.repeat(8),
    image: { url: 'https://www.federalreserve.gov/cover.jpg', alt: 'Publisher cover' } };
  expect(await enrichEvidence(full, get)).toEqual(full);
  expect(get).not.toHaveBeenCalled();
});

it('retains RSS evidence on fetch errors, missing article regions and smaller extracted text', async () => {
  expect(await enrichEvidence(evidence, async () => { throw Error('offline'); })).toEqual(evidence);
  expect(await enrichEvidence(evidence, async () => '<body>Navigation and signup</body>')).toEqual(evidence);
  expect(await enrichEvidence(evidence, async () => '<article>Short.</article>')).toEqual(evidence);
});

it('enriches sparse RSS items during collection instead of publishing headline-only cards', async () => {
  const source = sources.find((entry) => entry.id === 'fed')!;
  const get = vi.fn(async (url: string) => url === source.url
    ? `<rss><channel><item><title>${evidence.title}</title><link>${evidence.url}</link>
      <description>${evidence.text}</description><pubDate>Wed, 28 Oct 2026 10:00:00 GMT</pubDate>
      </item></channel></rss>` : `<article><p>${facts}</p></article>`);
  const [result] = await collect(source, get);
  expect(result.text).toBe(facts);
  expect(get).toHaveBeenCalledTimes(2);
});
