import { boundaryAreas } from './boundaries';
import { similarCouncils } from './council-links';
import { councilPages, councilPath, type CouncilPage } from './paths';
import type { Council } from './registry';

/**
 * Two areas are neighbours when their outlines touch or cross in the pinned
 * file. The file is clipped to the coastline and each outline was simplified
 * on its own (0.001 degrees, five decimal places), so two councils with a
 * common border do not always keep an identical point: matching points alone
 * misses pairs whose simplified outlines cross. This is not a distance or
 * travel-time search, and no gap between outlines is bridged.
 *
 * Coordinates are scaled to whole units of 0.00001 degrees, so every
 * orientation test below is exact integer arithmetic.
 */
type Point = readonly [number, number];
interface Outline { code: string; box: [number, number, number, number]; segments: [Point, Point][] }

const scale = (value: number) => Math.round(value * 1e5);
const orient = (a: Point, b: Point, c: Point) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
const within = (a: Point, b: Point, c: Point) =>
  Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1]);

/** Closed segments: a shared end point or a point lying on the other segment counts. */
export function segmentsMeet(a: Point, b: Point, c: Point, d: Point): boolean {
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  return (o1 === 0 && within(a, b, c)) || (o2 === 0 && within(a, b, d))
    || (o3 === 0 && within(c, d, a)) || (o4 === 0 && within(c, d, b));
}

function outlines(): Outline[] {
  return boundaryAreas().map(feature => {
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    const segments: [Point, Point][] = [];
    const box: Outline['box'] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const polygon of polygons) for (const ring of polygon) {
      const points = ring.map(([x, y]): Point => [scale(x), scale(y)]);
      for (const [x, y] of points) {
        box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y);
        box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y);
      }
      for (let i = 1; i < points.length; i++) segments.push([points[i - 1], points[i]]);
    }
    return { code: feature.properties.LAD26CD, box, segments };
  });
}

function outlinesMeet(a: Outline, b: Outline): boolean {
  if (a.box[2] < b.box[0] || b.box[2] < a.box[0] || a.box[3] < b.box[1] || b.box[3] < a.box[1]) return false;
  for (const [p, q] of a.segments) {
    if (Math.max(p[0], q[0]) < b.box[0] || Math.min(p[0], q[0]) > b.box[2]
      || Math.max(p[1], q[1]) < b.box[1] || Math.min(p[1], q[1]) > b.box[3]) continue;
    for (const [r, s] of b.segments) if (segmentsMeet(p, q, r, s)) return true;
  }
  return false;
}

let touching: Map<string, Set<string>> | undefined;
export function touchingAreas(): Map<string, Set<string>> {
  if (touching) return touching;
  const all = outlines();
  const result = new Map<string, Set<string>>(all.map(outline => [outline.code, new Set<string>()]));
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    if (!outlinesMeet(all[i], all[j])) continue;
    result.get(all[i].code)!.add(all[j].code);
    result.get(all[j].code)!.add(all[i].code);
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
