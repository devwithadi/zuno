import { createHash } from 'node:crypto';
import type { Evidence } from '@zuno/shared';

export function canonicalUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Unsafe URL');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}
export const fingerprint = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 32);
export function plainText(value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '\"').replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}
export function groupEvidence(items: Evidence[]): Evidence[][] {
  const unique = [...new Map(items.map((item) => [canonicalUrl(item.url), item])).values()];
  const groups = new Map<string, Evidence[]>();
  const contentGroups = new Map<string, string>();
  for (const item of unique) {
    // shortcut: exact title/content matches; upgrade to semantic grouping with evaluated evidence.
    const key = item.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const hash = fingerprint(plainText(item.text || item.title).toLowerCase());
    const groupKey = contentGroups.get(hash) ?? key;
    contentGroups.set(hash, groupKey);
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), item].slice(0, 5));
  }
  return [...groups.values()];
}
