import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNCIL_CLASSES, TOLERANCE, classFor, classMapData, simplifyRing } from '../src/lib/council-class-map';
import { englishRows } from '../src/lib/council-picker';
import { councilPages } from '../src/lib/paths';

const data = classMapData();
const raw = JSON.parse(readFileSync(join(process.cwd(), 'data/geography/lad26-england.geojson'), 'utf8')).features;

describe('the council class map on /councils/', () => {
  it('joins all 296 boundaries to council pages by exact GSS code, both ways', () => {
    expect(data.count).toBe(296);
    expect(councilPages()).toHaveLength(296);
    expect(new Set(data.areas.map(a => a.properties.code))).toEqual(new Set(councilPages().map(p => p.council.gss)));
  });

  it('keeps the four classes fixed, in the picker order, with no class left unknown this year', () => {
    expect(COUNCIL_CLASSES.map(c => [c.id, c.label, [...c.codes]])).toEqual([
      ['unitary', 'Unitary authority', ['UA']],
      ['shire-district', 'Shire district', ['SD']],
      ['metropolitan-district', 'Metropolitan district', ['MD']],
      ['london', 'London borough or the City of London', ['ILB', 'OLB']],
    ]);
    expect(data.unknown).toBe(0);
    expect(classFor('SC')).toBeNull();
    expect(classFor(null)).toBeNull();
  });

  it('agrees with the picker type of every council, so the map and the type chips say the same thing', () => {
    const chip: Record<string, string> = { 'Unitary authority': 'unitary', 'Shire district': 'shire-district', 'Metropolitan district': 'metropolitan-district', 'London borough': 'london' };
    for (const row of englishRows()) expect(data.categories[row.gss], row.name).toBe(chip[row.type]);
  });

  it('draws the City of London and the Isles of Scilly in the classes MHCLG gives them', () => {
    expect(data.categories.E09000001).toBe('london');
    expect(data.categories.E06000053).toBe('unitary');
  });

  it('simplifies below a pixel: no area dropped and every dropped point within the tolerance of the drawn line', () => {
    expect(TOLERANCE).toBe(0.004);
    const K = Math.cos((52 * Math.PI) / 180);
    const original = new Map<string, { type: string; coordinates: number[][][] | number[][][][] }>(raw.map((f: { properties: { LAD26CD: string }; geometry: { type: string; coordinates: number[][][] } }) => [f.properties.LAD26CD, f.geometry]));
    const rings = (g: { type: string; coordinates: unknown }) => (g.type === 'Polygon' ? [g.coordinates as number[][][]] : g.coordinates as number[][][][]).flat();
    let before = 0, after = 0, worst = 0;
    for (const area of data.areas) {
      const was = rings(original.get(area.properties.code)!), now = rings(area.geometry);
      expect(now.length, area.properties.name).toBe(was.length);
      for (const [r, ring] of was.entries()) {
        const kept = now[r];
        before += ring.length; after += kept.length;
        // The simplified ring is a subsequence of the published one; walk both together.
        let k = 0;
        for (const point of ring) {
          if (k < kept.length && point[0] === kept[k][0] && point[1] === kept[k][1]) { k++; continue; }
          const [a, b] = [kept[k - 1], kept[k]];
          const [px, py, ax, ay, bx, by] = [point[0] * K, point[1], a[0] * K, a[1], b[0] * K, b[1]];
          const dx = bx - ax, dy = by - ay, length = dx * dx + dy * dy;
          const t = length ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length)) : 0;
          worst = Math.max(worst, Math.hypot(px - ax - t * dx, py - ay - t * dy));
        }
        expect(k, area.properties.name).toBe(kept.length);
      }
    }
    expect(worst).toBeLessThanOrEqual(TOLERANCE);
    expect(after / before).toBeLessThan(0.6);
  });

  it('keeps a ring as published when simplifying would leave fewer than four points', () => {
    const tiny = [[0, 0], [0.0001, 0], [0.0001, 0.0001], [0, 0.0001], [0, 0]];
    expect(simplifyRing(tiny)).toEqual(tiny);
  });

});
