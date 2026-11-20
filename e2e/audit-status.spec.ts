import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const [slug, count, starred] of [['gloucester', 3, false], ['middlesbrough', 1, false], ['basildon', 1, true]] as const) {
  test(`${slug} shows each pinned backstop line and its source at this viewport`, async ({page}) => {
    await page.goto(`/councils/${slug}/#audit-status`);
    const section = page.locator('#audit-status');
    await expect(section.getByRole('heading', {name: 'External audit'})).toBeVisible();
    await expect(section.locator('[data-audit-entry]')).toHaveCount(count);
    await expect(section.locator('[data-audit-answer]')).toHaveCount(count * 4);
    await expect(section.getByRole('link')).toHaveCount(count);
    await expect(section.locator('[data-audit-footnote]')).toHaveCount(starred ? 1 : 0);
    await expect(section).toContainText('is not an audit opinion');
    await expect(section).toContainText('as printed by the publisher');
    await expect(page.locator('[data-dossier-absence="audit"]')).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
}

for (const [slug, text] of [
  ['burnley', 'This council has no row on those lists.'],
  ['merton', 'has a row for the council\'s pension fund only'],
] as const) {
  test(`${slug} keeps its own audit absence reason and no audit lines`, async ({page}) => {
    await page.goto(`/councils/${slug}/#dossier-coverage`);
    await expect(page.locator('#audit-status')).toHaveCount(0);
    const reason = page.locator('[data-dossier-absence="audit"]');
    await expect(reason).toBeVisible();
    await expect(reason).toContainText(text);
    await expect(reason).toContainText('not a statement about');
  });
}

test('North Yorkshire shows its printed row and the continuing body evidence', async ({page}) => {
  await page.goto('/councils/north-yorkshire/#audit-status');
  const section = page.locator('#audit-status');
  await expect(section.locator('[data-audit-entry]')).toHaveCount(1);
  await expect(section.locator('[data-audit-answer]')).toHaveCount(4);
  await expect(section.locator('[data-audit-line]')).toContainText('Name as printed: North Yorkshire County Council');
  await expect(section.locator('[data-audit-identity]')).toHaveText("This row is printed under the council's name before 1 April 2023.");
  await expect(section.getByRole('link', {name: 'UK legislation, The North Yorkshire (Structural Changes) Order 2022'})).toHaveAttribute('href', 'https://www.legislation.gov.uk/uksi/2022/328/made');
  await expect(section).toContainText('SI 2022/328, articles 2 and 3');
  await expect(page.locator('[data-dossier-absence="audit"]')).toHaveCount(0);
});
