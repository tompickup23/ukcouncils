import { expect, test } from "@playwright/test";

/**
 * The band selector is eight radio inputs and CSS. It has to work with
 * JavaScript off, and every band's figure has to be in the HTML whichever is
 * shown.
 */
test.use({ javaScriptEnabled: false });

test("shows Band D first and switches band without JavaScript", async ({ page }) => {
  await page.goto("/councils/burnley/");
  const panel = (band: string) => page.locator(`[data-band-panel="${band}"]`);
  await expect(panel("D")).toBeVisible();
  await expect(panel("A")).toBeHidden();
  await expect(panel("D")).toContainText("£2,549.42");
  await page.locator('label[data-band-label="A"]').click();
  await expect(panel("A")).toBeVisible();
  await expect(panel("D")).toBeHidden();
  await expect(panel("A")).toContainText("£1,699.61");
});

test("puts all eight figures in the HTML", async ({ request }) => {
  const html = await (await request.get("/councils/burnley/")).text();
  for (const figure of ["£1,699.61", "£2,549.42", "£5,098.84"]) expect(html).toContain(figure);
});
