import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';

test('rich briefs keep citations compact, named and touch accessible', async ({ page }) => {
  const title = `research-lab/${'long-repository-name-'.repeat(6)}`;
  const story = fixtureStory({ title, bullets: [
    { text: 'The release includes a public technical report.', sourceIds: ['source-1'] },
    { text: 'The public repository includes reproducible evaluation tools.', sourceIds: ['source-1'] },
    { text: 'The documentation describes the limitations of the initial release.', sourceIds: ['source-1'] },
  ] });
  await page.route('**/api/feed?**', (route) => route.fulfill({
    json: { success: true, data: { items: [story], nextCursor: null } },
  }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const citations = page.getByRole('link', { name: 'Open citation 1: Research blog', exact: true });
  await expect(citations).toHaveCount(1);
  await expect(citations.first()).toHaveText('[1]');
  await expect(page.getByText('[1] Research blog ↗', { exact: true })).toHaveCount(1);
  for (const citation of await citations.all()) {
    const box = await citation.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
