/**
 * Checks the built tree after `npm run build`. Run by `npm run test:dist`.
 *
 * The unit suite reads source; this reads what ships. It fails on:
 *   * a page title that is not the site name, or does not end " | UK Councils"
 *   * a title that uses a hyphen separator or a dash
 *   * an em or en dash anywhere in dist (the vendored Pagefind bundle is
 *     excluded: its mark.js licence line carries one and the licence requires it)
 *   * a sitemap URL with no built page behind it, or on another host
 *   * a page whose canonical tag is not on the site's own origin
 *   * dist/_headers missing a hash for an inline script the tree carries
 *   * a figure (data-figure) that is not inside a fact with a source line
 *   * a band page or the national table that does not list every authority
 *     in the band table, or a council page count that does not match it
 *   * a council page with no MHCLG source line or no parish precept caveat
 *
 * Exits non-zero naming each failure.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { hashesIn, scriptSrcOf } from "./inject_csp_hashes.mjs";
import { unsourcedFigures } from "./lib/figures.mjs";

const DIST = resolve(process.cwd(), "dist");
const SITE_NAME = "UK Councils";
const SITE_URL = "https://ukcouncils.co.uk";
// Built from parts so this file does not carry the entity names it looks for.
const DASH = new RegExp(`[\\u2013\\u2014]|&${"m"}dash;|&${"n"}dash;`);

if (!existsSync(DIST)) {
  console.error("dist/ is not there. Run npm run build first.");
  process.exit(1);
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind") continue;
      yield* files(path);
    } else yield path;
  }
}

const failures = [];
const rel = (path) => path.slice(DIST.length) || "/";
let pages = 0;

for (const path of files(DIST)) {
  if (!/\.(html|xml|txt|json|js|css|svg|webmanifest)$|_headers$|_redirects$/.test(path)) continue;
  const text = readFileSync(path, "utf-8");
  if (DASH.test(text)) failures.push(`dash in ${rel(path)}`);
  if (!path.endsWith(".html")) continue;
  pages += 1;

  const title = /<title>([^<]*)<\/title>/.exec(text)?.[1];
  if (!title) failures.push(`no title on ${rel(path)}`);
  else {
    if (title !== SITE_NAME && !title.endsWith(` | ${SITE_NAME}`)) {
      failures.push(`title without the pipe and site name on ${rel(path)}: ${title}`);
    }
    if (/\s-\s/.test(title)) failures.push(`hyphen separator in title on ${rel(path)}: ${title}`);
  }

  const { problems } = unsourcedFigures(text);
  for (const problem of new Set(problems)) failures.push(`${problem} on ${rel(path)}`);

  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(text)?.[1];
  if (!canonical || !canonical.startsWith(`${SITE_URL}/`)) {
    failures.push(`canonical not on ${SITE_URL} for ${rel(path)}: ${canonical ?? "none"}`);
  }
}

const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf-8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) failures.push("sitemap.xml lists no URL");
for (const loc of locs) {
  if (!loc.startsWith(`${SITE_URL}/`)) {
    failures.push(`sitemap URL on another host: ${loc}`);
    continue;
  }
  const path = new URL(loc).pathname;
  if (!existsSync(join(DIST, path, "index.html")) && !existsSync(join(DIST, path))) {
    failures.push(`sitemap URL with no page: ${loc}`);
  }
}

// Every English billing authority in the band table appears on every band
// page and in the national table, and every council page names its source.
const bandFile = join(process.cwd(), "data", "council-tax", "england-2026-27.json");
if (existsSync(bandFile)) {
  const onsCodes = Object.keys(JSON.parse(readFileSync(bandFile, "utf-8")).authorities);
  const listed = (page) => new Set([...readFileSync(page, "utf-8").matchAll(/data-ons="([^"]+)"/g)].map((m) => m[1]));
  const pagesToCover = ["A", "B", "C", "D", "E", "F", "G", "H"]
    .map((b) => join(DIST, "council-tax", `band-${b.toLowerCase()}`, "index.html"))
    .concat(join(DIST, "council-tax", "index.html"));
  for (const page of pagesToCover) {
    if (!existsSync(page)) {
      failures.push(`missing ${rel(page)}`);
      continue;
    }
    const seen = listed(page);
    const missing = onsCodes.filter((ons) => !seen.has(ons));
    if (missing.length) failures.push(`${rel(page)} does not list ${missing.length} authorities, first ${missing[0]}`);
  }
  const councilDir = join(DIST, "councils");
  const councilPages = existsSync(councilDir)
    ? readdirSync(councilDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => join(councilDir, e.name, "index.html"))
    : [];
  if (councilPages.length !== onsCodes.length) {
    failures.push(`${councilPages.length} council pages built for ${onsCodes.length} authorities in the band table`);
  }
  for (const page of councilPages) {
    const html = readFileSync(page, "utf-8");
    if (!/Source: <a href="https:\/\/www\.gov\.uk\/government\/statistics\//.test(html)) {
      failures.push(`${rel(page)} has no MHCLG source line`);
    }
    if (!/class="caveat"/.test(html)) failures.push(`${rel(page)} has no parish precept caveat`);
  }
}

// When the build rendered cards (BUILD_OG=1), every og:image must resolve to
// a card in the tree. An iteration build renders none and skips this.
if (existsSync(join(DIST, "og"))) {
  let cards = 0;
  for (const path of files(DIST)) {
    if (!path.endsWith(".html")) continue;
    const image = /<meta property="og:image" content="([^"]+)"/.exec(readFileSync(path, "utf-8"))?.[1];
    if (!image) {
      failures.push(`no og:image on ${rel(path)}`);
      continue;
    }
    const local = join(DIST, new URL(image).pathname);
    if (!existsSync(local)) failures.push(`og:image ${image} on ${rel(path)} was not built`);
    else cards += 1;
  }
  console.log(`dist check: ${cards} pages point at a built share card`);
}

const allowed = new Set(
  scriptSrcOf(readFileSync(join(DIST, "_headers"), "utf-8"))
    .filter((t) => t.startsWith("'sha256-"))
    .map((t) => t.slice(1, -1)),
);
for (const [hash, where] of hashesIn(DIST)) {
  if (!allowed.has(hash)) failures.push(`inline script on ${where.page} not in dist/_headers: ${hash}`);
}

if (failures.length) {
  console.error(`dist check: ${failures.length} failures\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`dist check: ${pages} pages, ${locs.length} sitemap URLs, all passed`);
