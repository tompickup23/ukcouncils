import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { hashesIn, scriptSrcOf } from "../scripts/inject_csp_hashes.mjs";
import { STATIC_PATHS } from "../src/lib/site";

/**
 * The production Content Security Policy, applied.
 *
 * These pages are served by `wrangler pages dev dist`, which reads _headers the
 * way Cloudflare Pages does. Nothing else in this repo does: astro dev and
 * astro preview send no policy, so a page whose scripts are all blocked passes
 * every other run. Ported from aidoge-site, where that is how a CSP that
 * stopped every island reached a deployed preview.
 */

const ROOT = resolve(import.meta.dirname, "..");

const PAGES = [...STATIC_PATHS, "/councils/burnley/", "/council-tax/band-d/", "/this-page-does-not-exist/"];

interface Violation {
  directive: string;
  blocked: string;
}

/**
 * Every refusal the policy makes on a page, from the browser's own event, plus
 * the console, so a policy error Chromium reports only as text cannot pass.
 * addInitScript runs before any page script and is itself outside the policy.
 */
async function watch(page: Page): Promise<Violation[]> {
  const found: Violation[] = [];
  await page.exposeFunction("__cspViolation", (v: Violation) => {
    found.push(v);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      const e = event as SecurityPolicyViolationEvent;
      (window as unknown as {
        __cspViolation: (v: { directive: string; blocked: string }) => void;
      }).__cspViolation({
        directive: e.violatedDirective,
        blocked: e.blockedURI.slice(0, 120),
      });
    });
  });
  page.on("console", (message: ConsoleMessage) => {
    if (/Content Security Policy/i.test(message.text())) {
      found.push({ directive: "console", blocked: message.text().slice(0, 200) });
    }
  });
  return found;
}

const describe = (found: Violation[]): string =>
  found.map((v) => `${v.directive} blocked ${v.blocked}`).join("\n");

for (const path of PAGES) {
  test(`${path} raises no CSP violation and carries the full header set`, async ({ page }) => {
    const found = await watch(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(path.includes("does-not-exist") ? 404 : 200);
    const headers = response?.headers() ?? {};
    const scriptSrc = scriptSrcOf(`Content-Security-Policy: ${headers["content-security-policy"] ?? ""}`);
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_000);
    expect(found, describe(found)).toEqual([]);
  });
}

test("the theme select runs under the policy", async ({ page }) => {
  // The select's script is bundled by Astro and may be inlined; either way it
  // must run. A blocked script leaves the select on its first option and the
  // document without data-theme.
  const found = await watch(page);
  await page.goto("/");
  const select = page.locator("[data-theme-select]");
  await expect(select).toHaveValue("system");
  await select.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  // theme-init.js applies the stored choice before paint.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-theme-select]")).toHaveValue("dark");
  expect(found, describe(found)).toEqual([]);
});

test("_headers allows exactly the inline scripts the built tree has", async () => {
  // A hash with no script behind it fails too: a stale one outliving the code
  // it allowed is how an allowance nobody can account for survives a refactor.
  const headers = readFileSync(join(ROOT, "dist", "_headers"), "utf-8");
  const allowed = scriptSrcOf(headers)
    .filter((token: string) => token.startsWith("'sha256-"))
    .map((token: string) => token.slice(1, -1))
    .sort();
  const needed = [...hashesIn(join(ROOT, "dist")).keys()].sort();
  expect(allowed).toEqual(needed);
});
