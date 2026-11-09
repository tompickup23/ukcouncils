import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The council spine written by scripts/build-registry.mjs: UK Places' 361
 * local authorities with the sister site links that passed both the identity
 * and the live sitemap test. Read from process.cwd().
 */

export const SISTER_SITES = {
  ukelections: "UK Elections",
  ukdemographics: "UK Demographics",
  aidoge: "AI DOGE",
  asylumstats: "Asylum Stats",
  ukfoodhygiene: "UK Food Hygiene",
} as const;
export type SisterSite = keyof typeof SISTER_SITES;

export interface Council {
  gss: string;
  slug: string;
  name: string;
  officialName: string;
  type: string;
  country: "England" | "Scotland" | "Wales" | "Northern Ireland";
  region: string;
  county: string | null;
  parentGss: string | null;
  reorganisation: { status: string; note: string; sourceUrl: string; sourceDate: string } | null;
  sisters: Record<SisterSite, string | null>;
}

export interface Registry {
  generated: string;
  source: {
    spine: string;
    mappings: string[];
    sitemaps: Record<SisterSite, { name: string; sitemap: string; urls: number }>;
    rule: string;
  };
  counts: Record<SisterSite, number>;
  councils: Record<string, Council>;
}

let cached: Registry | null = null;

export function registryPath(root = process.cwd()): string {
  return join(root, "data", "registry", "councils.json");
}

export function loadRegistry(root = process.cwd()): Registry {
  if (cached && root === process.cwd()) return cached;
  const path = registryPath(root);
  if (!existsSync(path)) throw new Error(`${path} is missing. Run npm run data:registry.`);
  const data = JSON.parse(readFileSync(path, "utf-8")) as Registry;
  if (root === process.cwd()) cached = data;
  return data;
}

export function councilByGss(gss: string): Council | undefined {
  return loadRegistry().councils[gss];
}

export function councilBySlug(slug: string): Council | undefined {
  return Object.values(loadRegistry().councils).find((c) => c.slug === slug);
}

/** The sister links a council has, in a fixed order, for a "more on this place" list. */
export interface SisterLink {
  site: SisterSite;
  name: string;
  url: string;
}

export function sisterLinks(council: Council): SisterLink[] {
  const links: SisterLink[] = [];
  for (const site of Object.keys(SISTER_SITES) as SisterSite[]) {
    // Not linked from this site: the sister block is the four sites Tom confirmed on
    // 8 November 2026 plus UK Council Tax. UK Food Hygiene has been public since 6 October 2026.
    if (site === "ukfoodhygiene") continue;
    // No Asylum Stats link from UK Councils for now (Tom, 8 November 2026).
    if (site === "asylumstats") continue;
    const url = council.sisters[site];
    if (typeof url === "string") links.push({ site, name: SISTER_SITES[site], url });
  }
  return links;
}
