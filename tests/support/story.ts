import type { Story } from '@zuno/shared';

export function fixtureStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'fixture-story', title: 'A new public research release', topic: 'ai',
    bullets: [{ text: 'The release includes a public technical report.', sourceIds: ['source-1'] }],
    sources: [{ id: 'source-1', name: 'Research blog', url: 'https://example.com/report' }],
    image: { alt: 'Abstract illustration of connected research notes' },
    publishedAt: '2026-10-24T10:00:00.000Z', updatedAt: '2026-10-24T10:00:00.000Z',
    readingSeconds: 12, mode: 'extractive', ...overrides,
  };
}
