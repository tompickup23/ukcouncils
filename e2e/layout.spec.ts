import { expect, test } from "@playwright/test";
import { STATIC_PATHS } from "../src/lib/site";

/**
 * Every static path and one page of each programmatic family renders, and no
 * page body scrolls horizontally at the viewport the project runs at. Two
 * pixels of tolerance for sub-pixel rounding. The council pages chosen carry
 * the longest names and the notes MHCLG attaches, which is where a layout
 * breaks first.
 */
const SAMPLES = [
  "/councils/burnley/",
  "/councils/lewes/",
  "/councils/windsor-and-maidenhead/",
  "/councils/king-s-lynn-and-west-norfolk/",
  "/council-tax/band-d/",
  "/council-tax/yorkshire-and-the-humber/",
];

for (const path of [...STATIC_PATHS, ...SAMPLES]) {
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
