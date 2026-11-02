import { selectExcerpt } from './excerpt.js';

export function contentPointers(text: string): string[] {
  const sentences = [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)]
    .map((part) => part.segment.trim()).filter((part) => part.length >= 8);
  const useful = [...new Set(sentences)].filter(isUseful);
  const distinct = useful.filter((part) => part.length >= 40);
  return (distinct.length ? distinct : useful)
    .slice(0, 5).map((part) => selectExcerpt(part));
}

function isUseful(sentence: string): boolean {
  if (/^(?:click here|read more|subscribe|follow me|install with|npm install|contribut|support us|licen[cs]e|sponsor|donat|credits|copyright)/i.test(sentence) ||
      /[|]|={3,}|svg>/i.test(sentence) ||
      /^(?:[⭐★☆]\s*)?(?:help more people|star (?:this|the)|give (?:this|the).+star)\b/i.test(sentence)) return false;
  const separators = sentence.match(/·|&bull;|•/g)?.length ?? 0;
  return separators < 2 || /\b(?:is|are|was|were|can|will|supports|includes|provides|runs|works|allows|enables|uses|keeps|offers)\b/i.test(sentence);
}
