import { BANDS, type Band } from "./council-tax";
import { bandPath, councilPages, slugify, type CouncilPage } from "./paths";
import type { Council } from "./registry";

/**
 * The link blocks on a council page: the eight band pages for the council's
 * nation, and the councils of the same type nearby. Every join is on a
 * registry field (country, type, parentGss, region), never on a name.
 */

export interface BandLink {
  band: Band;
  href: string;
}

/**
 * The band pages that serve a council's nation. The site publishes bands for
 * England only, so a council elsewhere has none and the block is absent. The
 * band pages group their rows by region and give each region section an id,
 * so the link lands on the section that holds the council's row.
 */
export function bandLinks(council: Council, region: string): BandLink[] {
  if (council.country !== "England") return [];
  return BANDS.map((band) => ({ band, href: `${bandPath(band)}#${slugify(region)}` }));
}

const TYPE_PLURAL: Record<string, string> = {
  "Unitary authority": "unitary authorities",
  "Non-metropolitan district": "non-metropolitan districts",
  "Metropolitan district": "metropolitan districts",
  "London borough": "London boroughs",
};

export interface SimilarCouncils {
  /** "Other metropolitan districts in North West". */
  heading: string;
  pages: CouncilPage[];
}

/**
 * Councils of the same registry type that have a page. A district is listed
 * with the other districts of its county (the registry's parentGss); every
 * other type with the others of its region. Sorted by name, the council itself
 * left out. Null when there is no such council.
 */
export function similarCouncils(council: Council): SimilarCouncils | null {
  const byCounty = council.type === "Non-metropolitan district" && council.parentGss !== null && council.county !== null;
  const pages = councilPages().filter(({ council: other }) =>
    other.gss !== council.gss
    && other.type === council.type
    && (byCounty ? other.parentGss === council.parentGss : other.region === council.region));
  if (pages.length === 0) return null;
  const place = byCounty ? council.county : council.region;
  const plural = TYPE_PLURAL[council.type] ?? `councils of type ${council.type.toLowerCase()}`;
  return { heading: `Other ${plural} in ${place}`, pages };
}
