import { expect, test, type Page } from "@playwright/test";

// The analytics beacon is on every page. Test runs are not page loads, so its
// requests are stopped here; the browser has already checked them against the
// CSP by the time a route sees them.
test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});


/**
 * The postcode door, with postcodes.io answered by the test so the run does
 * not depend on a third party and sends no real postcode anywhere.
 */
async function answer(page: Page, status: number, adminDistrict?: string) {
  await page.route("https://api.postcodes.io/postcodes/**", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status === 200 ? { status, result: { codes: { admin_district: adminDistrict } } } : { status, error: "Postcode not found" }),
    }),
  );
}

test("lands on the council page at the council tax section", async ({ page }) => {
  await answer(page, 200, "E07000117");
  await page.goto("/");
  await page.locator("#postcode-home").fill("bb11 1du");
  await page.getByRole("button", { name: "Find" }).first().click();
  await expect(page).toHaveURL(/\/councils\/burnley\/#council-tax$/);
});

test("never puts the postcode in this site's address", async ({ page }) => {
  await answer(page, 200, "E07000117");
  await page.goto("/your-area/");
  await page.locator("#postcode-area").fill("BB11 1DU");
  await page.getByRole("button", { name: "Find" }).click();
  await page.waitForURL(/\/councils\/burnley\//);
  expect(page.url()).not.toMatch(/BB11|bb11/i);
});

test("says a council outside England has no page yet", async ({ page }) => {
  await answer(page, 200, "S12000036");
  await page.goto("/your-area/");
  await page.locator("#postcode-area").fill("EH1 1YZ");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.locator("[data-door-status]")).toContainText("is in Scotland");
  await expect(page).toHaveURL(/\/your-area\/$/);
});

test("says so when postcodes.io does not know the postcode", async ({ page }) => {
  await answer(page, 404);
  await page.goto("/your-area/");
  await page.locator("#postcode-area").fill("ZZ1 1ZZ");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.locator("[data-door-status]")).toContainText("does not know that postcode");
});

test("refuses text that is not a postcode without calling anyone", async ({ page }) => {
  let called = false;
  await page.route("https://api.postcodes.io/**", (route) => {
    called = true;
    return route.abort();
  });
  await page.goto("/your-area/");
  await page.locator("#postcode-area").fill("Burnley");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.locator("[data-door-status]")).toContainText("does not look like a UK postcode");
  expect(called).toBe(false);
});
