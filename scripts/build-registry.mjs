/**
 * The council spine and every sister site link, written to
 * data/registry/councils.json.
 *
 *   node scripts/build-registry.mjs
 *
 * The spine is UK Places' published registry, so the slugs on the six sites
 * agree: 361 UK local authorities keyed by GSS code.
 *
 * A sister link is kept only when it passes two tests:
 *
 *   identity  the sister site's own GSS keyed mapping names the slug (UK Food
 *             Hygiene's etl/la_map.csv, UK Elections' council slug to LAD24
 *             map, AI DOGE's council crosswalk), or UK Places' coverage block
 *             does. No slug is derived from a name here.
 *   existence the URL is in that site's live sitemap today. UK Places' own
 *             coverage flags are stale in both directions (they claim 294 AI
 *             DOGE pages; 234 of those URLs are in AI DOGE's sitemap), so a
 *             claim is never enough.
 *
 * Two candidates for one council that both exist and differ are an error, not
 * a choice. The sister mappings are read from each repository's origin/main
 * with `git show`, never from a working tree that may be on another branch;
 * this script therefore runs on the machine holding those clones, and its
 * output is committed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "data", "registry", "councils.json");
const REGISTRY_URL = "https://ukplaces.co.uk/data/registry/places.json";

/** Each sister site: its host, the sitemap to read and the route a council page sits on. */
const SISTERS = {
  ukelections: {
    name: "UK Elections",
    origin: "https://ukelections.co.uk",
    sitemaps: ["/sitemap.xml"],
    route: (slug) => `/seats/${slug}/`,
  },
  ukdemographics: {
    name: "UK Demographics",
    origin: "https://ukdemographics.co.uk",
    sitemaps: ["/sitemap.xml"],
    route: (slug) => `/places/${slug}/`,
  },
  aidoge: {
    name: "AI DOGE",
    origin: "https://aidoge.co.uk",
    sitemaps: ["/sitemap.xml"],
    route: (slug) => `/councils/${slug}/`,
  },
  asylumstats: {
    name: "Asylum Stats",
    origin: "https://asylumstats.co.uk",
    sitemaps: ["/sitemap.xml"],
    route: (slug) => `/places/${slug}/`,
  },
  ukfoodhygiene: {
    name: "UK Food Hygiene",
    origin: "https://ukfoodhygiene.co.uk",
    sitemaps: ["/sitemap-index.xml"],
    route: (slug) => `/councils/${slug}/`,
  },
};

async function text(url) {
  const response = await fetch(url, { headers: { "User-Agent": "ukcouncils registry build" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** Every <loc> in a sitemap, following a sitemap index one level down. */
async function sitemapUrls(origin, paths) {
  const urls = new Set();
  const queue = paths.map((p) => `${origin}${p}`);
  while (queue.length) {
    const url = queue.shift();
    const body = await text(url);
    const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    if (/<sitemapindex\b/.test(body)) queue.push(...locs);
    else for (const loc of locs) urls.add(loc);
  }
  return urls;
}

/** A file from a sister repository's origin/main, or null when the clone is absent. */
function fromOriginMain(repo, path) {
  const dir = join(homedir(), repo);
  if (!existsSync(join(dir, ".git"))) return null;
  try {
    execFileSync("git", ["-C", dir, "fetch", "--quiet", "origin", "main"], { stdio: "ignore" });
  } catch {
    // Offline: origin/main as last fetched is still a committed state.
  }
  return execFileSync("git", ["-C", dir, "show", `origin/main:${path}`], {
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function parseCsv(body) {
  const [head, ...lines] = body.trim().split(/\r?\n/);
  const columns = head.split(",");
  return lines.map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(columns.map((c, i) => [c, (cells[i] ?? "").trim()]));
  });
}

/** GSS code to candidate slugs per sister, from each sister's own mapping. */
function sisterMappings() {
  const candidates = {};
  const add = (site, gss, slug, from) => {
    if (!gss || !slug) return;
    candidates[gss] ??= {};
    candidates[gss][site] ??= [];
    candidates[gss][site].push({ slug, from });
  };
  const used = [];

  const laMap = fromOriginMain("ukfoodhygiene", "etl/la_map.csv");
  if (laMap) {
    used.push("ukfoodhygiene etl/la_map.csv");
    for (const row of parseCsv(laMap)) {
      add("ukfoodhygiene", row.gss_code, row.council_slug, "ukfoodhygiene la_map.csv");
      add("ukelections", row.gss_code, row.uke_slug, "ukfoodhygiene la_map.csv");
      add("ukdemographics", row.gss_code, row.ukd_slug, "ukfoodhygiene la_map.csv");
    }
  }

  const ukeMap = fromOriginMain("ukelections", "data/identity/council-slug-to-lad24.json");
  if (ukeMap) {
    used.push("ukelections data/identity/council-slug-to-lad24.json");
    for (const [slug, entry] of Object.entries(JSON.parse(ukeMap).map ?? {})) {
      add("ukelections", entry.lad24cd, slug, "ukelections council-slug-to-lad24");
    }
  }

  const crosswalk = fromOriginMain("aidoge-site", "data/shared/council_crosswalk.json");
  if (crosswalk) {
    used.push("aidoge-site data/shared/council_crosswalk.json");
    for (const [id, entry] of Object.entries(JSON.parse(crosswalk).councils ?? {})) {
      add("aidoge", entry.ons_code, id, "aidoge council_crosswalk");
    }
  }
  return { candidates, used };
}

async function main() {
  const registry = JSON.parse(await text(REGISTRY_URL));
  const places = Object.values(registry.places ?? registry);
  if (places.length < 361) throw new Error(`UK Places registry holds ${places.length} places, expected 361`);

  const live = {};
  for (const [site, config] of Object.entries(SISTERS)) {
    live[site] = await sitemapUrls(config.origin, config.sitemaps);
    if (live[site].size < 100) throw new Error(`${site}: sitemap lists only ${live[site].size} URLs`);
  }

  const { candidates, used } = sisterMappings();
  const conflicts = [];
  const councils = {};
  for (const place of places.sort((a, b) => a.gss.localeCompare(b.gss))) {
    const sisters = {};
    for (const [site, config] of Object.entries(SISTERS)) {
      const options = [...(candidates[place.gss]?.[site] ?? [])];
      const claimed = place.coverage?.[site];
      if (claimed?.hasPage && claimed.slug) options.push({ slug: claimed.slug, from: "ukplaces coverage" });
      const found = new Map();
      for (const option of options) {
        const url = `${config.origin}${config.route(option.slug)}`;
        if (live[site].has(url)) found.set(url, option.from);
      }
      if (found.size > 1) conflicts.push(`${place.gss} ${site}: ${[...found.keys()].join(" and ")}`);
      sisters[site] = found.size === 1 ? [...found.keys()][0] : null;
    }
    councils[place.gss] = {
      gss: place.gss,
      slug: place.slug,
      name: place.name,
      officialName: place.officialName,
      type: place.type,
      country: place.country,
      region: place.region,
      county: place.county ?? null,
      parentGss: place.parentGss ?? null,
      reorganisation: place.reorganisation ?? null,
      sisters,
    };
  }
  if (conflicts.length) throw new Error(`conflicting sister URLs:\n  ${conflicts.join("\n  ")}`);

  const slugs = new Set();
  for (const c of Object.values(councils)) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) throw new Error(`${c.gss}: slug ${c.slug} is not a URL slug`);
    if (slugs.has(c.slug)) throw new Error(`${c.gss}: slug ${c.slug} is used twice`);
    slugs.add(c.slug);
  }

  if (existsSync(OUT)) {
    const before = JSON.parse(readFileSync(OUT, "utf-8"));
    const previous = Object.keys(before.councils).length;
    if (Object.keys(councils).length < previous) {
      throw new Error(`refusing to write ${Object.keys(councils).length} councils over ${previous}`);
    }
  }

  const counts = Object.fromEntries(
    Object.keys(SISTERS).map((site) => [site, Object.values(councils).filter((c) => c.sisters[site]).length]),
  );
  const data = {
    generated: new Date().toISOString().slice(0, 10),
    source: {
      spine: REGISTRY_URL,
      mappings: used,
      sitemaps: Object.fromEntries(
        Object.entries(SISTERS).map(([site, c]) => [site, { name: c.name, sitemap: `${c.origin}${c.sitemaps[0]}`, urls: live[site].size }]),
      ),
      rule: "A sister link is kept only when a GSS keyed mapping names its slug and the URL is in that site's live sitemap.",
    },
    counts,
    councils,
  };
  mkdirSync(join(ROOT, "data", "registry"), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`registry: ${Object.keys(councils).length} councils; sister pages ${JSON.stringify(counts)}; mappings ${used.length}`);
}

main().catch((error) => {
  console.error(`registry: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
