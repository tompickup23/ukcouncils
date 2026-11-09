import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { efs, authorities, pages, statements, multipleFigures } from "../src/lib/efs";
import { efsRoles, efsYear } from "../src/lib/efs-presentation";

const route = "/exceptional-financial-support/";
const entries = statements.flatMap(statement => statement.figures.map(figure => ({ statement, figure })));

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", route => route.abort());
  await page.route("https://cloudflareinsights.com/**", route => route.abort());
});

test("EFS renders every figure, marking and source in both views without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("https://static.cloudflareinsights.com/**", route => route.abort());
  await page.goto(route);
  const expected = entries.map(({ statement, figure }) => ({
    amount: figure.amountGbpM,
    year: figure.supportYear,
    role: figure.role,
    label: efsRoles[figure.role],
    marking: figure.marking ? efsYear(figure.marking) : null,
    note: figure.note ? efsYear(figure.note) : null,
    url: pages[statement.page].url,
  }));
  for (const view of ["#by-year", "#by-council"]) {
    const actual = await page.locator(`${view} [data-efs-figure]`).evaluateAll(nodes => nodes.map(node => ({
      amount: node.getAttribute("data-amount"), year: node.getAttribute("data-year"), role: node.getAttribute("data-role"),
      text: node.textContent ?? "", url: node.querySelector(".source-line a")?.getAttribute("href"),
    })));
    expect(actual).toHaveLength(216);
    // Compare the full multiset, including duplicates, rather than only finding each value once.
    const key = (entry: { amount: string | null; year: string | null; role: string | null; url: string | null | undefined }) => JSON.stringify([entry.amount, entry.year, entry.role, entry.url]);
    expect(actual.map(key).sort()).toEqual(expected.map(key).sort());
    for (const entry of expected) {
      const matches = actual.filter(item => key(item) === key(entry));
      expect(matches.some(item => item.text.includes(entry.label) && (entry.amount === null || item.text.includes(`£${entry.amount}m`)) && (!entry.marking || item.text.includes(entry.marking)) && (!entry.note || item.text.includes(entry.note)))).toBe(true);
    }
  }
  await expect(page.locator("[data-efs-statement]")).toHaveCount(126);
  await expect(page.locator("[data-efs-authority]")).toHaveCount(57);
  const names = await page.locator(".authority-index a").allTextContents();
  expect(names).toEqual(Object.values(authorities).map(authority => authority.name).sort((a, b) => a.localeCompare(b, "en-GB")));
  const pageYears = await page.locator(".year-section").evaluateAll(nodes => nodes.map(node => node.id.replace("year-", "")));
  expect(pageYears).toEqual(Object.keys(pages).sort().reverse());
  for (const [year, source] of Object.entries(pages)) {
    const section = page.locator(`#year-${year}`);
    await expect(section.locator('table[data-efs-table="main"] tbody tr')).toHaveCount(statements.filter(statement => statement.page === year && statement.table === "main").length);
    if (source.proseCount) await expect(section.locator("q")).toHaveText(source.proseCount);
    else await expect(section).toContainText("The page prints no count.");
  }
  await expect(page.locator("[data-efs-multiple]")).toHaveCount(11);
  for (const difference of multipleFigures) {
    await expect(page.locator(`[data-efs-authority="${difference.authority}"]`)).toContainText(efsYear(difference.relation));
  }
  for (const [key, authority] of Object.entries(authorities)) {
    const heading = page.locator(`[id="name-${key}"]`);
    if (authority.slug) await expect(heading.locator("a")).toHaveAttribute("href", `/councils/${authority.slug}/`);
    else await expect(heading.locator("a")).toHaveCount(0);
  }
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /^.{1,160}$/);
  await expect(page.locator('main a[href*="assets.publishing.service.gov.uk"]')).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/\u2013|\u2014| - /);
  expect(efs.statements).toHaveLength(126);
  await context.close();
});

for (const theme of ["light", "dark"] as const) {
  test(`EFS is readable in ${theme} with working anchor links and no overflow`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    mkdirSync("output/playwright", { recursive: true });
    const imagePath = `output/playwright/efs-${testInfo.project.name}-${theme}`;
    await page.screenshot({ path: `${imagePath}-overview.png` });
    await page.locator('.page-contents a[href="#by-year"]').click();
    await expect(page).toHaveURL(/#by-year$/);
    await page.screenshot({ path: `${imagePath}-year.png` });
    await page.locator('.page-contents a[href="#by-council"]').click();
    await expect(page).toHaveURL(/#by-council$/);
    await page.locator('.authority-index a[href="#authority-E08000025"]').click();
    await expect(page).toHaveURL(/#authority-E08000025$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
  });
}
