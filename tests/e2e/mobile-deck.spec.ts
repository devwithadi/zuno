import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';

test('mobile opens a complete brief in a sheet and returns to the same card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const points = [
    'The new tool turns a long technical report into a short list of useful findings.',
    'It runs on the reader’s computer, so private documents do not need to leave the device.',
    'The published examples let developers check how the tool reaches its answers.',
    'The team says the initial version still needs people to review important results.',
    'The original source includes setup instructions and a public comparison with earlier tools.',
  ];
  await page.route('**/api/feed?**', (route) => route.fulfill({ json: { success: true,
    data: { items: [fixtureStory({ bullets: points.map((text) => ({ text, sourceIds: ['source-1'] })) })],
      nextCursor: null } } }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A new public research release', exact: true })).toBeVisible();
  await expect(page.getByText(points[3], { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Read full brief', exact: true }).click();
  const close = page.getByRole('button', { name: 'Close full brief', exact: true });
  await expect(close).toBeVisible();
  await expect(page.getByText(points[4], { exact: true })).toBeVisible();
  await close.click();
  await expect(close).toHaveCount(0);
  await expect(page.getByText(points[3], { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'A new public research release', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
