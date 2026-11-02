import { plainText } from './normalize.js';

const excluded = /install|getting started|quick.?start|setup|usage|build|contribut|licen[cs]e|support|sponsor|donat|credits|acknowledg|contact|translation|table of contents|documentation|development|testing|download/i;
export function readmeText(markdown: string): string {
  const lines = markdown.replace(/```[\s\S]*?```/g, '').split(/\r?\n/);
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let excludedLevel = 0;
  const flush = () => {
    const value = paragraph.join(' ').trim();
    if (value) blocks.push(/[.!?]$/.test(value) ? value : `${value}.`);
    paragraph = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    const underline = /^\s*[=-]{3,}\s*$/.test(lines[index + 1] ?? '');
    if (heading || underline) {
      flush();
      const level = heading?.[1].length ?? 1;
      const title = heading?.[2] ?? line;
      if (excludedLevel && level <= excludedLevel) excludedLevel = 0;
      if (!excludedLevel && excluded.test(title)) excludedLevel = level;
      if (underline) index += 1;
      continue;
    }
    if (excludedLevel) continue;
    if (!line) { flush(); continue; }
    if (line.includes('|') || /^[=-]{3,}$/.test(line) || /^https?:\/\/\S+$/.test(line)) continue;
    const cleaned = plainText(line.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|__|`/g, ''));
    if (!cleaned || /^[\s\W_]+$/.test(cleaned) ||
        /^(?:official website|discord|telegram|join our|screenshots|credits|created by)\b/i.test(cleaned)) continue;
    const list = cleaned.match(/^[-*+]\s+(.+)/);
    if (list) { flush(); paragraph = [list[1]]; flush(); }
    else paragraph.push(cleaned);
  }
  flush();
  return blocks.join(' ').slice(0, 12_000);
}
