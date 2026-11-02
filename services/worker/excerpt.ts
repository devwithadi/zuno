const EXCERPT_LIMIT = 320;
const MINIMUM_SENTENCE = 32;

export function selectExcerpt(text: string): string {
  if (text.length <= EXCERPT_LIMIT) return text;
  const window = text.slice(0, EXCERPT_LIMIT);
  const endings = [...window.matchAll(/[.!?](?=\s|$)/g)]
    .map((match) => match.index + 1).filter((end) => end >= MINIMUM_SENTENCE);
  const sentenceEnd = endings.at(-1);
  if (sentenceEnd) return window.slice(0, sentenceEnd);
  const wordEnd = window.lastIndexOf(' ');
  return window.slice(0, wordEnd >= MINIMUM_SENTENCE ? wordEnd : EXCERPT_LIMIT);
}
