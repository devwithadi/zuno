import { contentText } from './content-text.js';

export function articleBody(html: string): string {
  const bounded = html.slice(0, 1_000_000);
  if (/["']isAccessibleForFree["']\s*:\s*(?:false|["']false["'])/i.test(bounded)) return '';
  const structured = [...bounded.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of structured) {
    try {
      const body = structuredBody(JSON.parse(script[1]));
      if (body) return clean(body);
    } catch { /* Invalid publisher metadata does not replace article evidence. */ }
  }
  const selectors = [/<article\b[^>]*>/i,
    /<div\b[^>]*\bid=["'](?:article|article-body|article-content)["'][^>]*>/i, /<main\b[^>]*>/i];
  for (const selector of selectors) {
    const opening = bounded.match(selector);
    if (!opening || opening.index === undefined) continue;
    const region = balancedRegion(bounded, opening.index, opening[0]);
    const richText = [...region.matchAll(/<div\b[^>]*class=["'][^"']*\brich-text\b[^"']*["'][^>]*>/gi)]
      .map((match) => balancedRegion(region, match.index!, match[0])).join(' ');
    const text = clean(richText || region);
    if (text.length >= 80) return text;
  }
  return '';
}

function structuredBody(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || !value || typeof value !== 'object') return undefined;
  if (Array.isArray(value)) return value.slice(0, 30)
    .map((entry) => structuredBody(entry, depth + 1)).find(Boolean);
  const item = value as Record<string, unknown>;
  const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
  if (types.some((type) => typeof type === 'string' && /Article$/.test(type)) &&
      typeof item.articleBody === 'string' && item.articleBody.length >= 80) return item.articleBody;
  return structuredBody(item['@graph'], depth + 1);
}

function balancedRegion(html: string, start: number, opening: string): string {
  const tag = opening.match(/^<(\w+)/)?.[1];
  if (!tag) return '';
  const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tokens.lastIndex = start;
  let depth = 0;
  for (let token = tokens.exec(html); token; token = tokens.exec(html)) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start + opening.length, token.index);
  }
  return '';
}

function clean(html: string): string {
  return contentText(html.replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(script|style|nav|aside|header|footer|form)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(?:p|li|h[1-6]|div|section)>/gi, ' '));
}
