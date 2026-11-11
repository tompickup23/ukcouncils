import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const name of ['Burnley', 'Birmingham', 'Camden', 'Barnet', 'Manchester', 'Leeds', 'Cornwall', 'York', 'Wirral', 'Dorset']) {
  test(`${name} is the first council link and is reachable by keyboard`, async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-search-open]').focus();
    await page.keyboard.press('Enter');
    await page.getByLabel('Council, region or topic').fill(name);
    const first = page.locator('[data-search-council-results] a').first();
    await expect(first).toHaveAttribute('href', `/councils/${name.toLowerCase()}/`);
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
    const section = page.locator('[data-search-councils]');
    await expect(section).toBeVisible();
    expect(await section.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/councils/${name.toLowerCase()}/$`));
  });
}

test('council links require two letters, match all words and stop at five', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-search-open]').click();
  const input = page.getByLabel('Council, region or topic');
  await input.fill('b');
  await expect(page.locator('[data-search-status]')).toContainText('matching pages');
  await expect(page.locator('[data-search-councils]')).toBeHidden();
  await input.fill('ley burn');
  await expect(page.locator('[data-search-council-results] a')).toHaveAttribute('href', '/councils/burnley/');
  await input.fill('shire');
  await expect(page.locator('[data-search-council-results] a')).toHaveCount(5);
  await input.fill('zxqvnomatchingplace');
  await expect(page.locator('[data-search-status]')).toContainText('No matching pages');
  await expect(page.locator('[data-search-councils]')).toBeHidden();
});

test('full text results retain their links and excerpts with a type label', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').fill('Burnley');
  const hit = page.locator('[data-search-results] li').filter({ has: page.locator('a[href="/councils/burnley/"]') });
  await expect(hit.locator('[data-search-type]')).toHaveText('Council');
  await expect(hit.locator('p').last()).not.toBeEmpty();
});

test('the status line announces the council list as well as the pages', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').fill('Burnley');
  await expect(page.locator('[data-search-status]')).toHaveText(/^1 matching council and \d+ matching pages?\.$/);
  await page.getByLabel('Council, region or topic').fill('shire');
  await expect(page.locator('[data-search-status]')).toContainText('the first five listed');
});

test('Search links to the council directory with scripts off', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/');
    const search = page.locator('[data-search-open]');
    await expect(search).toHaveAttribute('href', '/councils/');
    await search.click();
    await expect(page).toHaveURL(/\/councils\/$/);
  } finally { await context.close(); }
});

test('the 404 finder finds Burnley', async ({ page }) => {
  const response = await page.goto('/missing-council-search-page/');
  expect(response?.status()).toBe(404);
  await page.getByLabel('Find your council by name').fill('Burnley');
  const link = page.locator('[data-council-finder] li:visible a');
  await expect(link).toHaveAttribute('href', '/councils/burnley/#council-tax');
  await link.click();
  await expect(page).toHaveURL(/\/councils\/burnley\/#council-tax$/);
});
