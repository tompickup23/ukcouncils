import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadYear, CURRENT_YEAR } from "../src/lib/council-tax";
import { PROFILE_SECTIONS, councilProfile } from "../src/lib/council-profile";
import { councilPages, type CouncilPage } from "../src/lib/paths";
import { loadRegistry } from "../src/lib/registry";
import { spendingFor, spendingRecord } from "../src/lib/spending";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const built = existsSync(join(DIST, "councils"));

/** Lancashire's fifteen councils by GSS code: the county, two unitaries and twelve districts. */
const LANCASHIRE_COUNTY = "E10000017";
const LANCASHIRE_UNITARIES = ["E06000008", "E06000009"];
const LANCASHIRE_DISTRICTS = [
  "E07000117", "E07000118", "E07000119", "E07000120", "E07000121", "E07000122",
  "E07000123", "E07000124", "E07000125", "E07000126", "E07000127", "E07000128",
];

const pages = councilPages();
const lancashire: CouncilPage[] = pages.filter(
  ({ council }) => LANCASHIRE_UNITARIES.includes(council.gss) || LANCASHIRE_DISTRICTS.includes(council.gss),
);

/** The text of markup as a reader sees it. */
function text(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function page(slug: string): string {
  return readFileSync(join(DIST, "councils", slug, "index.html"), "utf-8");
}

/** The sections a council's data supports, read from the raw files, not through the reader. */
function expectedSections(gss: string, parentGss: string | null): string[] {
  const spending = JSON.parse(readFileSync(join(ROOT, "data", "spending", "aidoge-summaries.json"), "utf-8"));
  const manifest = JSON.parse(readFileSync(join(ROOT, "data", "school-holidays", "manifest.json"), "utf-8"));
  const feed = JSON.parse(readFileSync(join(ROOT, "data", "school-holidays", manifest.file), "utf-8"));
  const bandD = loadYear(CURRENT_YEAR).authorities[gss]?.bands.D;
  const calendar = feed.authorities[parentGss || gss];
  const present: Record<string, boolean> = {
    about: true,
    spending: Boolean(spending.bodies[gss]?.generated),
    "tax-summary": typeof bandD === "number" && bandD > 0,
    "school-holidays": Boolean(calendar && calendar.scope === "authority" && calendar.years[feed.currentYear]),
    sources: true,
  };
  return PROFILE_SECTIONS.filter((id) => present[id]);
}

describe("the Lancashire council profiles", () => {
  it("builds a page for the fourteen Lancashire councils with a council tax row", () => {
    expect(lancashire.map(({ council }) => council.gss).sort()).toEqual(
      [...LANCASHIRE_UNITARIES, ...LANCASHIRE_DISTRICTS].sort(),
    );
  });

  it("builds no page for Lancashire County Council, which the register does not hold", () => {
    expect(loadRegistry().councils[LANCASHIRE_COUNTY]).toBeUndefined();
    expect(pages.some(({ council }) => council.gss === LANCASHIRE_COUNTY)).toBe(false);
  });

  it("gives each council the sections its data supports and none it does not", () => {
    for (const { council, tax } of lancashire) {
      expect(councilProfile(council, tax).sections, council.slug).toEqual(
        expectedSections(council.gss, council.parentGss),
      );
    }
  });

  it("gives every other council the same rule", () => {
    for (const { council, tax } of pages) {
      expect(councilProfile(council, tax).sections, council.slug).toEqual(
        expectedSections(council.gss, council.parentGss),
      );
    }
  });

  it("takes the type from the register as recorded", () => {
    for (const { council, tax } of lancashire) {
      expect(councilProfile(council, tax).about.type).toBe(council.type);
    }
  });

  it("selects the first break not yet ended on the selection date", () => {
    const burnley = lancashire.find(({ council }) => council.slug === "burnley")!;
    const before = councilProfile(burnley.council, burnley.tax, "2026-09-01").termDates;
    const after = councilProfile(burnley.council, burnley.tax, "2099-01-01").termDates;
    expect(before?.next).not.toBeNull();
    expect(before!.next!.end >= "2026-09-01").toBe(true);
    expect(after?.next).toBeNull();
  });

  it("builds no seats, control or election section: no committed file holds them", () => {
    const files = readdirSync(join(ROOT, "data"), { recursive: true }) as string[];
    expect(files.filter((f) => /seat|election|control|councillor/i.test(f))).toEqual([]);
    for (const { council, tax } of lancashire) {
      const profile = councilProfile(council, tax) as unknown as Record<string, unknown>;
      for (const key of ["seats", "control", "elections"]) expect(profile[key]).toBeUndefined();
    }
  });

  it("holds no supplier field in the spending data the reader reads", () => {
    const raw = readFileSync(join(ROOT, "data", "spending", "aidoge-summaries.json"), "utf-8");
    expect(raw).not.toMatch(/"(supplier|suppliers|vendor|payee|creditor|beneficiary)[^"]*"\s*:/i);
  });
});

describe.skipIf(!built)("the built Lancashire council pages", () => {
  it("render exactly the profile sections the data supports", () => {
    for (const { council, tax } of lancashire) {
      const html = page(council.slug);
      const found = [...html.matchAll(/data-profile-section="([^"]+)"/g)].map((m) => m[1]);
      const spending = /data-spending-record/.test(html) ? ["spending"] : [];
      const rendered = PROFILE_SECTIONS.filter((id) => found.includes(id) || spending.includes(id));
      expect(rendered, council.slug).toEqual(councilProfile(council, tax).sections);
      for (const id of ["seats", "who-runs-it", "elections"]) expect(html).not.toContain(`id="${id}"`);
    }
  });

  it("print no supplier string: the spending section holds only the reader's own words", () => {
    for (const { council, tax } of lancashire) {
      const html = page(council.slug);
      const record = spendingRecord(tax.name, spendingFor(council.gss));
      const match = /<section[^>]*data-spending-record[\s\S]*?<\/section>/.exec(html);
      if (!record) {
        expect(match, council.slug).toBeNull();
        continue;
      }
      const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(`${record.source.date}T00:00:00Z`));
      const expected = [
        record.heading,
        ...record.sentences,
        ...(record.caveat ? [record.caveat] : []),
        `${record.link.text}.`,
        `Source: ${record.source.publisher}, ${record.source.title}, ${record.source.table}, published ${date}.`,
      ].join(" ");
      expect(text(match![0]).replace(/ \./g, ".").replace(/ ,/g, ","), council.slug).toBe(expected);
    }
  });

  it("put the parish precept caveat under every Band D figure", () => {
    for (const { council } of lancashire) {
      const html = page(council.slug).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
      const starts = [...html.matchAll(/<[^>]*\sdata-fact\b[^>]*>/g)].map((m) => m.index!);
      let checked = 0;
      for (const [i, start] of starts.entries()) {
        const sectionEnd = html.indexOf("</section>", start);
        const end = Math.min(starts[i + 1] ?? html.length, sectionEnd === -1 ? html.length : sectionEnd);
        const segment = html.slice(start, end);
        const beforeSource = text(segment.split(/class="source-line/)[0]);
        const label = text(/class="fact-label">([\s\S]*?)<\/span>/.exec(segment)?.[1] ?? "");
        if (!/Band D/.test(beforeSource) || /^Change on/.test(label)) continue;
        checked += 1;
        expect(text(segment), `${council.slug}: ${beforeSource.slice(0, 80)}`).toMatch(/parish/i);
      }
      expect(checked, council.slug).toBeGreaterThan(2);
    }
  });

  it("list every source a figure on the page cites in the sources section", () => {
    for (const { council } of lancashire) {
      const html = page(council.slug);
      const list = /<ul[^>]*data-profile-sources[\s\S]*?<\/ul>/.exec(html)?.[0] ?? "";
      const listed = new Set([...list.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
      const cited = new Set(
        [...html.matchAll(/class="source-line[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"/g)].map((m) => m[1]),
      );
      const missing = [...cited].filter((href) => !listed.has(href));
      expect(missing, council.slug).toEqual([]);
    }
  });
});
