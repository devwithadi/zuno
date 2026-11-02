import type { Evidence } from '@zuno/shared';
import { sources } from './registry.js';
type SourceImage = NonNullable<Evidence['image']>;
const publisherHosts = new Set(sources.filter((source) => source.enabled).flatMap((source) =>
  [new URL(source.url).hostname, ...(source.articleHosts ?? [])]));

export function sourceImage(value: unknown, alt: string, credit: string): SourceImage | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(decodeImageUrl(value));
    const allowed = ['dev.to', 'cloudinary.com', 'githubusercontent.com', 'github.com',
      'googleusercontent.com', 'storage.googleapis.com', 'blog.google', 'federalreserve.gov', 'sec.gov'];
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !(publisherHosts.has(url.hostname) ||
          ['cdn.stackoverflow.co', 'd2908q01vomqb2.cloudfront.net', 'imgproxy.divecdn.com'].includes(url.hostname) ||
          allowed.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) ||
        /\.svg$/i.test(url.pathname)) return undefined;
    return { url: url.toString(), alt: alt.slice(0, 240), credit };
  } catch { return undefined; }
}
export function firstImage(text: string, base?: string): string | undefined {
  const candidates = text.matchAll(/<img\b[^>]*>|!\[[^\]]*\]\(([^\s)]+)(?:\s[^)]*)?\)/gi);
  const ranked: { url: string; width: number }[] = [];
  for (const match of candidates) {
    if (/qr[-_ ]?code|qq[-_ ]?group|wechat|weixin|badge|build status|visitor count/i.test(match[0])) continue;
    try {
      const tag = match[0];
      const width = Number(tag.match(/\bwidth=["'](\d+)/i)?.[1] ?? 0);
      const height = Number(tag.match(/\bheight=["'](\d+)/i)?.[1] ?? 0);
      const small = (width > 0 && width < 320) || (height > 0 && height < 160);
      const src = match[1] ?? tag.match(/\bsrc=["']([^"']+)/i)?.[1];
      const srcset = tag.match(/\bsrcset=["']([^"']+)/i)?.[1];
      const variants = srcset?.split(',').map((entry) => {
        const [url, size] = entry.trim().split(/\s+/);
        return { url, width: Number(size?.replace(/w$/, '')) || width };
      }) ?? [];
      for (const candidate of [...variants.filter((entry) => entry.width >= 320),
        ...(src && !small ? [{ url: src, width }] : [])]) {
        const url = new URL(decodeImageUrl(candidate.url), base).toString();
        if (sourceImage(url, 'Source image', 'Source')) ranked.push({ url, width: candidate.width });
      }
    } catch { continue; }
  }
  return ranked.toSorted((a, b) => b.width - a.width)[0]?.url;
}
export function decodeImageUrl(value: string): string {
  return value.replace(/&amp;|&#0*38;|&#x0*26;/gi, '&');
}
