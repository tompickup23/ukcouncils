import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

test('name lookup supports keyboard selection and empty results without navigation', async ({page}) => {
  await page.goto('/');
  const input = page.getByLabel('Find your council by name');
  await input.fill('BURNLEY');
  await expect(page.locator('[data-finder-status]')).toContainText('1 matching councils');
  await input.press('Tab');
  await expect(page.locator('#council-name-results a:visible')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/councils\/burnley\/#council-tax$/);
  await page.goto('/');
  await input.fill('<script>');
  await expect(page.locator('[data-finder-status]')).toContainText('No matching council');
  expect(new URL(page.url()).search).toBe('');
});

test('band links restore, update comparison links and respond to browser history', async ({page}) => {
  await page.goto('/councils/burnley/#band-A');
  await expect(page.locator('[data-band-panel="A"]')).toBeVisible();
  await page.locator('[data-band-label="H"]').click();
  await expect(page).toHaveURL(/#band-H$/);
  await expect(page.locator('[data-council-compare]')).toHaveAttribute('href', /band=H/);
  await page.goBack();
  await expect(page.locator('[data-band-panel="A"]')).toBeVisible();
  await expect(page.locator('[data-council-compare]')).toHaveAttribute('href', /band=A/);
});

test('comparison restores its source values, swaps and restores history', async ({page}) => {
  await page.goto('/compare/?a=burnley&b=pendle&band=D&year=2026-27');
  await expect(page.locator('[data-comparison-results]')).toBeVisible();
  await expect(page.locator('[data-result-side="a"]')).toContainText('£2,549.42');
  await expect(page.locator('[data-result-side="a"]')).toContainText('MHCLG');
  const original = await page.locator('[data-result-difference]').textContent();
  await page.getByRole('button', {name: 'Swap councils'}).click();
  await expect(page.locator('[data-result-side="a"] h3')).toHaveText('Pendle');
  await page.goBack();
  await expect(page.locator('[data-result-difference]')).toHaveText(original!);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ukcouncils.co.uk/compare/');
});

test('pickers restrict the second council and support filtered selection', async ({page}) => {
  await page.goto('/compare/');
  await page.getByLabel('Filter first council names').fill('burnley');
  await page.getByLabel('First council', {exact:true}).selectOption('burnley');
  await expect(page.locator('#council-b option[value="manchester"]')).toHaveCount(0);
  await expect(page.locator('#council-b option[value="burnley"]')).toHaveCount(0);
  await page.getByLabel('Filter second council names').fill('pendle');
  await page.getByLabel('Second council', {exact:true}).selectOption('pendle');
  await page.getByLabel('Band', {exact:true}).selectOption('A');
  await page.getByRole('button', {name: 'Compare', exact:true}).click();
  await expect(page.locator('[data-result-side="a"]')).toContainText('£1,699.61');
  await expect(page.locator('[data-comparison-link]')).toHaveAttribute('href', /band=A/);
  await page.reload();
  await expect(page.locator('[data-result-side="a"]')).toContainText('£1,699.61');
});

for (const query of ['a=burnley&b=manchester', 'a=burnley&b=burnley', 'a=unknown&b=pendle', 'a=burnley&b=pendle&year=2030-31', 'a=burnley&b=pendle&band=Z']) {
  test(`invalid comparison stays empty: ${query}`, async ({page}) => {
    await page.goto(`/compare/?${query}`);
    await expect(page.locator('[data-comparison-results]')).toBeHidden();
    await expect(page.locator('[data-comparison-status]')).not.toHaveText('Comparison ready.');
  });
}

test('regional table keeps a selected band, filters, and only sorts one class', async ({page}) => {
  await page.goto('/council-tax/north-west/');
  const table = page.locator('[data-tax-table]');
  await expect(table.locator('[data-table-sort] option[value="high"]')).toHaveAttribute('disabled', '');
  await table.locator('[data-table-class]').selectOption('SD');
  await expect(table.locator('[data-table-sort] option[value="high"]')).not.toHaveAttribute('disabled');
  await table.locator('[data-table-sort]').selectOption('high');
  await table.locator('[data-table-filter]').fill('burnley');
  await table.locator('[data-table-band]').selectOption('A');
  await expect(table.locator('tbody tr:visible')).toHaveCount(1);
  await expect(table.locator('tbody tr:visible')).toContainText('£1,699.61');
  await table.locator('[data-table-class]').selectOption('');
  await expect(table.locator('[data-table-sort]')).toHaveValue('name');
  await table.locator('[data-table-filter]').fill('no council matches');
  await expect(table.locator('[data-table-status]')).toContainText('No matching councils');
  await page.getByText('View the full eight-band table', {exact:true}).click();
  await expect(page.locator('details table thead th')).toHaveCount(9);
});

test('metadata separates publisher from the council and omits invented sitemap dates', async ({page,request}) => {
  await page.goto('/councils/burnley/');
  const nodes = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(element => JSON.parse(element.textContent!)));
  expect(nodes.find(node => node['@type'] === 'WebPage').about.identifier).toBe('E07000117');
  expect(nodes.find(node => node['@type'] === 'Organization').name).toBe('UK Councils');
  expect(nodes.some(node => node['@type'] === 'GovernmentOrganization' && node.url?.includes('ukcouncils'))).toBe(false);
  await expect(page.locator('a[href*="ukfoodhygiene"]')).toHaveCount(0);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('<lastmod>');
  expect(sitemap).toContain('/compare/</loc>');
  expect(sitemap).not.toContain('?a=');
});

test('postcode outage gives a recoverable message', async ({page}) => {
  await page.route('https://api.postcodes.io/**', route => route.abort());
  await page.goto('/your-area/');
  await page.locator('#postcode-area').fill('BB11 1DU');
  await page.getByRole('button', {name:'Find',exact:true}).click();
  await expect(page.locator('[data-door-status]')).toContainText('did not answer');
  expect(new URL(page.url()).search).toBe('');
});

test('no-JavaScript fallback never sends a postcode through the form', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL + '/your-area/');
  await page.locator('#postcode-area').fill('BB11 1DU');
  await expect(page.getByRole('button', {name:'Find',exact:true})).toBeDisabled();
  await page.locator('#postcode-area').press('Enter');
  expect(new URL(page.url()).search).toBe('');
  await context.close();
});
