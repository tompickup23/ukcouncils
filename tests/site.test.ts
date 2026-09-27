import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { SITE_NAME, SITE_URL, STATIC_PATHS, pageTitle } from "../src/lib/site";

const ROOT = resolve(import.meta.dirname, "..");

function walk(dir: string, pattern: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, pattern, out);
    else if (pattern.test(entry.name)) out.push(path);
  }
  return out;
}

const rel = (path: string) => path.replace(`${ROOT}/`, "");

describe("sitemap parity", () => {
  it("lists every static hub page in STATIC_PATHS", () => {
    // Adding a hub under src/pages and forgetting the list is the recurring
    // sister-site bug: the page exists, nothing reaches the sitemap or the
    // search index, and nobody notices for months. Dynamic routes ([slug]) are
    // programmatic and join the sitemap through their own loader.
    const pagesDir = join(ROOT, "src", "pages");
    const NOT_A_HUB = new Set(["index.astro", "404.astro"]);
    const found = new Set<string>(["/"]);
    const visit = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith("[") || entry.name.startsWith("_")) continue;
        if (entry.isFile() && entry.name.endsWith(".astro") && !NOT_A_HUB.has(entry.name)) {
          found.add(`${prefix}${entry.name.replace(/\.astro$/, "")}/`);
        }
        if (entry.isDirectory()) {
          const sub = join(dir, entry.name);
          if (existsSync(join(sub, "index.astro"))) found.add(`${prefix}${entry.name}/`);
          visit(sub, `${prefix}${entry.name}/`);
        }
      }
    };
    visit(pagesDir, "/");
    const missing = [...found].filter((path) => !(STATIC_PATHS as readonly string[]).includes(path));
    expect(missing, `not in STATIC_PATHS: ${missing.join(", ")}`).toEqual([]);
  });

  it("lists no path twice and every path as a directory", () => {
    expect(new Set(STATIC_PATHS).size).toBe(STATIC_PATHS.length);
    for (const path of STATIC_PATHS) expect(path).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });
});

describe("the host name", () => {
  it("is written once in src and agrees with the Astro config", () => {
    const config = readFileSync(join(ROOT, "astro.config.mjs"), "utf-8");
    expect(config).toContain(`site: "${SITE_URL}"`);
    const offenders = walk(join(ROOT, "src"), /\.(astro|ts)$/)
      .filter((path) => !path.endsWith(join("lib", "site.ts")))
      .filter((path) => readFileSync(path, "utf-8").includes("ukcouncils.co.uk"))
      .map(rel);
    expect(offenders, `host name written outside site.ts in: ${offenders.join(", ")}`).toEqual([]);
  });
});

describe("titles", () => {
  it("appends the site name after a pipe", () => {
    expect(pageTitle("Council tax in Burnley 2026/27")).toBe(
      `Council tax in Burnley 2026/27 | ${SITE_NAME}`,
    );
    expect(pageTitle()).toBe(SITE_NAME);
  });

  it("passes no page title containing a hyphen separator or a dash", () => {
    const offenders: string[] = [];
    for (const path of walk(join(ROOT, "src", "pages"), /\.astro$/)) {
      for (const match of readFileSync(path, "utf-8").matchAll(/\btitle=["{`]([^"}`]*)/g)) {
        if (/ - |[\u2013\u2014]/.test(match[1])) offenders.push(`${rel(path)}: ${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("security headers", () => {
  const headers = readFileSync(join(ROOT, "public", "_headers"), "utf-8");
  const csp = headers.split("Content-Security-Policy:")[1]?.split("\n")[0] ?? "";
  const directive = (name: string) =>
    (csp.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name} `)) ?? "")
      .replace(name, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  it("ships the headers a new Cloudflare Pages project needs on day one", () => {
    for (const header of [
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "Referrer-Policy: strict-origin-when-cross-origin",
      "Permissions-Policy:",
      "Strict-Transport-Security:",
      "Cross-Origin-Opener-Policy: same-origin",
      "Content-Security-Policy:",
    ]) {
      expect(headers, `missing ${header}`).toContain(header);
    }
  });

  it("allows WebAssembly but not inline or evaluated script, and holds no hash", () => {
    const scriptSrc = directive("script-src");
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain("'wasm-unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    // Hashes are written into dist/_headers after the build, never by hand here.
    expect(scriptSrc.filter((t) => t.startsWith("'sha256-"))).toEqual([]);
  });

  it("allows exactly the origins the client actually calls", () => {
    // A connect-src entry with no matching call in the source is dead weight
    // that outlives the code that needed it, so each one is asserted against
    // the client code rather than against memory.
    const clientSource = [
      ...walk(join(ROOT, "src"), /\.(astro|ts)$/),
      ...walk(join(ROOT, "public"), /\.js$/),
    ].map((path) => readFileSync(path, "utf-8")).join("\n");
    for (const origin of directive("connect-src").filter((t) => t.startsWith("http"))) {
      expect(clientSource, `${origin} is allowed but nothing calls it`).toContain(origin);
    }
    for (const origin of directive("script-src").filter((t) => t.startsWith("http"))) {
      expect(clientSource, `${origin} is allowed but nothing loads from it`).toContain(origin);
    }
  });

  it("has no inline script anywhere in the source", () => {
    // The pre-paint theme script is public/theme-init.js for this reason.
    // is:inline with a src is an external file Astro leaves alone, which is
    // allowed; is:inline without one is a script body in the page.
    const offenders = walk(join(ROOT, "src"), /\.astro$/)
      .filter((path) => [...readFileSync(path, "utf-8").matchAll(/<script\b([^>]*)>/g)]
        .some(([, attrs]) => /is:inline/.test(attrs) && !/\bsrc=/.test(attrs)))
      .map(rel);
    expect(offenders).toEqual([]);
  });
});

describe("house style", () => {
  // src/, scripts/, public/ and data/ are all shipped or write what is shipped:
  // public/ is copied to dist/ verbatim, and a generator's string literal is the
  // reservoir that refills a cleaned JSON file on the next run.
  const files = [
    ...walk(join(ROOT, "src"), /\.(astro|ts|tsx|md|css|json)$/),
    ...walk(join(ROOT, "scripts"), /\.(mjs|js|ts|py)$/),
    ...walk(join(ROOT, "public"), /\.(js|svg|txt|xml|webmanifest|json|html)$/),
    ...walk(join(ROOT, "public"), /^_(headers|redirects)$/),
    ...walk(join(ROOT, "data"), /\.json$/),
  ];

  it("uses no em dash or en dash, literal or entity encoded", () => {
    const offenders = files
      .filter((path) => /[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/.test(readFileSync(path, "utf-8")))
      .map(rel);
    expect(offenders, `dashes in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("uses no space-hyphen-space pseudo-dash in prose", () => {
    const offenders: string[] = [];
    for (const path of files) {
      if (/\.(css|json)$/.test(path)) continue;
      for (const [i, line] of readFileSync(path, "utf-8").split("\n").entries()) {
        if (!line.includes(" - ")) continue;
        // Arithmetic and comparator expressions are not prose.
        if (/[)\]\w."'`]\s-\s[\w(]/.test(line) && /[=<>+*/]|=>|return|sort|\.\w+\(/.test(line)) continue;
        offenders.push(`${rel(path)}:${i + 1}`);
      }
    }
    expect(offenders, `pseudo-dash at: ${offenders.join(", ")}`).toEqual([]);
  });

  it("declares every colour as a token in global.css and nowhere else in src", () => {
    const tokenFile = join(ROOT, "src", "styles", "global.css");
    const offenders: string[] = [];
    for (const path of walk(join(ROOT, "src"), /\.(astro|ts|tsx|css)$/)) {
      if (path === tokenFile) continue;
      for (const [i, line] of readFileSync(path, "utf-8").split("\n").entries()) {
        const stripped = line
          .replace(/https?:\/\/\S+/g, "")
          .replace(/(href|id)=\{?["'`][^"'`]*["'`]/g, "")
          .replace(/url\(#[^)]*\)/g, "");
        if (/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/.test(stripped)) {
          offenders.push(`${rel(path)}:${i + 1}`);
        }
      }
    }
    expect(offenders, `colour literal outside the token file at: ${offenders.join(", ")}`).toEqual([]);
  });

  it("uses no motive or anger words in anything a page prints", () => {
    // The AI DOGE compliance grep: a rule and a date, never a motive.
    const WORDS = /\b(hiding|hides|hidden agenda|failing|failed to publish|waste|wasted|wasteful|scandal|shocking|secretive|breaking the law|unlawful|not compliant|non-compliant)\b/i;
    const offenders: string[] = [];
    for (const path of walk(join(ROOT, "src"), /\.(astro|md)$/)) {
      for (const [i, line] of readFileSync(path, "utf-8").split("\n").entries()) {
        if (WORDS.test(line)) offenders.push(`${rel(path)}:${i + 1}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
