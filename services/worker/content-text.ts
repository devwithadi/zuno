import { plainText } from './normalize.js';

export function contentText(value: string): string {
  return plainText(value.replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:#{1,6}|>|[-*+]\s)\s*/gm, '')
    .replace(/(^|[.!?]\s+)>+\s*/g, '$1')
    .replace(/\*\*|__|`/g, '')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|[.!?,]|$)/g, '$1$2')).slice(0, 12_000);
}
