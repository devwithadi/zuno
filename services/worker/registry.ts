import type { Source } from '@zuno/shared';
import { aiSources } from './catalogue-ai.js';
import { technologySources } from './catalogue-technology.js';
import { businessSources } from './catalogue-business.js';
import { marketsSources } from './catalogue-markets.js';

const catalogues = [aiSources, technologySources, businessSources, marketsSources];
const interleaved = Array.from({ length: Math.max(...catalogues.map((group) => group.length)) },
  (_, index) => catalogues.flatMap((group) => group[index] ? [group[index]] : [])).flat();
const originalIds = ['hn', 'github', 'dev', 'google', 'fed', 'sec'];
const original = originalIds.map((id) => interleaved.find((source) => source.id === id))
  .filter((source): source is Source => !!source);
export const sources: Source[] = [...original,
  ...interleaved.filter((source) => !originalIds.includes(source.id))];
