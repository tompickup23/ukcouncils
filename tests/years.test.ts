import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  CURRENT_YEAR,
  NEXT_YEAR,
  NEXT_YEAR_RELEASE,
  PREVIOUS_YEAR,
  YEARS,
  councilTaxPath,
  followingYear,
  precedingYear,
  yearAnchor,
  yearLabel,
  yearWords,
} from "../src/lib/council-tax";
import { INCREASES_PATH, NAV_GROUPS, NEXT_YEAR_PATH, STATIC_PATHS } from "../src/lib/site";
import { sitemapPaths } from "../src/pages/sitemap.xml";

const ROOT = resolve(import.meta.dirname, "..");
const rel = (path: string) => path.replace(`${ROOT}/`, "");

function walk(dir: string, pattern: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, pattern, out);
    else if (pattern.test(entry.name)) out.push(path);
  }
  return out;
}

describe("the year variable", () => {
  it("leads with the last year in YEARS and compares with the one before it", () => {
    expect(CURRENT_YEAR).toBe(YEARS[YEARS.length - 1]);
    expect(PREVIOUS_YEAR).toBe(precedingYear(CURRENT_YEAR));
    expect(YEARS).toContain(PREVIOUS_YEAR);
  });

  it("holds consecutive years, each with its data file", () => {
    YEARS.forEach((year, i) => {
      expect(year).toMatch(/^\d{4}-\d{2}$/);
      if (i > 0) expect(year).toBe(followingYear(YEARS[i - 1]));
      expect(existsSync(councilTaxPath(year)), `${year} has no data file`).toBe(true);
    });
  });

  it("names the next year as a label only, with no data file behind it", () => {
    expect(NEXT_YEAR).toBe(followingYear(CURRENT_YEAR));
    expect(precedingYear(NEXT_YEAR)).toBe(CURRENT_YEAR);
    expect(YEARS as readonly string[]).not.toContain(NEXT_YEAR);
    expect(existsSync(join(ROOT, "data", "council-tax", `england-${NEXT_YEAR}.json`))).toBe(false);
  });

  it("rolls over the century boundary of the short year", () => {
    expect(followingYear("2098-99")).toBe("2099-00");
    expect(precedingYear("2100-01")).toBe("2099-00");
  });

  it("is written once: no template under src hard-codes a year label", () => {
    // Year labels are "2026-27", "2026/27", "2026/2027" and "2026 to 2027". An ISO date
    // ("2026-03-31") is not one. The year and its data readers hold them; a
    // page reads CURRENT_YEAR, YEARS or NEXT_YEAR and formats the label.
    const LABEL = /\b20\d{2}[-/]\d{2}\b(?!-\d)|\b20\d{2}\/20\d{2}\b|\b20\d{2} to 20\d{2}\b/g;
    const DATA_READERS = new Set(["src/lib/council-tax.ts", "src/lib/spending.ts", "src/lib/school-holidays.ts"]);
    // Each exception is one exact string in one file, so a new year label in
    // the same file still fails.
    const EXCEPTIONS: Record<string, string[]> = {
      // A fixed historical fact about two named tables, not the current year.
      "src/pages/methodology.astro": ["2024 to 2025", "2025 to 2026"],
    };
    const offenders: string[] = [];
    for (const path of walk(join(ROOT, "src"), /\.(astro|ts|tsx|js|mjs)$/)) {
      const file = rel(path);
      if (DATA_READERS.has(file)) continue;
      for (const [i, line] of readFileSync(path, "utf-8").split("\n").entries()) {
        // These are dated programme status identifiers, not financial year labels.
        const prose = file === 'src/lib/reorganisation.ts' ? line.replace(/'withdrawn-2026-(?:09|10)'/g, "'withdrawn-status'") : line;
        for (const [label] of prose.matchAll(LABEL)) {
          if (!EXCEPTIONS[file]?.includes(label)) offenders.push(`${file}:${i + 1} ${label}`);
        }
      }
    }
    expect(offenders, `year labels written into templates: ${offenders.join(", ")}`).toEqual([]);
  });

  it("builds the hub paths and the menu from the year", () => {
    expect(NEXT_YEAR_PATH).toBe(`/council-tax-${NEXT_YEAR}/`);
    expect(STATIC_PATHS).toContain(INCREASES_PATH);
    expect(STATIC_PATHS).toContain(NEXT_YEAR_PATH);
    const paths = sitemapPaths();
    expect(paths).toContain(INCREASES_PATH);
    expect(paths).toContain(NEXT_YEAR_PATH);
    const labels = NAV_GROUPS.flatMap((g) => g.items).map((item) => `${item.href} ${item.label} ${item.desc}`);
    expect(labels.some((l) => l.startsWith(`${NEXT_YEAR_PATH} Council tax ${yearLabel(NEXT_YEAR)}`))).toBe(true);
    expect(labels.some((l) => l.startsWith(INCREASES_PATH) && l.includes(yearLabel(CURRENT_YEAR)))).toBe(true);
  });
});

describe("the evergreen increases page", () => {
  const page = readFileSync(join(ROOT, "src", "pages", "council-tax", "increases.astro"), "utf-8");
  const section = readFileSync(join(ROOT, "src", "components", "IncreasesYear.astro"), "utf-8");

  it("carries no year in its URL and renders one section per year in YEARS", () => {
    expect(INCREASES_PATH).not.toMatch(/\d/);
    expect(page).toContain("YEARS");
    expect(page).toMatch(/years\.map\(\(y\) => <IncreasesYear year=\{y\} \/>\)/);
    expect(section).toContain("id={yearAnchor(yearCode)}");
    expect(yearAnchor("2026-27")).toBe("year-2026-27");
  });

  it("titles the page with the place and the years it covers", () => {
    expect(page).toContain("title={`Council tax rises in England, ${earliest} to ${year}");
  });
});

describe("the old increases URL", () => {
  const OLD = "/council-tax/rises-2026-27/";
  const redirects = readFileSync(join(ROOT, "public", "_redirects"), "utf-8")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => line.trim().split(/\s+/));

  it("is a 301 to the 2026/27 section of the increases page, with and without the slash", () => {
    const target = `${INCREASES_PATH}#${yearAnchor("2026-27")}`;
    expect(redirects).toContainEqual([OLD, target, "301"]);
    expect(redirects).toContainEqual([OLD.replace(/\/$/, ""), target, "301"]);
    expect(YEARS as readonly string[]).toContain("2026-27");
  });

  it("has no page of its own and is not in the sitemap", () => {
    expect(existsSync(join(ROOT, "src", "pages", "council-tax", "rises-2026-27.astro"))).toBe(false);
    expect(STATIC_PATHS as readonly string[]).not.toContain(OLD);
    expect(sitemapPaths()).not.toContain(OLD);
  });

  it("is not linked from the menu or from any page this change owns", () => {
    expect(NAV_GROUPS.flatMap((g) => g.items).map((i) => i.href)).not.toContain(OLD);
    for (const file of ["src/pages/index.astro", "src/pages/council-tax/increases.astro", "src/lib/site.ts"]) {
      expect(readFileSync(join(ROOT, file), "utf-8"), file).not.toContain(OLD);
    }
  });
});

describe("the next year page", () => {
  const source = readFileSync(join(ROOT, "src", "pages", "council-tax-[year].astro"), "utf-8");
  const POUND = /£|&pound;|&#163;|&#x[aA]3;|\\u00a3/;

  it("prints no pound sign and calls no money formatter", () => {
    expect(source).not.toMatch(POUND);
    expect(source).not.toMatch(/\b(pounds|wholePounds|percent|loadYear|bandChange)\b/);
  });

  it("says no projected, typical or estimated figure is shown", () => {
    expect(source).toContain("there is no projected, typical or");
    expect(source).toContain("estimated amount for any council or band");
  });

  it("names the year in the title and description and says the figures are not yet set", () => {
    expect(source).toContain("title={`Council tax ${next} in England: figures not yet set`}");
    expect(source).toMatch(/description=\{`Council tax for \$\{next\} is not yet set\./);
  });

  it("cites the GOV.UK announcement for the next year, with its release date and access date", () => {
    expect(NEXT_YEAR_RELEASE.title).toContain(yearWords(NEXT_YEAR));
    expect(NEXT_YEAR_RELEASE.url).toBe(
      `https://www.gov.uk/government/statistics/announcements/council-tax-levels-set-by-local-authorities-in-england-${yearWords(NEXT_YEAR).replace(/ /g, "-")}`,
    );
    expect(NEXT_YEAR_RELEASE.release).toMatch(/\b20\d{2}\b/);
    expect(NEXT_YEAR_RELEASE.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(source).toContain("{release.release}");
    expect(source).toContain("accessed {longDate(release.accessed)}");
  });

  const built = join(ROOT, "dist", NEXT_YEAR_PATH, "index.html");
  it.skipIf(!existsSync(built))("builds without a pound sign anywhere in the page", () => {
    const html = readFileSync(built, "utf-8");
    expect(html).not.toMatch(POUND);
    expect(html).toContain(`<title>Council tax ${yearLabel(NEXT_YEAR)} in England: figures not yet set | UK Councils</title>`);
  });
});
