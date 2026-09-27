import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

/**
 * Global setup for both Playwright configs: fail the whole run, loudly, when
 * the browser for the pinned Playwright version is not installed.
 *
 * Without this a missing browser fails only the specs that launch one. The CSP
 * run also holds three file checks that need no browser, and its last line then
 * reads "3 passed", which is how a run that tested no page at all looked green.
 *
 * The browser is launched, not just looked for, because headless runs use a
 * separate shell binary from the one `executablePath()` names.
 */
const FIX = "npx playwright install chromium";

export default async function assertBrowserInstalled(): Promise<void> {
  const path = chromium.executablePath();
  if (!path || !existsSync(path)) {
    throw new Error(
      `No Chromium for this Playwright version at ${path || "(no path)"}. `
        + `Run \`${FIX}\` and run the tests again.`,
    );
  }
  try {
    const browser = await chromium.launch();
    await browser.close();
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    throw new Error(
      `Chromium would not launch (${reason}). Run \`${FIX}\` and run the tests again.`,
    );
  }
}
