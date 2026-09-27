import { defineConfig, devices } from "@playwright/test";

/**
 * The one run that applies the production security headers.
 *
 * `astro dev` and `astro preview` serve public/_headers as a file and never as
 * headers, so the main Playwright run is green on a policy that blocks the
 * whole site. That is exactly how a CSP that stopped every island hydrating
 * reached a deployed preview. `wrangler pages dev` reads _headers and _redirects
 * the way Cloudflare Pages does, which makes the failure reproducible here.
 *
 * Kept in its own config and its own directory so the main run cannot pick these
 * specs up and pass them against a server that sends no policy at all.
 */
const PORT = process.env.CSP_PORT ?? "8788";

export default defineConfig({
  testDir: "./e2e-csp",
  // wrangler is slower to start than astro preview, and a page is given time
  // to run its scripts before it is read.
  timeout: 120_000,
  // A missing browser fails the run here, not one spec at a time.
  globalSetup: "./playwright.browser-check.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  // One viewport. This run is about headers, which do not vary by screen size,
  // and every page here is already checked at 375px by the main run.
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The compatibility date is pinned because wrangler defaults it to today,
    // and a workerd binary a few weeks behind npm refuses to start on a date it
    // does not know. Nothing here is a Worker: dist is served as static assets
    // and only _headers and _redirects are being exercised, so the date only
    // has to be one every binary supports.
    // --show-interactive-dev-session=false keeps wrangler from waiting on a
    // keypress on a machine with a terminal attached.
    command: `npx --yes wrangler pages dev dist --port ${PORT} --ip 127.0.0.1`
      + " --compatibility-date=2026-01-01 --show-interactive-dev-session=false",
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
