import {test, expect} from '@playwright/test';

for (const slug of ['burnley', 'birmingham', 'coventry', 'city-of-london', 'isles-of-scilly']) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${slug} sourced dossier in ${theme}`, async ({page}, testInfo) => {
      await page.emulateMedia({colorScheme: theme});
      await page.goto(`/councils/${slug}/`);
      await page.evaluate(() => document.fonts.ready);
      const first = page.locator('[data-summary-tile]').first();
      await expect(first).toHaveAttribute('data-summary-tile', 'council-tax');
      await expect(first.locator('[data-citation-format]')).toHaveAttribute('data-citation-format', 'full');
      if (testInfo.project.name === 'mobile') {
        const box = await first.locator('[data-figure]').boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(812);
      }
      await page.screenshot({path: `output/playwright/dossier/${slug}-${testInfo.project.name}-${theme}-summary.png`});
      await expect(page.locator('[data-summary-tile="budget"]')).toHaveCount(slug === 'coventry' ? 0 : 1);
      if (slug !== 'coventry') {
        const value = page.locator('[data-summary-tile="budget"] [data-figure]');
        expect(await value.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      }
      await expect(page.locator('#services')).toBeAttached();
      const special = ['city-of-london', 'isles-of-scilly'].includes(slug);
      await expect(page.locator('[data-council-functions]')).toHaveCount(special ? 0 : 1);
      if (!special) {
        await expect(page.locator('[data-services-drawer]')).not.toHaveAttribute('open');
        await page.locator('[data-services-drawer] > summary').click();
        await expect(page.locator('#services tbody tr')).toHaveCount(6);
      }
      await page.locator('#services').scrollIntoViewIfNeeded();
      await expect(page.locator('#services [data-council-service="councilTax"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
      await page.screenshot({path: `output/playwright/dossier/${slug}-${testInfo.project.name}-${theme}.png`});
    });
  }
}

test('services and sources work without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, baseURL});
  const page = await context.newPage();
  await page.goto('/councils/burnley/');
  await page.locator('[data-services-drawer] > summary').click();
  await expect(page.getByRole('cell', {name: 'Lancashire County Council', exact: true}).first()).toBeVisible();
  await expect(page.locator('#services [data-council-service="bins"]')).toBeVisible();
  await context.close();
});
