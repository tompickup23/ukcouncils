import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Council tax for England, read from the JSON scripts/fetch-council-tax.mjs
 * writes. Every read resolves from process.cwd(): a module relative read
 * works under node and silently fails under astro build.
 */

export const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type Band = (typeof BANDS)[number];

/** The year every page leads with, and the one before it for the change. */
export const CURRENT_YEAR = "2026-27";
export const PREVIOUS_YEAR = "2025-26";
export const YEARS = ["2024-25", "2025-26", "2026-27"] as const;
export type Year = (typeof YEARS)[number];

export interface Note {
  id: string;
  text: string;
}

export interface OwnFigures {
  table: string;
  name: string;
  bandD: number | null;
  changePct: number | null;
  changePounds: number | null;
  bandDWithParish: number | null;
  ascBandD: number | null;
  ascChangePct: number | null;
  notes: Note[];
}

export interface Authority {
  ecode: string;
  name: string;
  regionCode: string;
  region: string;
  classCode: "ILB" | "OLB" | "MD" | "UA" | "SD";
  class: string;
  area: string | null;
  bands: Record<Band, number>;
  notes: Note[];
  own: OwnFigures | null;
}

export interface PoundsChange {
  pounds: number | null;
  changePct: number | null;
}

export interface YearFile {
  generated: string;
  year: Year;
  source: {
    publisher: string;
    title: string;
    url: string;
    published: string | null;
    updated: string | null;
    licence: string;
    licenceUrl: string;
    files: { title: string; url: string; file: string; sha256: string }[];
    bandTable: string;
    bandTableTitle: string;
    bandTableNotes: Note[];
    ownTables: Record<string, string>;
    notes: Record<string, string>;
    referendumPrinciples: { section: string; text: string; title: string; url: string } | null;
  };
  england: {
    areaBandD?: {
      table: string;
      england: PoundsChange;
      byAreaType: Record<"london" | "metropolitan" | "unitary" | "shire", PoundsChange>;
    };
    history?: { table: string; rows: { year: string; pounds: number | null; changePct: number | null }[] };
    byClass?: { table: string; rows: { class: string; bandD: number | null; changePct: number | null }[] };
  };
  counties: Record<string, OwnFigures>;
  authorities: Record<string, Authority>;
}

const cache = new Map<string, YearFile>();

export function councilTaxPath(year: Year, root = process.cwd()): string {
  return join(root, "data", "council-tax", `england-${year}.json`);
}

export function loadYear(year: Year, root = process.cwd()): YearFile {
  const path = councilTaxPath(year, root);
  const cached = cache.get(path);
  if (cached) return cached;
  if (!existsSync(path)) throw new Error(`${path} is missing. Run npm run data:council-tax.`);
  const data = JSON.parse(readFileSync(path, "utf-8")) as YearFile;
  cache.set(path, data);
  return data;
}

/** A published year label as the site prints it: "2026-27" to "2026/27". */
export function yearLabel(year: string): string {
  return year.replace("-", "/");
}

/** A year label in words, for a source line: "2026-27" to "2026 to 2027". */
export function yearWords(year: string): string {
  return year.replace(/^(\d{4})-(\d{2})$/, (_m, a: string, b: string) => `${a} to 20${b}`);
}

const round = (value: number, places: number) => {
  const f = 10 ** places;
  return Math.round((value + Number.EPSILON) * f) / f;
};

/**
 * The change in one band between two published tables, in pounds and percent.
 * Arithmetic on two published figures, not a modelled value, and stated as
 * calculated wherever it is printed. Null when either year holds no figure for
 * this ONS code; codes are never joined across a reissue, because a reissued
 * code marks a boundary change and the two figures would not be like for like.
 */
export function bandChange(
  ons: string,
  band: Band,
  from: Year = PREVIOUS_YEAR,
  to: Year = CURRENT_YEAR,
  root = process.cwd(),
): { from: number; to: number; pounds: number; pct: number } | null {
  const before = loadYear(from, root).authorities[ons]?.bands[band];
  const after = loadYear(to, root).authorities[ons]?.bands[band];
  if (typeof before !== "number" || typeof after !== "number" || before <= 0) return null;
  const difference = after - before;
  return {
    from: before,
    to: after,
    pounds: round(difference, 2),
    pct: round((difference / before) * 100, 1),
  };
}

/**
 * The annual charge over ten monthly instalments, which is the statutory
 * default and the usual way "per month" is asked. Labelled as arithmetic on
 * the published annual figure wherever it is printed.
 */
export function tenInstalments(annual: number): number {
  return round(annual / 10, 2);
}

/**
 * The annual charge over twelve monthly instalments. Labelled as arithmetic on
 * the published annual figure wherever it is printed; not a published MHCLG
 * figure and not a substitute for the ten instalment default.
 */
export function twelveInstalments(annual: number): number {
  return round(annual / 12, 2);
}

/** MHCLG's published ratios of each band to Band D, from the Table 9 notes. */
export const BAND_RATIO_OF_D: Record<Band, string> = {
  A: "six ninths",
  B: "seven ninths",
  C: "eight ninths",
  D: "nine ninths",
  E: "eleven ninths",
  F: "thirteen ninths",
  G: "fifteen ninths",
  H: "eighteen ninths",
};

/** One sentence saying what a band is, from the Table 9 ratio note. */
export function bandMeaning(band: Band): string {
  if (band === "D") {
    return "Band D is the reference council tax band; every other band is a fixed ratio of Band D under the ratios MHCLG publishes with the band table.";
  }
  return `Band ${band} is charged at ${BAND_RATIO_OF_D[band]} of Band D under the ratios MHCLG publishes with the band table.`;
}

/**
 * The lowest and highest published area charges for one band in one year, read
 * from the authorities already held in Table 9. Both values are published
 * figures for named councils, not an average.
 */
export function bandExtremes(
  band: Band,
  year: Year = CURRENT_YEAR,
  root = process.cwd(),
): {
  lowest: { name: string; ons: string; pounds: number };
  highest: { name: string; ons: string; pounds: number };
} {
  const rows = Object.entries(loadYear(year, root).authorities)
    .map(([ons, authority]) => ({
      ons,
      name: authority.name,
      pounds: authority.bands[band],
    }))
    .filter((row) => typeof row.pounds === "number");
  if (rows.length === 0) {
    throw new Error(`No Table 9 figures for Band ${band} in ${year}.`);
  }
  let lowest = rows[0]!;
  let highest = rows[0]!;
  for (const row of rows) {
    if (row.pounds < lowest.pounds) lowest = row;
    if (row.pounds > highest.pounds) highest = row;
  }
  return { lowest, highest };
}

const POUNDS = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const WHOLE_POUNDS = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** £1,234.56, or n/a for a figure the table does not hold. */
export function pounds(value: number | null | undefined): string {
  return typeof value === "number" ? POUNDS.format(value) : "n/a";
}

/** £1,235 for the England summary tables, which MHCLG publishes to the pound. */
export function wholePounds(value: number | null | undefined): string {
  return typeof value === "number" ? WHOLE_POUNDS.format(value) : "n/a";
}

/** 4.9%, or n/a. */
export function percent(value: number | null | undefined, places = 1): string {
  return typeof value === "number" ? `${value.toFixed(places)}%` : "n/a";
}

/** "up £12.34 (4.9%)", "down £1.00 (0.3%)" or "unchanged". */
export function changePhrase(change: { pounds: number; pct: number }): string {
  if (change.pounds === 0) return "unchanged";
  const direction = change.pounds > 0 ? "up" : "down";
  return `${direction} ${pounds(Math.abs(change.pounds))} (${percent(Math.abs(change.pct))})`;
}

/** Which Table 7 area type an authority's class averages against. */
export function areaTypeFor(classCode: Authority["classCode"]): "london" | "metropolitan" | "unitary" | "shire" {
  if (classCode === "ILB" || classCode === "OLB") return "london";
  if (classCode === "MD") return "metropolitan";
  if (classCode === "UA") return "unitary";
  return "shire";
}

export const AREA_TYPE_LABEL = {
  london: "London",
  metropolitan: "metropolitan areas",
  unitary: "unitary areas",
  shire: "shire areas",
} as const;
