import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';

test('a rich brief opens complete details and keeps evidence links available', async ({ page, isMobile }) => {
  const points = [
    'The release includes a public technical report.',
    'The repository includes examples for local development.',
    'The team documents known limitations of the first release.',
    'The evaluation includes a reproducible comparison with earlier tools.',
    'The source describes the configuration required to run the examples.',
  ];
  await page.route('**/api/feed?**', (route) => route.fulfill({ json: { success: true,
    data: { items: [fixtureStory({ bullets: points.map((text) => ({ text, sourceIds: ['source-1'] })) })],
      nextCursor: null } } }));
  await page.goto('/');
  if (isMobile) {
    await expect(page.getByText(points[2], { exact: true })).toBeVisible();
    await expect(page.getByText(points[3], { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Read full brief', exact: true }).click();
    await expect(page.getByText(points[4], { exact: true })).toBeVisible();
    const citations = page.getByRole('dialog', { name: 'Full story brief' });
    await expect(citations.getByRole('link', { name: 'Open citation 1: Research blog', exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Close full brief', exact: true }).click();
    await expect(page.getByText(points[3], { exact: true })).toHaveCount(0);
  } else {
    await expect(page.getByText(points[2], { exact: true })).toBeVisible();
    await expect(page.getByText(points[4], { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open citation 1: Research blog', exact: true })).toHaveCount(1);
  }
  await expect(page.getByText('[1] Research blog ↗', { exact: true })).toBeVisible();
});
