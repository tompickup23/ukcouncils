import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const theme of ['light', 'dark'] as const) {
  for (const slug of ['burnley', 'cornwall', 'isle-of-wight', 'city-of-london']) {
    test(`${slug} nearby links work in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`/councils/${slug}/#similar`);
      const block = page.locator('[data-nearby-councils]');
      await expect(block.getByRole('heading', { name: 'Nearby and alike', exact: true })).toBeInViewport();
      await expect(block.locator('[data-nearby-gss]').first()).toBeVisible();
      await expect(block.locator('details')).toHaveCount(0);
      await expect(block).not.toContainText('£');
      if (slug === 'burnley') {
        await expect(block.locator('[data-nearby-group="boundary"] [data-nearby-gss]')).toHaveCount(5);
        await expect(block.locator('[data-nearby-group="county"] [data-nearby-gss]')).toHaveCount(11);
        await expect(block.locator('[data-nearby-group="similar"]')).toHaveCount(0);
        await expect(block.getByRole('link', { name: 'Calderdale Metropolitan district', exact: true })).toBeVisible();
        // The county heading already says these are districts, so the type is not repeated on each link.
        await expect(block.locator('[data-nearby-group="county"] .row-detail')).toHaveCount(0);
        await expect(block.getByRole('link', { name: 'Pendle', exact: true }).first()).toBeVisible();
      }
      if (slug === 'cornwall') await expect(block.getByText('touch or cross in the England map')).toBeVisible();
      if (slug === 'isle-of-wight') await expect(block.getByText('No neighbouring council area touches this one in this map.')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
      expect((await new AxeBuilder({ page }).include('[data-nearby-councils]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
      const first = block.locator('[data-nearby-gss]').first();
      const href = await first.getAttribute('href');
      await first.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }
}

test('scripts off retains the complete county and boundary lists', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/councils/burnley/#similar`);
    const links = page.locator('[data-nearby-councils] [data-nearby-gss]');
    await expect(links).toHaveCount(16);
    for (const link of await links.all()) await expect(link).toBeVisible();
    await links.first().click();
    await expect(page.locator('h1')).toContainText('Calderdale');
  } finally {
    await context.close();
  }
});
