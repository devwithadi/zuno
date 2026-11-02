import type { Evidence } from '@zuno/shared';
import { extractStory } from '../../services/worker/editor.js';

export const points = [
  'The diagnostic tool checks application errors on a laptop without uploading private logs. The inspection happens on the same computer that stores those logs, and the project describes this local workflow as its approach to investigating application failures.',
  'The tool groups repeated failures into a report developers can inspect. Related errors appear together, letting a team examine the messages within their original diagnostic context rather than having to compare each separate message in an application log.',
  'Teams can export a detailed diagnostic report to share findings with colleagues. The report includes grouped errors and the original context associated with them, giving another developer material to review when discussing a particular application failure with the team.',
  'The project remains in developer preview and may change between releases. Its documentation advises users to review the stated limitations before relying on its current behavior, so the available features should be understood as the current preview rather than a finished release.',
  'The documented workflow starts with local inspection and ends with a report a team can share. It combines error grouping and export in the same diagnostic process, while the preview documentation remains the place to check current behavior and limitations.',
];
export const evidence: Evidence[] = [{ id: 'source', sourceId: 'dev', sourceName: 'DEV',
  url: 'https://dev.to/tool', title: 'A useful application diagnostic utility',
  text: points.join(' '), topic: 'technology', publishedAt: '2026-10-24T10:00:00.000Z' }];
export const story = { ...extractStory(evidence), mode: 'langchain' as const,
  title: 'Check app errors without uploading private logs',
  bullets: points.map((text) => ({ text, sourceIds: ['source'] })) };
export const support = { supported: true, quotes: [{ sourceId: 'source', text: evidence[0].text }] };
export const review = { approved: true, headline: support,
  claims: points.map((_, bulletIndex) => ({ bulletIndex, ...support })) };
export const env = { EDITOR_MODE: 'langchain', LOCAL_MODEL_NAME: 'local',
  LOCAL_MODEL_URL: 'http://127.0.0.1:11434/v1' };
export const response = (value: unknown) => ({ content: JSON.stringify(value) });
