import {reorganisationChecks} from './lib/reorganisation-checks.mjs';
import { budgetChecks } from './lib/budget-checks.mjs';
import { heldWording, RA_906_LABEL } from './lib/held-wording.mjs';
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
 *   * any built file carrying the held reorganisation text
 *
 * Exits non-zero naming each failure.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { hashesIn, scriptSrcOf } from "./inject_csp_hashes.mjs";
import { frontDoorChecks } from "./lib/front-door-checks.mjs";
import { unsourcedFigures } from "./lib/figures.mjs";
import { dossierChecks } from "./lib/dossier-checks.mjs";

const DIST = resolve(process.cwd(), "dist");
const SITE_NAME = "UK Councils";
const SITE_URL = "https://ukcouncils.co.uk";
// The Web Analytics site token, the same value as CF_BEACON_TOKEN in src/lib/site.ts.
const BEACON_TOKEN = "78d78550d291419997e07dfb8c36dbdc";
// Built from parts so this file does not carry the entity names it looks for.
const DASH = new RegExp(`[\\u2013\\u2014]|&${"m"}dash;|&${"n"}dash;`);
const HELD_PHRASES = ["government-decided", "four-unitary", "Structural Change Order"];

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
const dossierCounts = {};
if (!existsSync(join(DIST, "apple-touch-icon.png"))) failures.push("missing Apple touch icon PNG");
const rel = (path) => path.slice(DIST.length) || "/";
let pages = 0;
const efs = JSON.parse(readFileSync(join(process.cwd(), "data/efs/statements.json"), "utf8"));
const efsBySlug = new Map(Object.entries(efs.authorities).filter(([, authority]) => authority.slug).map(([key, authority]) => [authority.slug, key]));

for (const path of files(DIST)) {
  if (!/\.(html|xml|txt|json|js|css|svg|webmanifest)$|_headers$|_redirects$/.test(path)) continue;
  const text = readFileSync(path, "utf-8");
  if (DASH.test(text)) failures.push(`dash in ${rel(path)}`);
  // The withdrawn Lancashire reorganisation note is held: see "Held data" in CLAUDE.md.
  for (const phrase of HELD_PHRASES) if (text.includes(phrase)) failures.push(`held reorganisation text "${phrase}" in ${rel(path)}`);
  if (/https?:\/\/ukfoodhygiene\.co\.uk\b/.test(text)) failures.push(`private sister link in ${rel(path)}`);
  if (!path.endsWith(".html")) {
    if (text.includes(RA_906_LABEL)) failures.push(`RA label outside financing markup in ${rel(path)}`);
    continue;
  }
  pages += 1;
  const touchIcons = [...text.matchAll(/<link\b[^>]*\brel="apple-touch-icon"[^>]*>/g)];
  if (touchIcons.length !== 1 || !touchIcons[0][0].includes('href="/apple-touch-icon.png"')
    || !touchIcons[0][0].includes('sizes="180x180"')) {
    failures.push(`missing 180 by 180 Apple touch icon link on ${rel(path)}`);
  }
  if (heldWording(text)) failures.push(`held wording outside cited source text in ${rel(path)}`);
  const prose = text.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "").replace(/<[^>]+>/g, " ");
  if (/\s-\s/.test(prose)) failures.push(`spaced hyphen in prose on ${rel(path)}`);

  const title = /<title>([^<]*)<\/title>/.exec(text)?.[1];
  if (!title) failures.push(`no title on ${rel(path)}`);
  else {
    if (title !== SITE_NAME && !title.endsWith(` | ${SITE_NAME}`)) {
      failures.push(`title without the pipe and site name on ${rel(path)}: ${title}`);
    }
    if (/\s-\s/.test(title)) failures.push(`hyphen separator in title on ${rel(path)}: ${title}`);
  }

  const councilSlug = /^\/councils\/([^/]+)\/index\.html$/.exec(rel(path))?.[1];
  if (councilSlug) {
    const dossier = dossierChecks(text);
    failures.push(...dossier.failures.map(failure => `${failure} on ${rel(path)}`));
    for (const [key, count] of Object.entries(dossier.counts)) dossierCounts[key] = (dossierCounts[key] ?? 0) + count;
    const expected = `https://ukcounciltax.co.uk/councils/${councilSlug}/`;
    const matches = [...text.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].filter(match => match[1] === expected);
    if (matches.length !== 1) failures.push(`Expected one verified UK Council Tax link on ${rel(path)}; found ${matches.length}`);
    const efsKey = efsBySlug.get(councilSlug);
    const hasEfs = /id="efs-heading"[^>]*>Exceptional Financial Support<\/h2>/.test(text);
    if (hasEfs !== Boolean(efsKey)) failures.push(`EFS section coverage differs from the data on ${rel(path)}`);
    if (efsKey && !text.includes(`href="/exceptional-financial-support/#name-${efsKey}"`)) failures.push(`Missing EFS authority anchor on ${rel(path)}`);
  }

  if (rel(path) === "/findings/index.html" && !/<title>Findings: council tax data notes, England /.test(text)) failures.push("findings title does not carry the subject");
  if (rel(path) === "/sources/index.html") {
    for (const needle of ["AI DOGE", "UK School Holiday Dates", "Local Authority Districts (May 2026) Boundaries UK BSC", "Exceptional Financial Support for local authorities for 2026-27"]) {
      if (!text.includes(needle)) failures.push(`sources page does not name ${needle}`);
    }
  }

  const { problems } = unsourcedFigures(text);
  for (const problem of new Set(problems)) failures.push(`${problem} on ${rel(path)}`);

  // A gate that checks the CSP would allow the beacon is not a gate that checks
  // the beacon is there. Exactly one, carrying this site's token.
  const beacons = [...text.matchAll(/<script[^>]*static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*>/g)];
  if (beacons.length !== 1) failures.push(`${beacons.length} analytics beacons on ${rel(path)}`);
  else if (!beacons[0][0].includes(BEACON_TOKEN)) failures.push(`beacon on ${rel(path)} carries another token`);

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
  const bandPages = ["A", "B", "C", "D", "E", "F", "G", "H"]
    .map((b) => ({ band: b, path: join(DIST, "council-tax", `band-${b.toLowerCase()}`, "index.html") }));
  const pagesToCover = bandPages.map((p) => p.path).concat(join(DIST, "council-tax", "index.html"));
  for (const page of pagesToCover) {
    if (!existsSync(page)) {
      failures.push(`missing ${rel(page)}`);
      continue;
    }
    const seen = listed(page);
    const missing = onsCodes.filter((ons) => !seen.has(ons));
    if (missing.length) failures.push(`${rel(page)} does not list ${missing.length} authorities, first ${missing[0]}`);
  }
  // Every band page carries the headline block above the tables, with the
  // GOV.UK band checker, and states the England average only when held.
  for (const { band, path: page } of bandPages) {
    if (!existsSync(page)) continue;
    const html = readFileSync(page, "utf-8");
    if (!/id="band-headline"/.test(html)) failures.push(`${rel(page)} has no band headline block`);
    if (!/https:\/\/www\.gov\.uk\/council-tax-bands/.test(html)) {
      failures.push(`${rel(page)} has no GOV.UK band checker link`);
    }
    if (band === "D") {
      if (!/England average area Band D/.test(html)) {
        failures.push(`${rel(page)} does not state the held England Band D average`);
      }
      if (!/Over ten instalments/.test(html) || !/Over twelve instalments/.test(html)) {
        failures.push(`${rel(page)} is missing the ten or twelve instalment figures`);
      }
    } else if (!/data-band-average-absent/.test(html)) {
      failures.push(`${rel(page)} should note that no England average is held for Band ${band}`);
    }
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

// The search index must cover the same public routes as the sitemap.
const searchEntry = join(DIST, "pagefind", "pagefind-entry.json");
if (!existsSync(searchEntry)) failures.push("Pagefind index missing");
else {
  const entry = JSON.parse(readFileSync(searchEntry, "utf8"));
  const indexed = Object.values(entry.languages).reduce((sum, language) => sum + language.page_count, 0);
  if (indexed !== locs.length) failures.push(`search pages ${indexed} differs from sitemap ${locs.length}`);
}
for (const asset of ["pagefind.js", "pagefind-worker.js"]) {
  if (!existsSync(join(DIST, "pagefind", asset))) failures.push(`missing search asset ${asset}`);
}

const reorg = reorganisationChecks(process.cwd(), DIST);
failures.push(...reorg.failures);
console.log(`Reorganisation coverage: ${JSON.stringify(reorg.counts)}`);
const frontDoor = frontDoorChecks(process.cwd(), DIST);
failures.push(...frontDoor.failures);
console.log(`B2 coverage: ${JSON.stringify(frontDoor.counts)}`);

const budgets = budgetChecks(process.cwd(), DIST);
failures.push(...budgets.failures);
console.log(`C3 coverage: ${JSON.stringify(budgets.counts)}`);
console.log(`Dossier coverage: ${JSON.stringify(dossierCounts)}`);

if (failures.length) {
  console.error(`dist check: ${failures.length} failures\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`dist check: ${pages} pages, ${locs.length} sitemap URLs, all passed`);
