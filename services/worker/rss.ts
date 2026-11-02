import { XMLParser } from 'fast-xml-parser';
import { firstImage } from './images.js';

export function parseRss(body: string) {
  const parsed = new XMLParser({ ignoreAttributes: false, processEntities: false,
    stopNodes: ['*.content', '*.summary'] }).parse(body);
  const items = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? parsed?.['rdf:RDF']?.item ?? [];
  return (Array.isArray(items) ? items : [items]).slice(0, 10).map((item) => {
    const candidates = [item['content:encoded'], item.content, item.description, item.summary]
      .map(textValue).filter(Boolean);
    const text = candidates.toSorted((a, b) => b.length - a.length)[0] ?? '';
    const links = Array.isArray(item.link) ? item.link : [item.link];
    const enclosure = item.enclosure ?? links.find((link: { '@_rel'?: string } | undefined) => link?.['@_rel'] === 'enclosure');
    const media = [item['media:content'], item['media:thumbnail']].flat().filter(Boolean)
      .filter((entry) => !entry['@_type'] || String(entry['@_type']).startsWith('image/'))
      .toSorted((a, b) => Number(b['@_width'] ?? 0) - Number(a['@_width'] ?? 0));
    const image = media[0]?.['@_url']
      ?? (enclosure?.['@_type']?.startsWith('image/')
        ? enclosure['@_url'] ?? enclosure['@_href'] : undefined) ?? firstImage(text);
    return { title: textValue(item.title), url: articleLink(item.link), text, image,
      date: item.pubDate ?? item.published ?? item.updated ?? item['dc:date'] };
  });
}

function textValue(value: unknown): string {
  if (typeof value === 'string') return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  if (!value || typeof value !== 'object') return '';
  const node = value as Record<string, unknown>;
  return typeof node['#text'] === 'string' ? textValue(node['#text']) : '';
}

function articleLink(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  const links = (Array.isArray(value) ? value : [value])
    .filter((link): link is Record<string, unknown> => !!link && typeof link === 'object');
  const html = (link: Record<string, unknown>) =>
    !link['@_type'] || String(link['@_type']).includes('html');
  const article = links.find((link) => link['@_rel'] === 'alternate' && html(link))
    ?? links.find((link) => !link['@_rel'] && html(link))
    ?? links.find((link) => link['@_rel'] === 'alternate');
  return typeof article?.['@_href'] === 'string' ? article['@_href'] : undefined;
}
