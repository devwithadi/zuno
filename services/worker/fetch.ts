import { sources } from './registry.js';

const allowedHosts = new Set([
  'hacker-news.firebaseio.com', 'api.github.com', 'raw.githubusercontent.com', 'dev.to',
  ...sources.filter((source) => source.enabled).flatMap((source) =>
    [new URL(source.url).hostname, ...(source.articleHosts ?? [])]),
]);
export type FetchText = (url: string) => Promise<string>;
export async function safeFetch(url: string, fetcher: typeof fetch = fetch): Promise<string> {
  return readSource(url, fetcher, false);
}
export async function safeFetchPreview(url: string): Promise<string> {
  return readSource(url, fetch, true);
}
async function readSource(url: string, fetcher: typeof fetch, preview: boolean): Promise<string> {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.port || target.username || target.password ||
      !allowedHosts.has(target.hostname)) throw Error('Source URL is not approved');
  const response = await fetcher(target, {
    redirect: 'error', signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'Zuno-MVP/0.1 (public feed reader)', Accept: 'application/json, application/xml, text/xml' },
  });
  if (!response.ok) throw Error(`Source returned HTTP ${response.status}`);
  if (!preview && Number(response.headers.get('content-length')) > 1_000_000) {
    await response.body?.cancel();
    throw Error('Source body too large');
  }
  const reader = response.body?.getReader();
  if (!reader) throw Error('Source body missing');
  const decoder = new TextDecoder();
  let text = '';
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (preview) {
        const remaining = 64_000 - size;
        text += decoder.decode(chunk.value.subarray(0, remaining), { stream: true });
        size += chunk.value.byteLength;
        if (size >= 64_000) break;
        continue;
      }
      size += chunk.value.byteLength;
      if (size > 1_000_000) throw Error('Source body too large');
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    await reader.cancel();
  }
}
