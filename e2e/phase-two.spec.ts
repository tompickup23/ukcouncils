import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route=>route.abort());
  await page.route('https://cloudflareinsights.com/**', route=>route.abort());
});
for (const theme of ['light','dark'] as const) {
  test(`search is lazy, keyboard accessible and finds councils in ${theme}`, async ({page}) => {
    const requests:string[] = []; const violations:string[] = [];
    page.on('request', request=>requests.push(request.url()));
    page.on('console', msg=>{if(msg.text().includes('Content Security Policy')) violations.push(msg.text());});
    await page.emulateMedia({colorScheme:theme});
    await page.goto('/');
    expect(requests.filter(url=>url.includes('/pagefind/'))).toEqual([]);
    const trigger = page.locator('[data-search-open]'); await trigger.focus(); await page.keyboard.press('Enter');
    const input = page.getByLabel('Council, region or topic'); await expect(input).toBeFocused();
    await input.fill('Burnley');
    await expect(page.locator('[data-search-results] a[href="/councils/burnley/"]')).toBeVisible();
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
    await page.keyboard.press('/'); await expect(input).toBeFocused();
    await input.fill('zxqvnomatchingplace'); await expect(page.locator('[data-search-status]')).toContainText('No matching pages');
    expect(violations).toEqual([]);
  });
}
test('search index failures show a browse fallback and retry succeeds', async ({page}) => {
  let blocked = true;
  await page.route('**/pagefind/*.pf_*', route=>blocked?route.abort():route.continue());
  await page.goto('/'); await page.locator('[data-search-open]').click();
  await page.getByLabel('Council, region or topic').fill('Burnley');
  await expect(page.locator('[data-search-retry]')).toBeVisible({timeout:15000});
  await expect(page.getByRole('dialog').getByRole('link',{name:'Browse all councils',exact:true})).toBeVisible();
  blocked = false; await page.locator('[data-search-retry]').click();
  await expect(page.locator('[data-search-results] a[href="/councils/burnley/"]')).toBeVisible();
});
test('council share fallback strips unrelated parameters and follows the selected band', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('denied');}}});
  });
  await page.goto('/councils/burnley/?postcode=BB11#band-H');
  await page.getByRole('button',{name:'Share this view'}).click();
  await expect(page.getByLabel('Link to this view')).toHaveValue('https://ukcouncils.co.uk/councils/burnley/#band-H');
  await expect(page.getByLabel('Link to this view')).toBeFocused();
  await page.locator('[data-band-label="A"]').click();
  await page.getByRole('button',{name:'Share this view'}).click();
  await expect(page.getByLabel('Link to this view')).toHaveValue(/#band-A$/);
});
test('comparison sharing copies validated state and cancellation stays distinct', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text:string)=>{document.body.dataset.copied=text;}}});
  });
  await page.goto('/compare/?a=burnley&b=pendle&band=A&year=2024-25&postcode=BB11');
  await page.getByRole('button',{name:'Share this view'}).click();
  await expect(page.locator('[data-share-status]')).toHaveText('Link copied.');
  await expect(page.locator('body')).toHaveAttribute('data-copied','https://ukcouncils.co.uk/compare/?a=burnley&b=pendle&band=A&year=2024-25');
  await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancelled','AbortError');}}));
  await page.getByRole('button',{name:'Share this view'}).click();
  await expect(page.locator('[data-share-status]')).toHaveText('Sharing cancelled.');
});
test('CSV downloads reconcile to the selected council and filtered table', async ({page}) => {
  await page.goto('/councils/burnley/#band-A');
  const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download CSV',exact:true}).click();
  const file = await download; const csv = await readFile((await file.path())!,'utf8');
  expect(csv).toContain('"1699.61","169.96"'); expect(csv).toContain('"2026-27","A"'); expect(csv).toContain('Open Government Licence');
  await page.goto('/council-tax/north-west/');
  await page.locator('[data-table-filter]').fill('Burnley'); await page.locator('[data-table-band]').selectOption('H');
  const filtered = page.waitForEvent('download'); await page.locator('[data-table-export]').click();
  const filteredCsv = await readFile((await (await filtered).path())!,'utf8');
  expect(filteredCsv.split('\r\n')).toHaveLength(3); expect(filteredCsv).toContain('"5098.84"'); expect(filteredCsv).not.toContain('"Pendle"');
  await page.locator('[data-table-filter]').fill('zxqv'); await expect(page.locator('[data-table-export]')).toBeDisabled();
});
test('comparison CSV preserves older year and order after swapping', async ({page}) => {
  await page.goto('/compare/?a=burnley&b=pendle&band=B&year=2024-25');
  await page.getByRole('button',{name:'Swap councils'}).click();
  const download = page.waitForEvent('download'); await page.getByRole('button',{name:'Download CSV',exact:true}).click();
  const csv = await readFile((await (await download).path())!,'utf8');
  const records = csv.split('\r\n'); expect(records).toHaveLength(4);
  expect(records[1]).toContain('"Pendle"'); expect(records[2]).toContain('"Burnley"');
  expect(records[1]).toContain('"2024-25","B"');
  const displayed = await page.locator('[data-result-side="a"] [data-result-annual]').textContent();
  expect(records[1]).toContain(`"${displayed!.replace(/[£,]/g,'')}"`);
});
test('maps and print preserve the selected answer and source without interactive controls', async ({page}) => {
  await page.goto('/councils/burnley/#band-H');
  await expect(page.locator('[data-boundary-map]')).toHaveAttribute('data-boundary-map','E07000117');
  const bounds = await page.locator('[data-map-focal]').evaluate(el=>{const b=(el as SVGGraphicsElement).getBBox();return {width:b.width,height:b.height};});
  expect(bounds.width).toBeGreaterThan(50); expect(bounds.height).toBeGreaterThan(50); expect(bounds.width).toBeLessThan(299);
  await page.emulateMedia({media:'print'});
  await expect(page.locator('[data-band-panel="H"]')).toBeVisible(); await expect(page.locator('[data-band-panel="D"]')).toBeHidden();
  await expect(page.locator('[data-band-panel="H"] .source-line').first()).toBeVisible();
  await expect(page.locator('.site-header-bar')).toBeHidden(); await expect(page.locator('.view-actions')).toBeHidden();
  if (test.info().project.name==='desktop') await page.pdf({path:'/tmp/ukcouncils-phase-two-print.pdf',format:'A4'});
});
test('comparison print retains the selected year and table print expands scrolling', async ({page}) => {
  await page.goto('/compare/?a=burnley&b=pendle&band=A&year=2024-25');
  await expect(page.locator('[data-comparison-results]')).toBeVisible(); await page.emulateMedia({media:'print'});
  await expect(page.locator('[data-comparison-heading]')).toHaveText('Band A, 2024/25');
  await expect(page.locator('[data-comparison-form]')).toBeHidden();
  await page.emulateMedia({media:'screen'});
  await page.goto('/council-tax/north-west/'); await page.locator('[data-table-filter]').fill('Burnley');
  await page.emulateMedia({media:'print'});
  await expect(page.locator('[data-tax-table] tbody tr:visible')).toHaveCount(1);
  expect(await page.locator('[data-tax-table] .table-wrap').evaluate(el=>getComputedStyle(el).maxHeight)).toBe('none');
});
