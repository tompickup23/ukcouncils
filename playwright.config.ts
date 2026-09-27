import { defineConfig, devices } from "@playwright/test";

/**
 * The main browser run, against the built tree through astro preview.
 *
 * astro preview sends no security headers, so nothing here says anything about
 * the CSP; playwright.csp.config.ts is the run that does.
 */
const PORT = process.env.E2E_PORT ?? "4321";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  globalSetup: "./playwright.browser-check.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
