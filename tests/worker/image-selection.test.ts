import { expect, it } from 'vitest';
import { firstImage } from '../../services/worker/images.js';
import { enrichEvidence } from '../../services/worker/enrich.js';
import { parseRss } from '../../services/worker/rss.js';

it('prefers a large responsive publisher image and decodes its query string', () => {
  expect(firstImage('<img width="80" height="80" src="https://www.apple.com/icon.png">' +
    '<img width="300" height="150" src="https://www.apple.com/small.jpg" ' +
    'srcset="https://www.apple.com/medium.jpg 640w, https://www.apple.com/large.jpg?w=1600&amp;h=900 1600w">'))
    .toBe('https://www.apple.com/large.jpg?w=1600&h=900');
});

it('selects the highest-resolution RSS media entry rather than a thumbnail', () => {
  const [item] = parseRss('<rss><channel><item><title>A publisher update</title>' +
    '<media:content url="https://www.apple.com/small.jpg" width="120" height="80"/>' +
    '<media:content url="https://www.apple.com/large.jpg" width="1600" height="900"/>' +
    '</item></channel></rss>');
  expect(item.image).toBe('https://www.apple.com/large.jpg');
});

it('skips community QR codes and badges before choosing a project visual', () => {
  const base = 'https://raw.githubusercontent.com/team/project/HEAD/README.md';
  const markdown = '![Join](docs/qq-group-123.jpg)\n' +
    '![QR code](docs/community.jpg)\n![Build status](docs/badge.png)\n' +
    '![Product screenshot](docs/preview.png)';
  expect(firstImage(markdown, base)).toBe(new URL('docs/preview.png', base).href);
});

it('replaces an old README QR cover and normalizes wrapped blockquotes', async () => {
  const result = await enrichEvidence({ id: 'repo', sourceId: 'github', sourceName: 'GitHub',
    url: 'https://github.com/team/project', title: 'A useful public project', topic: 'technology',
    text: 'Old metadata and navigation links. '.repeat(20), publishedAt: '2026-10-26T00:00:00.000Z',
    image: { url: 'https://github.com/team/qr-code.png', alt: 'Old cover', credit: 'Repository README' },
  }, async () => '![QR code](docs/qq-group-123.jpg)\n\n> This tool processes files locally\n> without uploading private data.');
  expect(result.image?.credit).toContain('owner avatar');
  expect(result.text).toContain('locally without uploading');
  expect(result.text).not.toContain('>');
});
