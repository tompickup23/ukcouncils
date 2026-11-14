import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineMapIndicators } from '../vendor/estate-kit/dist/src/index.js';
import type { AreaFeature } from '../vendor/estate-kit/dist/src/charts/grammar/geo.js';
import { boundarySource } from './boundaries';
import { CURRENT_YEAR, loadYear, yearLabel } from './council-tax';
import { councilPages, councilPath } from './paths';
import { councilTaxSource, longDate } from './sources';

/**
 * The map of England on /councils/ (NV8, decision W2 of 11 November 2026): every
 * billing council coloured by its class, never by a tax figure. England only.
 *
 * The classes are fixed here and do not move with the data: four, in the order the
 * picker's type chips use, keyed from the class column of MHCLG's band table (Table 9).
 * MHCLG splits London into inner and outer boroughs and puts the City of London with
 * the inner ones ("Inner London Boroughs including City", Table 2); the site's tax
 * comparisons already join the two as one London group, and so does this map. A class
 * code not listed here is drawn as Unknown, never as one of the four.
 */
export const COUNCIL_CLASSES = [
  { id: 'unitary', label: 'Unitary authority', codes: ['UA'] },
  { id: 'shire-district', label: 'Shire district', codes: ['SD'] },
  { id: 'metropolitan-district', label: 'Metropolitan district', codes: ['MD'] },
  { id: 'london', label: 'London borough or the City of London', codes: ['ILB', 'OLB'] },
] as const;

export const CLASS_REGISTRY = defineMapIndicators({
  class: { kind: 'categorical', label: 'Class of council', categories: COUNCIL_CLASSES.map(({ id, label }) => ({ id, label })) },
});

export function classFor(code: string | null | undefined): string | null {
  return COUNCIL_CLASSES.find(c => (c.codes as readonly string[]).includes(code ?? ''))?.id ?? null;
}

/**
 * Sub pixel simplification. The ONS file is generalised to 0.001 degrees, far finer
 * than a pixel on a 600 unit map of England, and drawn whole it adds about 625 KB to
 * the page. Douglas Peucker at TOLERANCE degrees (longitude scaled by cos 52 degrees,
 * so the step is about 0.4 km, or a third of a map unit) drops the points no screen
 * can show. No area is dropped and every ring keeps at least four points; a ring
 * that would fall below that is kept as published.
 */
export const TOLERANCE = 0.004;
const K = Math.cos((52 * Math.PI) / 180);
type Ring = number[][];
/** The indices Douglas Peucker keeps, so the points drawn are the published ones exactly. */
function douglasPeucker(points: Ring, tol: number): Uint8Array {
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [x1, y1] = points[a], [x2, y2] = points[b];
    const dx = x2 - x1, dy = y2 - y1, length = dx * dx + dy * dy;
    let worst = -1, far = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = points[i];
      const t = length ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / length)) : 0;
      const d = (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2;
      if (d > far) { far = d; worst = i; }
    }
    if (worst >= 0 && far > tol * tol) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  return keep;
}
export function simplifyRing(ring: Ring, tol = TOLERANCE): Ring {
  const keep = douglasPeucker(ring.map(([x, y]) => [x * K, y]), tol);
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 4 ? out : ring;
}

interface RawArea { properties: { LAD26CD: string; LAD26NM: string }; geometry: AreaFeature['geometry'] }

/** Read whole, not through boundaryAreas(): the kit winds rings itself. */
function rawAreas(): RawArea[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/geography/lad26-england.geojson'), 'utf8')).features;
}

export function classMapData() {
  const pages = councilPages();
  const byGss = new Map(pages.map(page => [page.council.gss, page]));
  const raw = rawAreas();
  // Exact GSS joins in both directions. Any miss stops the build: nothing is patched.
  const unjoined = [
    ...raw.filter(f => !byGss.has(f.properties.LAD26CD)).map(f => `${f.properties.LAD26CD} has no council page`),
    ...pages.filter(p => !raw.some(f => f.properties.LAD26CD === p.council.gss)).map(p => `${p.council.gss} ${p.tax.name} has no boundary`),
  ];
  if (unjoined.length) throw new Error(`Council class map: GSS join failed:\n${unjoined.join('\n')}`);
  const areas: AreaFeature[] = raw.map(f => {
    const g = f.geometry;
    const geometry = g.type === 'Polygon'
      ? { type: 'Polygon' as const, coordinates: g.coordinates.map(r => simplifyRing(r)) }
      : { type: 'MultiPolygon' as const, coordinates: g.coordinates.map(p => p.map(r => simplifyRing(r))) };
    return { type: 'Feature', properties: { code: f.properties.LAD26CD, name: byGss.get(f.properties.LAD26CD)!.tax.name }, geometry };
  });
  const categories = Object.fromEntries(areas.map(a => [a.properties.code, classFor(byGss.get(a.properties.code)!.tax.classCode)]));
  const links = Object.fromEntries(areas.map(a => [a.properties.code, councilPath(byGss.get(a.properties.code)!.council)]));
  const data = loadYear(CURRENT_YEAR);
  const site = councilTaxSource(CURRENT_YEAR, data.source.bandTable);
  return {
    areas, categories, links,
    year: yearLabel(CURRENT_YEAR),
    count: areas.length,
    unknown: Object.values(categories).filter(c => c === null).length,
    source: { publisher: site.publisher, title: site.title, table: site.table, edition: longDate(site.date) ?? yearLabel(CURRENT_YEAR), url: site.url },
    siteSource: site,
    boundaryCredit: `Boundaries: ${boundarySource.publisher}, ${boundarySource.title}, simplified for drawing.`,
    boundary: boundarySource,
  };
}
