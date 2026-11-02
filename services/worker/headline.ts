const grammar = new Set(('a an the and or but nor so yet as at by for from in into of on onto ' +
  'to up with without is are was were be been being it its that this these those their ' +
  'there they them we our you your i my he his she her who what when where why how ' +
  'than then if while can could would should will may might must not no do does did').split(' '));

export function hasRepeatedHeadlineKeyword(title: string): boolean {
  const words = title.toLocaleLowerCase('en').match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? [];
  const keywords = words.map((word) => word.replace(/['’]s$/, ''))
    .filter((word) => /\p{L}/u.test(word) && !grammar.has(word));
  return new Set(keywords).size !== keywords.length;
}
