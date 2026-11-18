import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (const [slug, count] of Object.entries({barnet: 1, birmingham: 2, croydon: 3, northumberland: 1, nottingham: 1, slough: 1, thurrock: 1, woking: 1})) {
  test(`${slug} shows each historical document and its source at this viewport`, async ({page}) => {
    await page.goto(`/councils/${slug}/#financial-notices`);
    const section = page.locator('#financial-notices');
    await expect(section.getByRole('heading', {name: 'Section 114 documents'})).toBeVisible();
    await expect(section.locator('[data-notice-id]')).toHaveCount(count);
    await expect(section.getByText('Historical document record.', {exact: true})).toHaveCount(count);
    await expect(section.getByRole('link')).toHaveCount(count);
    await expect(section).toContainText('not exhaustive');
    await expect(page.locator('[data-dossier-absence="notices"]')).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
}

test('a profile without an entry keeps the non-exhaustive explanation', async ({page}) => {
  await page.goto('/councils/burnley/#dossier-coverage');
  await expect(page.locator('#financial-notices')).toHaveCount(0);
  const reason = page.locator('[data-dossier-absence="notices"]');
  await expect(reason).toBeVisible();
  await expect(reason).toContainText('No entry is not a statement that no notice was issued.');
});
