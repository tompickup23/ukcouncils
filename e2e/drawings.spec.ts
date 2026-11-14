import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * NV14 for the two drawings this site draws with Estate Kit 0.6.0: the class map on
 * /councils/ (NV8) and service expenditure as ranked bars on profiles (NV12). Each
 * runs in both projects (375 and desktop), in light and dark, through axe, with no
 * sideways scroll, and again with scripts off.
 */
test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

const noSidewaysScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
const axe = async (page: Page, selector: string) =>
  expect((await new AxeBuilder({ page }).include(selector).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);

for (const theme of ['light', 'dark'] as const) {
  test(`class map on /councils/ in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/councils/');
    const section = page.locator('.class-map');
    await expect(section.getByRole('heading', { name: 'Councils on a map, by class' })).toBeVisible();
    await expect(section.locator('a.ek-area-link')).toHaveCount(296);
    await noSidewaysScroll(page);
    await axe(page, '.class-map');
    // The skip link takes the keyboard past all 296 area links to the table drawer.
    await section.getByRole('link', { name: 'Skip the map' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#class-map-after$/);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('The map as a table');
    // An area is a working link to its council page.
    await section.locator('a.ek-area-link[href="/councils/cornwall/"]').click();
    await expect(page.locator('h1')).toContainText('Cornwall');
  });

  for (const slug of ['burnley', 'bournemouth-christchurch-and-poole', 'city-of-london', 'adur']) {
    test(`service bars on ${slug} in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`/councils/${slug}/#budget`);
      const bars = page.locator('#budget > [data-service-bars]');
      await expect(bars).toHaveCount(1);
      await expect(bars.locator('svg')).toBeVisible();
      await expect(bars.locator('.source-line')).toContainText('Source:');
      const tableRows = page.locator('[data-budget-drawer] .budget-tables > .table-wrap').first().locator('tbody tr');
      await expect(bars.locator('[data-ek-row]')).toHaveCount(await tableRows.count());
      await noSidewaysScroll(page);
      await axe(page, '#budget > [data-service-bars]');
      if (slug === 'burnley') {
        await page.locator('[data-county-budget-drawer] > summary').click();
        const county = page.locator('#county-budget [data-service-bars]');
        await expect(county.locator('svg')).toBeVisible();
        await noSidewaysScroll(page);
        await axe(page, '#county-budget [data-service-bars]');
      }
    });
  }
}

test('scripts off: the map links, its table and the bars are all in the page', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/councils/`);
    await expect(page.locator('.class-map a.ek-area-link')).toHaveCount(296);
    await page.locator('#class-map-after > summary').click();
    await expect(page.locator('#class-map-after tbody tr')).toHaveCount(296);
    await expect(page.locator('#class-map-after tbody a').first()).toBeVisible();
    await noSidewaysScroll(page);
    await page.goto(`${baseURL}/councils/burnley/`);
    const bars = page.locator('#budget > [data-service-bars]');
    await expect(bars.locator('svg')).toBeVisible();
    expect(await bars.locator('[data-ek-row]').count()).toBeGreaterThan(3);
    await noSidewaysScroll(page);
  } finally {
    await context.close();
  }
});
