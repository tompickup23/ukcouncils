import { boundaryAreas } from './boundaries';
import { similarCouncils } from './council-links';
import { councilPages, councilPath, type CouncilPage } from './paths';
import type { Council } from './registry';

/**
 * Ported from UK Council Tax's game neighbours. Two areas touch when they
 * share a boundary point at the pinned file's five decimal places. The file
 * is clipped to the coastline: this is not a distance or travel-time search.
 */
let touching: Map<string, Set<string>> | undefined;
export function touchingAreas(): Map<string, Set<string>> {
  if (touching) return touching;
  const points = new Map<string, Set<string>>();
  const result = new Map<string, Set<string>>();
  for (const feature of boundaryAreas()) {
    const code = feature.properties.LAD26CD;
    result.set(code, new Set());
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) for (const ring of polygon) for (const [x, y] of ring) {
      const key = `${x.toFixed(5)},${y.toFixed(5)}`;
      const codes = points.get(key) ?? new Set<string>();
      codes.add(code);
      points.set(key, codes);
    }
  }
  for (const codes of points.values()) {
    for (const a of codes) for (const b of codes) {
      if (a !== b) result.get(a)!.add(b);
    }
  }
  touching = result;
  return result;
}

export interface NearbyCouncil {
  gss: string;
  name: string;
  type: string;
  href: string;
}

/** Names and types only. Geographic proximity does not imply comparable bills. */
function link({ council, tax }: CouncilPage): NearbyCouncil {
  return { gss: council.gss, name: tax.name, type: council.type, href: councilPath(council) };
}

export function nearbyCouncils(council: Council) {
  const codes = touchingAreas().get(council.gss);
  if (!codes) throw new Error(`No pinned boundary for ${council.gss}`);
  const pages = councilPages();
  const neighbours = pages.filter(({ council: other }) => codes.has(other.gss)).map(link);
  if (neighbours.length !== codes.size) throw new Error(`Neighbour without a profile for ${council.gss}`);
  const county = council.type === 'Non-metropolitan district' && council.parentGss && council.county
    ? council.county : null;
  const sameCounty = county ? pages.filter(({ council: other }) =>
    other.gss !== council.gss && other.type === 'Non-metropolitan district'
    && other.parentGss === council.parentGss).map(link) : [];
  const similar = similarCouncils(council);
  // A district's similar list is precisely its same-county list. Render it once.
  return {
    neighbours, county, sameCounty,
    similar: similar ? { heading: similar.heading, councils: similar.pages.map(link) } : null,
  };
}
