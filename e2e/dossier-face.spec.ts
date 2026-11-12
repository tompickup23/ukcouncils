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
  test(`${theme}: homepage has chart table twins and working council journeys`, async ({page}) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/');
    await expect(page.locator('.task-thumb')).toHaveCount(3);
    await page.getByText('Read the chart as a table', {exact: true}).click();
    await expect(page.locator('#home-history').locator('..').locator('table')).toBeVisible();
    for (const name of ['Who runs the council', 'Council budgets', 'School holidays']) {
      await expect(page.getByRole('link', {name, exact: false})).toHaveAttribute('href', '/councils/');
    }
  });
}
