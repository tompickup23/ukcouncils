import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { BANDS, CURRENT_YEAR, loadYear } from "../src/lib/council-tax";
import { bandLinks, similarCouncils } from "../src/lib/council-links";
import { councilLastmod, councilTaxRelease, newest, sitemapEntries } from "../src/lib/lastmod";
import { REGIONS, bandPath, councilPages, councilPath, slugify } from "../src/lib/paths";
import { INCREASES_PATH, NAV_GROUPS, FOOTER_LINKS, NEXT_YEAR_PATH, SITE_NAME } from "../src/lib/site";
import { spendingFor, spendingRecord } from "../src/lib/spending";
import { sitemapPaths } from "../src/pages/sitemap.xml";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const COUNCIL_PAGE = readFileSync(join(ROOT, "src", "pages", "councils", "[slug].astro"), "utf-8");

function walk(dir: string, pattern: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, pattern, out);
    else if (pattern.test(entry.name)) out.push(path);
  }
  return out;
}

/** The text of an element as a reader sees it: tags dropped, entities decoded. */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const pages = councilPages();
const built = existsSync(join(DIST, "councils"));

describe("the council page heading", () => {
  it("prints the title's subject as the H1", () => {
    expect(COUNCIL_PAGE).toMatch(/const title = `\$\{name\} council tax bands \$\{year\}`;/);
    expect(COUNCIL_PAGE).toContain("<h1>{title}</h1>");
  });

  it.skipIf(!built)("matches the title before the pipe on every built council page", () => {
    const mismatched: string[] = [];
    for (const { council } of pages) {
      const html = readFileSync(join(DIST, "councils", council.slug, "index.html"), "utf-8");
      const title = text(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? "");
      const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]));
      if (h1s.length !== 1 || `${h1s[0]} | ${SITE_NAME}` !== title) mismatched.push(`${council.slug}: ${h1s.join(" / ")} vs ${title}`);
    }
    expect(mismatched).toEqual([]);
  });
});

describe("the band links", () => {
  it("links all eight band pages, anchored to the council's region section", () => {
    for (const { council, tax } of pages) {
      const links = bandLinks(council, tax.region);
      expect(links.map((l) => l.band)).toEqual([...BANDS]);
      for (const link of links) expect(link.href).toBe(`${bandPath(link.band)}#${slugify(tax.region)}`);
      expect(REGIONS.map(slugify)).toContain(slugify(tax.region));
    }
  });

  it("gives a council outside England no band links", () => {
    const { council, tax } = pages[0];
    expect(bandLinks({ ...council, country: "Scotland" }, tax.region)).toEqual([]);
  });

  it.skipIf(!built)("lands on an id the band page carries, from every built council page", () => {
    const anchors = new Map(BANDS.map((band) => [band, readFileSync(join(DIST, bandPath(band), "index.html"), "utf-8")]));
    const broken: string[] = [];
    for (const { council } of pages) {
      const html = readFileSync(join(DIST, "councils", council.slug, "index.html"), "utf-8");
      const hrefs = [...html.matchAll(/<a href="([^"]+)" data-band-link="([A-H])"/g)];
      if (hrefs.length !== BANDS.length) broken.push(`${council.slug}: ${hrefs.length} band links`);
      for (const [, href, band] of hrefs) {
        const id = href.split("#")[1];
        if (!anchors.get(band as (typeof BANDS)[number])!.includes(`id="${id}"`)) broken.push(`${council.slug}: ${href}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("similar councils", () => {
  it("lists only councils of the same registry type, with a page, never the council itself", () => {
    const withPage = new Set(pages.map((p) => p.council.gss));
    for (const { council } of pages) {
      const similar = similarCouncils(council);
      if (!similar) continue;
      for (const { council: other } of similar.pages) {
        expect(other.type).toBe(council.type);
        expect(other.gss).not.toBe(council.gss);
        expect(withPage.has(other.gss)).toBe(true);
        if (council.type === "Non-metropolitan district" && council.county) expect(other.parentGss).toBe(council.parentGss);
        else expect(other.region).toBe(council.region);
      }
    }
  });

  it("finds neighbours for most councils", () => {
    const found = pages.filter((p) => similarCouncils(p.council) !== null).length;
    expect(found).toBeGreaterThan(pages.length * 0.9);
  });
});

describe("structured data", () => {
  const SOURCES = walk(join(ROOT, "src"), /\.(astro|ts)$/);

  it("carries no FAQPage and no Dataset node in any template", () => {
    const offenders = SOURCES.filter((path) => /FAQPage|"@type":\s*"Dataset"/.test(readFileSync(path, "utf-8")));
    expect(offenders.map((p) => p.replace(`${ROOT}/`, ""))).toEqual([]);
  });

  it("keeps the BreadcrumbList", () => {
    expect(readFileSync(join(ROOT, "src", "components", "Breadcrumbs.astro"), "utf-8")).toContain('"BreadcrumbList"');
  });

  it.skipIf(!built)("puts no FAQPage on any built page", () => {
    const offenders = walk(DIST, /\.html$/).filter((path) => readFileSync(path, "utf-8").includes("FAQPage"));
    expect(offenders.map((p) => p.replace(`${DIST}/`, ""))).toEqual([]);
  });
});

describe("the menu", () => {
  const items = NAV_GROUPS.flatMap((g) => g.items);

  it("keeps every band page in the footer, A to H", () => {
    for (const band of BANDS) expect(FOOTER_LINKS.map((i) => i.href)).toContain(bandPath(band));
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
  });

  it("keeps the increases and next year entries in the council tax group, in order", () => {
    const group = NAV_GROUPS.find((g) => g.label === "Council tax")!.items.map((i) => i.href);
    expect(group.indexOf(INCREASES_PATH)).toBeGreaterThan(-1);
    expect(group.indexOf(NEXT_YEAR_PATH)).toBe(group.indexOf(INCREASES_PATH) + 1);
  });
});

describe("sitemap lastmod", () => {
  const entries = sitemapEntries();
  const byPath = new Map(entries.map((e) => [e.path, e.lastmod]));
  const release = loadYear(CURRENT_YEAR).source.published;

  it("covers exactly the sitemap paths", () => {
    expect(entries.map((e) => e.path).sort()).toEqual(sitemapPaths().sort());
  });

  it("dates council tax pages to the MHCLG release", () => {
    expect(councilTaxRelease()).toBe(release);
    for (const band of BANDS) expect(byPath.get(bandPath(band))).toBe(release);
    expect(byPath.get("/council-tax/")).toBe(release);
  });

  it("gives pages with no dated source no lastmod", () => {
    expect(byPath.get("/about/")).toBeNull();
    expect(byPath.get("/privacy/")).toBeNull();
  });

  it("is never later than the newest date in the data", () => {
    // The build clock would fail this on any day after the data was read.
    for (const { path, lastmod } of entries) {
      if (lastmod) expect(lastmod, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const latest = newest(entries.map((e) => e.lastmod));
    for (const { council, tax } of pages) expect(councilLastmod(council, tax)! <= latest!).toBe(true);
  });

  it("differs between two council pages whose source dates differ", () => {
    // Two councils whose AI DOGE spending summaries carry different dates,
    // both newer than every other source the page draws on.
    const spendingDate = ({ council, tax }: (typeof pages)[number]) => {
      const body = spendingFor(council.gss);
      return body && spendingRecord(tax.name, body) ? body.generated.slice(0, 10) : null;
    };
    const dated = pages.filter((p) => {
      const date = spendingDate(p);
      return date !== null && date === newest([release, date, p.council.reorganisation?.sourceDate, "2026-09-01"]);
    });
    const a = dated[0];
    const b = dated.find((p) => spendingDate(p) !== spendingDate(a))!;
    expect(a && b).toBeTruthy();
    expect(byPath.get(councilPath(a.council))).toBe(spendingDate(a));
    expect(byPath.get(councilPath(b.council))).toBe(spendingDate(b));
    expect(byPath.get(councilPath(a.council))).not.toBe(byPath.get(councilPath(b.council)));
  });

});
