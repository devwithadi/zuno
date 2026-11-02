import { expect, test } from '@playwright/test';
import { fixtureStory } from '../support/story';

test('shows a LangChain hook and connected brief with its original evidence link', async ({ page, isMobile }) => {
  const title = 'Find app errors while keeping your logs local';
  const points = [
    'The new tool checks app errors on your laptop. Your private logs stay on your device.',
    'It groups repeated errors so developers can find the cause. That keeps the brief focused on the underlying issue.',
    'Teams can export a detailed report and share it with colleagues. The source documents how to run the tool locally.',
  ];
  const story = fixtureStory({ title, mode: 'langchain',
    bullets: points.map((text) => ({ text, sourceIds: ['source-1'] })) });
  await page.route('**/api/feed?**', (route) => route.fulfill({ json: {
    success: true, data: { items: [story], nextCursor: null },
  } }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(page.getByText(points[0], { exact: true })).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: 'Read full brief', exact: true }).click();
  const brief = isMobile ? page.getByRole('dialog', { name: 'Full story brief' }) : page;
  await expect(brief.getByText('Edited brief', { exact: true })).toBeVisible();
  await page.context().route(story.sources[0].url, (route) => route.fulfill({ body: 'Source fixture' }));
  const opened = page.waitForEvent('popup');
  await brief.getByRole('link').filter({ hasText: 'Research blog' }).first().click();
  const source = await opened;
  await expect(source).toHaveURL(story.sources[0].url);
  await source.close();
});
