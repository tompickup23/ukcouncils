import { expect, test } from "@playwright/test";

// The analytics beacon is stopped, as in layout.spec.ts: test runs are not page loads.
test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});

/**
 * The spending section, against the built tree. Burnley has an AI DOGE page,
 * a headline and a transaction bank; Luton has no AI DOGE page, so its page
 * carries no section at all, not an empty one.
 */
test("a council with a bank states its payments and links to the search", async ({ page }) => {
  await page.goto("/councils/burnley/");
  const section = page.locator("[data-spending-record]");
  await expect(section).toHaveCount(1);
  await expect(section.locator("h2")).toHaveText("What the council publishes about its spending");
  await expect(section).toContainText(/Burnley published [\d,]+ payments of £500 and over in \d{4}\/\d{2}, totalling £[\d,]+, as at \d{1,2} \w+ \d{4}\./);
  const link = section.locator("[data-spending-link]");
  await expect(link).toHaveText("Search every payment on AI DOGE");
  await expect(link).toHaveAttribute("href", "https://aidoge.co.uk/councils/burnley/#transactions");
  await expect(section.locator(".source-line")).toHaveCount(1);
});

test("a council with no AI DOGE page has no spending section", async ({ page }) => {
  await page.goto("/councils/luton/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("[data-spending-record]")).toHaveCount(0);
  await expect(page.locator("#spending")).toHaveCount(0);
  await expect(page.getByText("What the council publishes about its spending")).toHaveCount(0);
});
