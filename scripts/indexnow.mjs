/**
 * Tells IndexNow (Bing, Yandex, Seznam, Naver and others) which URLs to fetch.
 *
 *   node scripts/indexnow.mjs
 *     Every URL in the live sitemap, capped at the IndexNow batch limit.
 *
 *   node scripts/indexnow.mjs --changed --dist dist --previous prev.json --manifest next.json
 *     Only the URLs whose content changed in this build. The build's own
 *     sitemap (dist/sitemap.xml) gives the URL list; each page's <main> element
 *     is hashed and compared with the manifest from the last build that was
 *     submitted. A URL that is new, or whose hash differs, is submitted. With no
 *     previous manifest every sitemap URL is submitted, capped at the batch
 *     limit. The sitemap carries no lastmod (see src/pages/sitemap.xml.ts), so
 *     that fallback keeps sitemap order. The new manifest is written to
 *     --manifest either way.
 *
 *   --dry-run prints what would be submitted and makes no network request.
 *
 * The key is public by design: IndexNow proves ownership by fetching
 * https://ukcouncils.co.uk/<key>.txt and checking it holds the key, so the
 * file lives in public/. Run after a deploy that adds or changes pages; the
 * script refuses to submit until the key file is live.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SITE = "https://ukcouncils.co.uk";
const KEY = "17787fde6c2884af115e79feb459b7d4";
const BATCH_LIMIT = 10000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

/** The HTML file a sitemap URL is built to, under build.format "directory". */
function builtFile(dist, url) {
  const path = new URL(url).pathname;
  if (path.endsWith("/")) return join(dist, path, "index.html");
  return join(dist, path);
}

/**
 * Hash of what a reader sees: the <main> element when the page has one, so a
 * new stylesheet or script hash in the head does not mark every page changed.
 */
function contentHash(file) {
  const html = readFileSync(file, "utf-8");
  const main = html.match(/<main[\s>][\s\S]*<\/main>/);
  return createHash("sha256").update(main ? main[0] : html).digest("hex");
}

let urls;
if (flag("--changed")) {
  const dist = resolve(process.cwd(), option("--dist") ?? "dist");
  const sitemapFile = join(dist, "sitemap.xml");
  if (!existsSync(sitemapFile)) {
    console.error(`indexnow: ${sitemapFile} does not exist; build first`);
    process.exit(1);
  }
  const all = locs(readFileSync(sitemapFile, "utf-8"));
  const manifest = {};
  for (const url of all) {
    const file = builtFile(dist, url);
    if (existsSync(file)) manifest[url] = contentHash(file);
  }
  const previousPath = option("--previous");
  const previous = previousPath && existsSync(previousPath) ? JSON.parse(readFileSync(previousPath, "utf-8")) : null;
  if (previous) {
    urls = all.filter((url) => manifest[url] !== undefined && previous[url] !== manifest[url]);
    console.log(`indexnow: ${urls.length} of ${all.length} sitemap URLs are new or changed since the last submitted build`);
  } else {
    urls = all;
    console.log(`indexnow: no previous manifest, so every one of ${all.length} sitemap URLs is a candidate`);
  }
  const manifestPath = option("--manifest");
  if (manifestPath) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 0)}\n`);
} else {
  urls = locs(await (await fetch(`${SITE}/sitemap.xml`)).text());
  if (urls.length === 0) {
    console.error("indexnow: the live sitemap lists no URL");
    process.exit(1);
  }
}

if (urls.length > BATCH_LIMIT) {
  console.log(`indexnow: capping ${urls.length} URLs at the batch limit of ${BATCH_LIMIT}`);
  urls = urls.slice(0, BATCH_LIMIT);
}
if (urls.length === 0) {
  console.log("indexnow: nothing changed, nothing submitted");
  process.exit(0);
}
if (flag("--dry-run")) {
  for (const url of urls.slice(0, 20)) console.log(`  ${url}`);
  if (urls.length > 20) console.log(`  and ${urls.length - 20} more`);
  console.log(`indexnow: dry run, ${urls.length} URLs would be submitted, no request made`);
  process.exit(0);
}

const keyFile = await fetch(`${SITE}/${KEY}.txt`);
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) {
  console.error(`indexnow: ${SITE}/${KEY}.txt is not live with the key; deploy first`);
  process.exit(1);
}
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});
console.log(`indexnow: submitted ${urls.length} URLs, HTTP ${response.status}`);
if (!response.ok && response.status !== 202) process.exit(1);
