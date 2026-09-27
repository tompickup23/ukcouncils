import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Adapted from AI DOGE's audit, scoped to the changed journeys and both themes.
test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});
for (const theme of ['light', 'dark'] as const) {
  for (const path of ['/', '/councils/burnley/', '/council-tax/north-west/', '/compare/?a=burnley&b=pendle&band=D&year=2026-27']) {
    test(`${theme}: ${path} is accessible and fits the viewport`, async ({page}) => {
      await page.emulateMedia({colorScheme: theme});
      await page.goto(path);
      if (path.includes('compare')) await expect(page.locator('[data-comparison-results]')).toBeVisible();
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      if (theme === 'light' && path === '/' && test.info().project.name === 'mobile') await page.screenshot({path: '/tmp/ukcouncils-phase-two-home.png'});
      if (path === '/councils/burnley/') await page.screenshot({path: `/tmp/ukcouncils-phase-two-${test.info().project.name}-${theme}.png`});
      expect(result.violations.map(v => ({id:v.id, nodes:v.nodes.map(n => n.target)}))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
    });
  }
}

test('large text leaves the controls and figures usable', async ({page}) => {
  await page.goto('/councils/windsor-and-maidenhead/');
  await page.addStyleTag({content:'html { font-size: 200%; }'});
  await page.locator('[data-band-label="H"]').click();
  await expect(page.locator('[data-band-panel="H"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
});
