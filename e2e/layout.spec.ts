import { expect, test } from "@playwright/test";
import { STATIC_PATHS } from "../src/lib/site";

/**
 * Every static path renders, and no page body scrolls horizontally at the
 * viewport the project runs at. Two pixels of tolerance for sub-pixel rounding.
 */
for (const path of STATIC_PATHS) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${path} is ${overflow}px wider than the viewport`).toBeLessThanOrEqual(2);
  });
}
