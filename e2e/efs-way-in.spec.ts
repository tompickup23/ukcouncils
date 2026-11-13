import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { authorities, statements } from '../src/lib/efs';
import { efsYear } from '../src/lib/efs-presentation';

const route = '/exceptional-financial-support/';
const birmingham = '[data-efs-authority="E08000025"]';
const drawer = `details:has(> ${birmingham})`;

test.beforeEach(async ({ page }) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

test('all authority drawers start closed with their exact source page years', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('[data-efs-authority-drawer]')).toHaveCount(Object.keys(authorities).length);
  await expect(page.locator('[data-efs-authority-drawer][open]')).toHaveCount(0);
  for (const [key, authority] of Object.entries(authorities)) {
    const years = [...new Set(statements.filter(statement => statement.authority === key).map(statement => statement.page))].sort().reverse();
    const summary = page.locator(`details:has(> [data-efs-authority="${key}"]) > summary`);
    await expect(summary).toHaveText(`${authority.name}Listed on the ${years.map(efsYear).join(', ')} ${years.length === 1 ? 'page' : 'pages'}`);
  }
  await expect(page.locator('#by-year details')).toHaveCount(0);
  await expect(page.locator('#by-year table')).toHaveCount(13);
});

test('finder reuses name, county and exact region matching and explains an absent council', async ({ page }) => {
  await page.goto(route);
  const query = page.getByLabel('Find my council', { exact: true });
  const visible = page.locator('#efs-results li:not([hidden])');
  await query.fill('ley burn');
  await expect(visible).toHaveCount(1);
  await expect(visible).toContainText('Not listed on this page.');
  await expect(visible.locator('a')).toHaveAttribute('href', '/councils/burnley/');
  await query.fill('Lancashire');
  await expect(page.locator('#efs-status')).toContainText('12 matching authorities');
  await expect(visible).toHaveCount(8);
  await query.fill('North West');
  expect(await visible.evaluateAll(rows => rows.every(row => row.getAttribute('data-region') === 'North West'))).toBe(true);
  await query.fill('Worcestershire');
  await expect(visible.first().locator('a')).toHaveAttribute('href', '#authority-E10000034');
  await query.fill('Kent Police');
  await expect(visible.locator('a')).toHaveAttribute('href', '#authority-other:kent-police-and-crime-commissioner');
  await query.fill('zzzzzz');
  await expect(page.locator('#efs-status')).toContainText('No matching authority.');
  await expect(page.locator('#efs-results')).toBeHidden();
});

test('choosing a finder result by keyboard opens and focuses its council', async ({ page }) => {
  await page.goto(route);
  await page.getByLabel('Find my council', { exact: true }).fill('Birmingham');
  await page.keyboard.press('Tab');
  await expect(page.locator('#efs-results li:not([hidden]) a')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(`${birmingham} h3`)).toBeFocused();
  await expect(page.locator(`${birmingham} h3`)).toBeInViewport();
});

test('profile link opens the closed authority and focuses its original heading', async ({ page }) => {
  await page.goto('/councils/birmingham/');
  await page.locator('[data-efs-drawer] > summary').click();
  await page.locator('a[href="/exceptional-financial-support/#name-E08000025"]').click();
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(`${birmingham} h3`)).toBeFocused();
});

test('load, hash change and repeated same hash clicks open authority anchors', async ({ page }) => {
  await page.goto(`${route}#authority-E08000025-2026-27`);
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await page.goto(route);
  await page.evaluate(() => { location.hash = '#name-E08000025'; });
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await page.locator('.authority-index a[href="#authority-E08000025"]').click();
  await page.locator(`${drawer} > summary`).click();
  await expect(page.locator(drawer)).not.toHaveAttribute('open', '');
  await page.locator('.authority-index a[href="#authority-E08000025"]').click();
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(`${birmingham} h3`)).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#name-E08000025$/);
  await page.locator(`${drawer} > summary`).click();
  await page.goForward();
  await expect(page).toHaveURL(/#authority-E08000025$/);
  await expect(page.locator(drawer)).toHaveAttribute('open', '');
  await expect(page.locator(`${birmingham} h3`)).toBeFocused();
});

test('scripts off hides the finder and native details expose every figure', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(route);
  await expect(page.locator('[data-efs-finder]')).toBeHidden();
  await expect(page.locator(drawer)).not.toHaveAttribute('open', '');
  await page.locator(`${drawer} > summary`).click();
  await expect(page.locator(`${birmingham} h3`)).toBeVisible();
  await expect(page.locator(`${birmingham} [data-efs-figure]`).first()).toBeVisible();
  await expect(page.locator('#by-council [data-efs-figure]')).toHaveCount(216);
  await context.close();
});

for (const theme of ['light', 'dark'] as const) {
  test(`finder and open council are accessible in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(route);
    await page.getByLabel('Find my council', { exact: true }).fill('Birmingham');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
    await page.locator('#efs-results li:not([hidden]) a').click();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  });
}
