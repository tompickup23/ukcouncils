import {expect, test} from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: a short citation opens its complete bibliography entry`, async ({page}) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/councils/burnley/');
    await expect(page.locator('[data-band-panel="D"] [data-citation-format]').first()).toHaveAttribute('data-citation-format', 'full');
    await page.locator('details:not([data-sources-drawer])').evaluateAll(nodes => nodes.forEach(node => (node as HTMLDetailsElement).open = true));
    const short = page.locator('[data-citation-format="short"]:visible a').first();
    const href = await short.getAttribute('href');
    expect(href).toMatch(/^#citation-/);
    await short.click();
    const entry = page.locator(href!);
    await expect(entry).toBeVisible();
    await expect(page.locator('[data-sources-drawer]')).toHaveAttribute('open', '');
    for (const field of ['publisher', 'title', 'locator', 'date', 'url']) {
      await expect(entry.locator(`[data-ek-source-field="${field}"]`)).not.toBeEmpty();
    }
  });
  test(`${theme}: the page opens the source drawer without relying on the browser`, async ({page}) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/councils/burnley/');
    await page.locator('details:not([data-sources-drawer])').evaluateAll(nodes => nodes.forEach(node => (node as HTMLDetailsElement).open = true));
    // Cancel the link's own navigation, as a browser that does not open a closed details would leave it.
    await page.evaluate(() => document.addEventListener('click', event => event.preventDefault(), true));
    const drawer = page.locator('[data-sources-drawer]');
    await expect(drawer).not.toHaveAttribute('open', '');
    const short = page.locator('[data-citation-format="short"]:visible a').first();
    const href = await short.getAttribute('href');
    await short.click();
    await expect(drawer).toHaveAttribute('open', '');
    await expect(page.locator(href!)).toBeInViewport();
  });
  test(`${theme}: homepage has a chart table twin and no two cards with one destination`, async ({page}) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/');
    await expect(page.locator('.task-thumb')).toHaveCount(3);
    await page.getByText('Read the chart as a table', {exact: true}).click();
    await expect(page.locator('#home-history').locator('..').locator('table')).toBeVisible();
    const hrefs = await page.locator('.task-nav a.card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
}
