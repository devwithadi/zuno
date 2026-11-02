import { expect, it } from 'vitest';
import { parseRss } from '../../services/worker/rss.js';
import { contentText } from '../../services/worker/content-text.js';

it('reads attributed Atom titles and selects the alternate article instead of self or replies', () => {
  const [item] = parseRss(`<feed><entry><title type="html">A useful research release</title>
    <link rel="self" type="application/atom+xml" href="https://news.example/feed/42"/>
    <link rel="replies" type="text/html" href="https://news.example/comments/42"/>
    <link rel="alternate" type="text/html" href="https://news.example/article/42"/>
    <summary type="html">A detailed release summary.</summary>
    <updated>2026-10-31T10:00:00Z</updated></entry></feed>`);
  expect(item.title).toBe('A useful research release');
  expect(item.url).toBe('https://news.example/article/42');
  expect(item.text).toBe('A detailed release summary.');
});

it('uses an unqualified Atom article link ahead of an image enclosure', () => {
  const [item] = parseRss(`<feed><entry><title>A public newsroom announcement</title>
    <link href="https://news.example/story"/>
    <link rel="enclosure" type="image/jpeg" href="https://news.example/cover.jpg"/>
    <content>Public release text with useful context.</content></entry></feed>`);
  expect(item.url).toBe('https://news.example/story');
});

it('retains nested XHTML article content and inline images rather than dropping the body', () => {
  const [item] = parseRss(`<feed><entry><title type="text">A detailed software release</title>
    <link href="https://news.example/story"/><summary>A short teaser.</summary>
    <content type="xhtml"><div xmlns="http://www.w3.org/1999/xhtml">
    <p>The release adds <strong>local diagnostics</strong> for application developers.</p>
    <p>It includes a setup guide and documented limits.</p>
    <img src="https://storage.googleapis.com/article/cover.png"/>
    </div></content></entry></feed>`);
  expect(contentText(item.text)).toContain('The release adds local diagnostics for application developers.');
  expect(contentText(item.text)).toContain('documented limits');
  expect(item.image).toBe('https://storage.googleapis.com/article/cover.png');
});

it('supports RSS1 RDF items and Dublin Core dates', () => {
  const [item] = parseRss(`<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Public bank releases</title></channel>
    <item rdf:about="https://bank.example/releases/42"><title>A monetary policy announcement</title>
    <link>https://bank.example/releases/42</link><description>Officials described policy changes.</description>
    <dc:date>2026-10-31T10:00:00Z</dc:date></item></rdf:RDF>`);
  expect(item).toMatchObject({ title: 'A monetary policy announcement',
    url: 'https://bank.example/releases/42', date: '2026-10-31T10:00:00Z' });
});

it('keeps full RSS content, media images and the ten-item bound', () => {
  const body = '<rss><channel>' + Array.from({ length: 12 }, (_, index) => `<item>
    <title>Useful release number ${index}</title><link>https://news.example/${index}</link>
    <description>Teaser text.</description>
    <content:encoded><![CDATA[<p>The complete release has more context and known limitations.</p>]]></content:encoded>
    <media:thumbnail url="https://news.example/cover.png"/>
    <pubDate>Sat, 31 Oct 2026 10:00:00 GMT</pubDate></item>`).join('') + '</channel></rss>';
  const items = parseRss(body);
  expect(items).toHaveLength(10);
  expect(items[0].text).toContain('complete release');
  expect(items[0].image).toBe('https://news.example/cover.png');
  expect(parseRss('<rss><channel></channel></rss>')).toEqual([]);
});

it('unwraps Atom CDATA content without dropping its opening text', () => {
  const [item] = parseRss('<feed><entry><title>A useful research release</title>' +
    '<content type="html"><![CDATA[<p>The full release explains useful details.</p>]]></content>' +
    '</entry></feed>');
  expect(contentText(item.text)).toBe('The full release explains useful details.');
});
