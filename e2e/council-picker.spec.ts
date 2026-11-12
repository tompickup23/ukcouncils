import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The council picker (NV1) on the budget hub and the councils index: the name
 * filter, the chips, the sort, the postcode lookup with postcodes.io answered
 * by the test, the page without script, the first screen and the short list
 * on a phone (W7), and axe
 * with the filters drawer open and closed.
 */

const PAGES = [
  { path: "/councils/", destination: "/councils/burnley/", tail: false },
] as const;

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});

async function answer(page: Page, status: number, adminDistrict?: string) {
  await page.route("https://api.postcodes.io/postcodes/**", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status === 200 ? { status, result: { codes: { admin_district: adminDistrict } } } : { status, error: "Postcode not found" }),
    }),
  );
}

/** Opens the filters drawer where it is closed (below 600 px); from 600 px the chips are already open. */
async function openFilters(page: Page) {
  const summary = page.locator("[data-picker-filters] > summary");
  if (await summary.isVisible()) await summary.click();
  await expect(page.locator('[data-chip="region"]').first()).toBeVisible();
}

const count = (page: Page) => page.locator("[data-picker-count]");
const PHONE_ROWS = 12;
const onPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 600;
/** What the count line says for a number of matches: below 600 px a longer list is cut to its first rows. */
function countText(page: Page, matches: number) {
  if (!onPhone(page) || matches <= PHONE_ROWS) return `${matches} of 296 shown`;
  return matches === 296 ? `First ${PHONE_ROWS} of 296 listed` : `${matches} of 296 match, first ${PHONE_ROWS} listed`;
}
const visibleRows = (page: Page) => page.locator("tr[data-row]:visible");

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
}

for (const { path, destination, tail } of PAGES) {
  test.describe(path, () => {
    test('"lancashire" shows its 12 districts', async ({ page }) => {
      await page.goto(path);
      await expect(count(page)).toHaveText(countText(page, 296));
      await page.locator("[data-picker-input]").fill("lancashire");
      await expect(count(page)).toHaveText("12 of 296 shown");
      await expect(visibleRows(page)).toHaveCount(12);
    });

    test("a region chip and a type chip each filter, and combine", async ({ page }) => {
      await page.goto(path);
      await openFilters(page);
      await expect(page.locator('[data-chip="region"]')).toHaveCount(10);
      await expect(page.locator('[data-chip="region"][data-value="yorkshire-and-the-humber"]')).toBeVisible();
      const region = page.locator('[data-chip="region"][data-value="north-west"]');
      const type = page.locator('[data-chip="type"][data-value="shire-district"]');

      await region.click();
      await expect(region).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-chip="region"][data-value=""]')).toHaveAttribute("aria-pressed", "false");
      const regionCount = await page.locator('tr[data-row][data-region="north-west"]').count();
      await expect(count(page)).toHaveText(countText(page, regionCount));
      expect(regionCount).toBeLessThan(296);

      await page.locator('[data-chip="region"][data-value=""]').click();
      await type.click();
      await expect(type).toHaveAttribute("aria-pressed", "true");
      const typeCount = await page.locator('tr[data-row][data-type="shire-district"]').count();
      await expect(count(page)).toHaveText(countText(page, typeCount));
      expect(typeCount).toBeLessThan(296);

      await region.click();
      const both = await page.locator('tr[data-row][data-region="north-west"][data-type="shire-district"]').count();
      expect(both).toBeLessThan(Math.min(regionCount, typeCount));
      await expect(count(page)).toHaveText(countText(page, both));
      await expect(visibleRows(page)).toHaveCount(onPhone(page) ? Math.min(both, PHONE_ROWS) : both);
      await expect(page.locator("[data-filter-count]")).toHaveText("(2 on)");
    });

    test("each sort button sets aria-sort and a second press reverses it", async ({ page }) => {
      await page.goto(path);
      const buttons = page.locator("[data-sort]:visible");
      const keys = await buttons.evaluateAll((all) => all.map((b) => (b as HTMLElement).dataset.sort!));
      expect(keys).toContain("name");
      for (const key of keys) {
        const button = page.locator(`[data-sort="${key}"]`);
        const header = page.locator(`th[data-sort-key="${key}"]`);
        if ((await header.getAttribute("aria-sort")) === "ascending") await button.click(); // already sorted: reach descending first
        else {
          await button.click();
          await expect(header).toHaveAttribute("aria-sort", "ascending");
          await button.click();
        }
        await expect(header).toHaveAttribute("aria-sort", "descending");
        await expect(page.locator("th[aria-sort]")).toHaveCount(1);
        await button.click();
        await expect(header).toHaveAttribute("aria-sort", "ascending");
        if (tail) {
          // The councils without a return stay in their own group at the end, after the heading, under every sort.
          const order = await page.locator("tr[data-row], tr[data-picker-tail]").evaluateAll((rows) =>
            rows.map((row) => (row.hasAttribute("data-picker-tail") ? "head" : row.closest("tbody")!.dataset.pickerGroup)),
          );
          expect(order.indexOf("head")).toBe(order.length - 10);
          expect(order.slice(-9)).toEqual(Array(9).fill("1"));
          expect(order.slice(0, -10).every((group) => group === "0")).toBe(true);
        }
      }
      // A to Z by name, then Z to A.
      const names = () => page.locator('tbody[data-picker-group="0"] tr[data-row] th a').allTextContents();
      await page.locator('[data-sort="name"]').click();
      if ((await page.locator('th[data-sort-key="name"]').getAttribute("aria-sort")) !== "ascending") await page.locator('[data-sort="name"]').click();
      const az = await names();
      expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b, "en-GB")));
      await page.locator('[data-sort="name"]').click();
      expect(await names()).toEqual([...az].reverse());
    });

    test("a known postcode goes to that council's destination", async ({ page }) => {
      await answer(page, 200, "E07000117");
      await page.goto(path);
      await page.locator("[data-picker-input]").fill("BB11 1DU");
      await page.locator("[data-picker-submit]").click();
      await expect(page).toHaveURL(new RegExp(`${destination.replace(/\//g, "\\/")}$`));
      expect(page.url()).not.toMatch(/BB11/i);
    });

    test("an unknown postcode says postcodes.io does not know it", async ({ page }) => {
      await answer(page, 404);
      await page.goto(path);
      await page.locator("[data-picker-input]").fill("ZZ1 1ZZ");
      await page.locator("[data-picker-input]").press("Enter");
      await expect(count(page)).toContainText("does not know that postcode");
    });

    test("a postcode outside the rows says so", async ({ page }) => {
      await answer(page, 200, "S12000036");
      await page.goto(path);
      const outside = await page.locator("[data-council-picker]").getAttribute("data-outside");
      await page.locator("[data-picker-input]").fill("EH1 1YZ");
      await page.locator("[data-picker-submit]").click();
      await expect(count(page)).toHaveText(outside!);
    });

    test("a name and the button move focus to the first row", async ({ page }) => {
      let called = false;
      await page.route("https://api.postcodes.io/**", (route) => {
        called = true;
        return route.abort();
      });
      await page.goto(path);
      await page.locator("[data-picker-input]").fill("pendle");
      await page.locator("[data-picker-submit]").click();
      await expect(page.locator("tr[data-row]:visible a").first()).toBeFocused();
      await expect(page.locator("tr[data-row]:visible a").first()).toHaveText("Pendle");
      expect(called).toBe(false);
    });

    test("without script the controls are hidden and every council is listed A to Z", async ({ browser, baseURL }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
      const page = await context.newPage();
      await page.goto(`${baseURL}${path}`);
      await expect(page.locator("[data-picker-form]")).toBeHidden();
      await expect(page.locator("[data-sort]").first()).toBeHidden();
      await expect(page.locator("[data-council-picker] tbody a")).toHaveCount(296);
      for (const group of await page.locator("tbody[data-picker-group]").all()) {
        const names = await group.locator("tr[data-row] th a").allTextContents();
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en-GB")));
      }
      await context.close();
    });

    test("on a phone the box, its button and the first match are on the first screen", async ({ browser, baseURL }) => {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const page = await context.newPage();
      await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
      await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
      await page.goto(`${baseURL}${path}`);
      for (const selector of ["[data-picker-input]", "[data-picker-submit]"]) {
        const box = (await page.locator(selector).boundingBox())!;
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(812);
        if (selector === "[data-picker-submit]") expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await page.locator("[data-picker-input]").fill("burn");
      await expect(count(page)).toContainText("of 296 shown");
      const row = (await page.locator("tr[data-row]:visible").first().boundingBox())!;
      expect(row.y).toBeGreaterThanOrEqual(0);
      expect(row.y + row.height).toBeLessThanOrEqual(812);
      await context.close();
    });

    test("on a phone the list runs in the page, twelve rows then a button for the rest", async ({ browser, baseURL }) => {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const page = await context.newPage();
      await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
      await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
      await page.goto(`${baseURL}${path}`);
      const more = page.locator("[data-picker-more]");
      const wrap = page.locator("[data-council-picker] .table-wrap");
      const noInnerScroll = () => wrap.evaluate((el) => el.scrollHeight - el.clientHeight);

      await expect(count(page)).toHaveText("First 12 of 296 listed");
      await expect(visibleRows(page)).toHaveCount(12);
      await expect(more).toHaveText("Show all 296 councils");
      expect(await noInnerScroll()).toBeLessThanOrEqual(1);

      // A short answer needs no button; a long one is cut again.
      await page.locator("[data-picker-input]").fill("lancashire");
      await expect(visibleRows(page)).toHaveCount(12);
      await expect(more).toBeHidden();
      await page.locator("[data-picker-input]").fill("");
      await expect(more).toBeVisible();

      // Z to A keeps twelve rows, now the last names.
      await page.locator('[data-sort="name"]').click();
      await expect(page.locator('th[data-sort-key="name"]')).toHaveAttribute("aria-sort", "descending");
      await expect(visibleRows(page)).toHaveCount(12);
      await expect(visibleRows(page).first().locator("a")).toHaveText("York");
      await page.locator('[data-sort="name"]').click();

      const thirteenth = page.locator("tr[data-row]").nth(12).locator("a");
      await more.click();
      await expect(visibleRows(page)).toHaveCount(296);
      await expect(count(page)).toHaveText("296 of 296 shown");
      await expect(more).toBeHidden();
      await expect(thirteenth).toBeFocused();
      expect(await noInnerScroll()).toBeLessThanOrEqual(1);

      // A new query starts from the short list again.
      await page.locator("[data-picker-input]").fill("on");
      await expect(more).toBeVisible();
      await expect(visibleRows(page)).toHaveCount(12);
      await context.close();
    });

    test("from 600 px wide every council is listed and no button shows", async ({ browser, baseURL }) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
      await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
      await page.goto(`${baseURL}${path}`);
      await expect(count(page)).toHaveText("296 of 296 shown");
      await expect(visibleRows(page)).toHaveCount(296);
      await expect(page.locator("[data-picker-more]")).toBeHidden();
      await context.close();
    });

    for (const theme of ["light", "dark"] as const) {
      test(`axe passes with the filters closed and open in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(path);
        await expect(count(page)).toHaveText(countText(page, 296));
        await axe(page);
        await openFilters(page);
        await page.locator('[data-chip="type"][data-value="unitary-authority"]').click();
        await axe(page);
      });
    }
  });
}
