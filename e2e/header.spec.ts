import { expect, test } from "@playwright/test";
import { NAV_GROUPS } from "../src/lib/site";

const paths = ["/", "/councils/burnley/"];
const navigation = NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href));

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});

for (const theme of ["light", "dark"] as const) {
  for (const path of paths) {
    test(`${path} keeps a single header row below 72 px in ${theme}`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      for (const width of [390, 768, 860, 861, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const bounds = await page.locator(".site-header-bar").boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.height, `${width}px ${theme} header`).toBeLessThan(72);
        const brand = await page.locator(".brand").boundingBox();
        const tools = await page.locator(".site-tools").boundingBox();
        expect(brand).not.toBeNull();
        expect(tools).not.toBeNull();
        expect(brand!.y + brand!.height / 2).toBeCloseTo(tools!.y + tools!.height / 2, 0);
        expect(brand!.x + brand!.width).toBeLessThanOrEqual(tools!.x);
        expect(tools!.x + tools!.width).toBeLessThanOrEqual(width);
        await expect(page.locator("[data-search-open]")).toBeVisible();
      }
      await expect(page.locator("header [data-theme-select]")).toHaveCount(0);
      const select = page.locator("footer").getByRole("combobox", { name: "Theme", exact: true });
      await expect(select).toBeVisible();
      expect(await page.locator(".desktop-nav .mega-item").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(navigation);
      expect(await page.locator(".mobile-group-item").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(navigation);
      await page.setViewportSize({ width: 390, height: 844 });
      const measured = await page.locator(".site-header-bar").boundingBox();
      console.log(`${path} ${theme}: 390 px header height ${measured!.height} px`);
      await page.screenshot({ path: `output/playwright/header-${path === "/" ? "home" : "burnley"}-${testInfo.project.name}-${theme}.png` });
      await page.locator("[data-search-open]").click();
      await expect(page.locator("[data-site-search]")).toBeVisible();
      await page.keyboard.press("Escape");
      await page.locator("[data-mobile-menu-toggle]").click();
      await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
      await page.keyboard.press("Escape");
      await select.selectOption(theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.reload();
      await expect(select).toHaveValue(theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await select.selectOption("system");
      await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    });
  }
}

test("without JavaScript the footer theme control stays hidden", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL!);
  await expect(page.locator("[data-theme-select]")).toBeHidden();
  await expect(page.locator("[data-search-open]")).toHaveAttribute("href", "/councils/");
  await context.close();
});
