import { BANDS, CURRENT_YEAR, loadYear, type Authority, type Band } from "./council-tax";
import { loadRegistry, type Council } from "./registry";

/**
 * Every programmatic page and the data behind it, in one place, so the pages'
 * getStaticPaths and the sitemap cannot disagree about what exists.
 */

export const REGIONS = [
  "North East",
  "North West",
  "Yorkshire and the Humber",
  "East Midlands",
  "West Midlands",
  "East of England",
  "London",
  "South East",
  "South West",
] as const;
export type Region = (typeof REGIONS)[number];

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const regionSlug = (region: string) => slugify(region);
export const bandSlug = (band: Band) => `band-${band.toLowerCase()}`;

export function regionPath(region: string): string {
  return `/council-tax/${regionSlug(region)}/`;
}

export function bandPath(band: Band): string {
  return `/council-tax/${bandSlug(band)}/`;
}

export function councilPath(council: Council): string {
  return `/councils/${council.slug}/`;
}

export interface CouncilPage {
  council: Council;
  tax: Authority;
}

/**
 * One page per council with a published council tax row this year. A council
 * without one has no page yet: an empty page would be a placeholder.
 */
export function councilPages(): CouncilPage[] {
  const tax = loadYear(CURRENT_YEAR).authorities;
  return Object.values(loadRegistry().councils)
    .filter((council) => tax[council.gss])
    .map((council) => ({ council, tax: tax[council.gss] }))
    .sort((a, b) => a.tax.name.localeCompare(b.tax.name, "en-GB"));
}

export function programmaticPaths(): string[] {
  return [
    ...BANDS.map(bandPath),
    ...REGIONS.map(regionPath),
    ...councilPages().map(({ council }) => councilPath(council)),
  ];
}
