import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';

test('renders credited article images and recovers when a replacement cover is available', async ({ page, isMobile }) => {
  let repaired = false;
  await page.route('https://images.example.com/broken.png', (route) => route.abort());
  await page.route('https://images.example.com/cover.png', (route) => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
  }));
  await page.route('**/api/feed?**', (route) => route.fulfill({ json: { success: true,
    data: { items: [fixtureStory({ image: {
      url: `https://images.example.com/${repaired ? 'cover' : 'broken'}.png`,
      alt: 'A photograph supplied by the original publisher', credit: 'Original publisher',
    } })], nextCursor: null } } }));
  await page.goto('/');
  await expect(page.getByText('No cover image')).toBeVisible();
  repaired = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  const image = page.locator('img[alt="A photograph supplied by the original publisher"]');
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty('naturalWidth', 1);
  if (!isMobile) {
    const bounds = await image.boundingBox();
    expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 1);
  }
  await expect(page.getByText('Original publisher', { exact: true })).toBeVisible();
  await expect(page.getByText('No cover image')).toHaveCount(0);
});
