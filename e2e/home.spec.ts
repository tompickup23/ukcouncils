import { expect, test } from "@playwright/test";
import { loadSetManifest } from "../src/lib/ukcounciltax-set";

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});

test("one search box finds a council by name", async ({ page }) => {
  await page.goto("/");
  const input = page.locator("#home-search");
  await input.fill("burnley");
  await expect(page.locator("[data-home-search-status]")).toContainText("1 matching council");
  await expect(page.locator("#home-search-results a:visible")).toHaveAttribute("href", "/councils/burnley/#council-tax");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/councils\/burnley\/#council-tax$/);
});

test("one search box finds a council by postcode without putting it in the address", async ({ page }) => {
  await page.route("https://api.postcodes.io/postcodes/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: 200, result: { codes: { admin_district: "E07000117" } } }) }),
  );
  await page.goto("/");
  await page.locator("#home-search").fill("BB11 1DU");
  await page.getByRole("button", { name: "Find" }).first().click();
  await page.waitForURL(/\/councils\/burnley\/#council-tax$/);
  expect(page.url()).not.toMatch(/BB11/i);
});

test("without scripts, Find opens the area page and carries nothing in the address", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.locator("#home-search").fill("BB11 1DU");
    await page.locator("[data-home-search] button[type=submit]").click();
    await page.waitForURL(/\/your-area\//);
    expect(new URL(page.url()).search.replace(/^\?$/, "")).toBe("");
  } finally { await context.close(); }
});

test("the council row comes before the UK Council Tax band, which links only to eligible set pages", async ({ page }) => {
  const manifest = loadSetManifest();
  await page.goto("/");
  const order = await page.evaluate(() => {
    const cards = document.querySelector(".home-cards");
    const band = document.querySelector("[data-ukct-band]");
    return cards && band ? Boolean(cards.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING) : null;
  });
  expect(order).toBe(true);
  const band = page.locator("[data-ukct-band]");
  await expect(band.getByRole("heading", { level: 2 })).toHaveText("From UK Council Tax");
  await expect(band).toContainText("These links leave UK Councils.");
  await expect(band.getByRole("link", { name: "Budget game" })).toHaveAttribute("href", manifest.hub);
  const hrefs = await band.locator("[data-set-gss]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const wanted = new Set(manifest.eligible.map((row) => `https://ukcounciltax.co.uk/tools/budget/${row.slug}/set/`));
  expect(hrefs).toHaveLength(wanted.size);
  for (const href of hrefs) expect(wanted.has(href!)).toBe(true);
  await band.getByText("Choose a council").click();
  await expect(band.locator("[data-set-gss]").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
