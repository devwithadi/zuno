import { expect, type Page } from '@playwright/test';

export async function swipeToStory(page: Page, title: string) {
  const card = page.getByTestId('swipe-card');
  const box = await card.boundingBox();
  if (!box) throw Error('Story card is not visible');
  const x = box.x + box.width * 0.8;
  const y = box.y + box.height * 0.3;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, y, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}
