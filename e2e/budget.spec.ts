import {test, expect} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {councilPages} from '../src/lib/paths';
import {budget} from '../src/lib/budget';

function budgetProseWords(section: Element): number {
  const copy = section.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('table, .source-line, style, script').forEach(node => node.remove());
  const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '');
  return parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
}

const pages = councilPages();
test.beforeEach(async ({page}) => {
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
  await page.route('https://cloudflareinsights.com/**', route => route.abort());
});

for (let offset = 0; offset < pages.length; offset += 20) {
  test(`budget layout and sources for profiles ${offset + 1} to ${Math.min(offset + 20, pages.length)}`, async ({page}) => {
    for (const {council} of pages.slice(offset, offset + 20)) {
      await page.goto(`/councils/${council.slug}/`);
      const section = page.locator('#budget');
      const available = budget.councils[council.gss].status === 'available';
      await expect(section).toHaveCount(Number(available));
      if (available) {
        expect(await section.evaluate(budgetProseWords), council.slug).toBeLessThan(250);
        await section.locator('details').evaluateAll(nodes => nodes.forEach(node => node.setAttribute('open', '')));
        const missing = await section.locator('table').evaluateAll(tables => tables.filter(table => {
          const wrap = table.closest('.table-wrap');
          const next = wrap?.nextElementSibling;
          return !next || !(next.classList.contains('source-line') || next.classList.contains('caveat'));
        }).length);
        expect(missing, council.slug).toBe(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth), council.slug).toBeLessThanOrEqual(2);
      expect(await page.locator('[id]').evaluateAll(nodes => nodes.length-new Set(nodes.map(node => node.id)).size), council.slug).toBe(0);
    }
  });
}

for (const theme of ['light', 'dark'] as const) {
  for (const slug of ['burnley', 'blackpool', 'coventry']) {
    test(`${slug} budget screenshots in ${theme}`, async ({page}, testInfo) => {
      await page.emulateMedia({colorScheme: theme});
      await page.goto(`/councils/${slug}/`);
      await page.evaluate(theme => {localStorage.setItem('ukcouncils-theme', theme); document.documentElement.dataset.theme = theme;}, theme);
      await page.evaluate(() => document.fonts.ready);
      const folder = 'output/playwright/c3';
      mkdirSync(folder, {recursive: true});
      const prefix = `${folder}/${slug}-${testInfo.project.name}-${theme}`;
      if (slug === 'coventry') {
        await expect(page.locator('#budget')).toHaveCount(0);
        await page.locator('nav[aria-label="On this page"]').evaluate(element => element.scrollIntoView({block: 'start'}));
        await page.screenshot({path: `${prefix}-contents.png`});
      } else {
        await page.locator('#budget-heading').evaluate(element => element.scrollIntoView({block: 'start'}));
        await page.screenshot({path: `${prefix}-intro.png`});
        await expect(page.locator('[data-budget-drawer]')).not.toHaveAttribute('open');
        await page.locator('[data-budget-drawer] > summary').click();
        await expect(page.locator('#billing-budget-services')).toBeVisible();
        await page.locator('#billing-budget-services').evaluate(element => element.scrollIntoView({block: 'start'}));
        await page.screenshot({path: `${prefix}-services.png`});
        await page.locator('#budget > [data-budget-drawer] > .budget-tables .table-wrap').first().evaluate(element => {element.scrollTop = element.scrollHeight;});
        await page.screenshot({path: `${prefix}-service-total.png`});
        await page.locator('#billing-budget-funding').evaluate(element => element.scrollIntoView({block: 'start'}));
        await page.screenshot({path: `${prefix}-funding.png`});
        await page.locator('#billing-budget-reserves').evaluate(element => element.scrollIntoView({block: 'start'}));
        await page.screenshot({path: `${prefix}-reserves.png`});
        if (slug === 'burnley') {
          await page.locator('#county-budget-heading').evaluate(element => element.scrollIntoView({block: 'start'}));
          await page.screenshot({path: `${prefix}-county.png`});
          await expect(page.locator('[data-county-budget-drawer]')).not.toHaveAttribute('open');
          await page.locator('[data-county-budget-drawer] > summary').click();
          await expect(page.locator('#county-budget-tables-services')).toBeVisible();
          await page.locator('#county-budget-tables-services').evaluate(element => element.scrollIntoView({block: 'start'}));
          await page.locator('#county-budget .table-wrap').first().evaluate(element => {element.scrollTop = element.scrollHeight;});
          await page.screenshot({path: `${prefix}-county-total.png`});
        }
      }
    });
  }
  test(`funding caveat screenshot in ${theme}`, async ({page}, testInfo) => {
    await page.emulateMedia({colorScheme: theme});
    await page.goto('/councils/runnymede/');
    await page.locator('[data-budget-drawer] > summary').click();
    await page.locator('[data-note8]').evaluate(element => element.scrollIntoView({block: 'center'}));
    mkdirSync('output/playwright/c3', {recursive: true});
    await page.screenshot({path: `output/playwright/c3/runnymede-${testInfo.project.name}-${theme}-note8.png`});
  });
}

test('budget prose stays below 250 words and the first screen retains Band D', async ({page}, testInfo) => {
  const counts: Record<string, number> = {};
  for (const slug of ['burnley', 'birmingham']) {
    await page.goto(`/councils/${slug}/`);
    if (testInfo.project.name === 'mobile') {
      // The first screen rule: Band D for the year is on the first phone screen. Since the
      // summary row (D1) it is the row's first tile, with its source and parish caveat; the
      // band answer follows directly under the row.
      const figure = page.locator('[data-profile-summary] [data-summary-tile="council-tax"] [data-figure]').first();
      const bounds = await figure.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(812);
    }
    counts[slug] = await page.locator('#budget').evaluate(budgetProseWords);
    expect(counts[slug]).toBeLessThan(250);
  }
  mkdirSync('output/playwright/c3', {recursive: true});
  writeFileSync(`output/playwright/c3/word-counts-${testInfo.project.name}.json`, JSON.stringify(counts, null, 2) + '\n');
});
