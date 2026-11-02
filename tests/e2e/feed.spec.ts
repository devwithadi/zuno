import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';
import { swipeToStory } from '../support/deck';

test('guest reads cited cards and filters topics', async ({ page, isMobile }) => {
  await page.route('**/api/feed?**', async (route) => {
    const topic = new URL(route.request().url()).searchParams.get('topic');
    const story = fixtureStory({ title: topic === 'markets'
      ? 'Market update from public sources' : 'A clear brief from public research' });
    await route.fulfill({ json: { success: true, data: { items: [story], nextCursor: null } } });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'zuno', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'A clear brief from public research' })).toBeVisible();
  await expect(page.getByText('Source excerpt', { exact: true })).toBeVisible();
  await expect(page.getByText('The release includes a public technical report.')).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: /^Category menu:/ }).click();
  await page.getByRole('tab', { name: 'Markets' }).click();
  await expect(page.getByRole('heading', { name: 'Market update from public sources' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A clear brief from public research' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('recovers from a network failure and shows an honest empty state', async ({ page }) => {
  let failing = true;
  await page.route('**/api/feed?**', async (route) => {
    if (failing) await route.fulfill({ status: 503, body: 'Unavailable' });
    else await route.fulfill({ json: { success: true, data: { items: [], nextCursor: null } } });
  });
  await page.goto('/');
  await expect(page.getByText('The feed is unavailable. Please try again.')).toBeVisible();
  failing = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No stories here yet. Try another topic or check back in a few minutes.')).toBeVisible();
});

test('loads the next page without duplicating an earlier story', async ({ page, isMobile }) => {
  await page.route('**/api/feed?**', async (route) => {
    const more = new URL(route.request().url()).searchParams.has('cursor');
    const first = fixtureStory({ id: 'first', title: 'First article with useful evidence' });
    const next = fixtureStory({ id: 'second', title: 'Second article with useful evidence' });
    const initial = [first, ...Array.from({ length: 9 }, (_, index) => fixtureStory({
      id: `initial-${index}`, title: `Public source announcement number ${index}`,
    }))];
    await route.fulfill({ json: { success: true,
      data: { items: more ? [first, next] : initial, nextCursor: more ? null : 'next-page' } } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'First article with useful evidence' })).toBeVisible();
  if (isMobile) {
    for (let index = 0; index < 10; index += 1) {
      const title = index < 9 ? `Public source announcement number ${index}`
        : 'Second article with useful evidence';
      await swipeToStory(page, title);
    }
  } else {
    await page.getByRole('button', { name: 'More stories' }).scrollIntoViewIfNeeded();
    await page.getByText('Second article with useful evidence').click();
  }
  await expect(page.getByRole('heading', { name: 'Second article with useful evidence' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'First article with useful evidence' })).toHaveCount(0);
  if (isMobile) {
    for (let index = 0; index < 10; index += 1) {
      await page.getByRole('button', { name: 'Undo to previous card', exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: 'First article with useful evidence' })).toHaveCount(1);
    await expect(page.getByText('1 / 11', { exact: true })).toBeVisible();
  }
});
